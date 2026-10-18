// OKUNAMI agent service. One endpoint that any card (OKUNAMI or standalone) can call through the embed snippet.
// POST { key, visitor, messages: [{role, content}] }  ->  { reply, ai, paused }
// Order of work, cheapest first: origin check -> visitor limit -> saved answers (free) -> balance and daily cap -> AI call -> log.
// Needs secrets: ANTHROPIC_API_KEY, AGENT_MODEL (and model_rates in ag_settings). With any of them missing the AI step stays off
// and visitors get the fallback message, never an error and never a charge.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { costMicros, DEFAULT_LIMITS, matchFaq, originAllowed, reserveMicros, trimHistory, withMarkup, type Faq, type Limits, type Rate } from '../_shared/agent-core.ts';

const db = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const FALLBACK = 'Thanks for your message. The assistant is resting right now, so please use the contact buttons on this card and the owner will get back to you.';

async function sha256(s: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const cors: Record<string, string> = {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  const out = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return out({ error: 'Use POST.' }, 405);

  const sb = db();
  const reqId = crypto.randomUUID();
  try {
    const body = await req.json().catch(() => ({}));
    const key = String(body.key ?? '');
    if (!key) return out({ error: 'Missing key.' }, 400);

    // 1. Site and origin. Closed by default: a site with no allowed addresses answers nobody.
    const { data: site } = await sb.from('ag_sites').select('id, account_id, enabled, allowed_origins').eq('public_key', key).maybeSingle();
    if (!site || !site.enabled || !originAllowed(origin, site.allowed_origins ?? [])) return out({ error: 'Not available.' }, 403);

    // 2. Settings (all adjustable in ag_settings, nothing hard-coded).
    const { data: rows } = await sb.from('ag_settings').select('key, value');
    const S: Record<string, any> = Object.fromEntries((rows ?? []).map((r: any) => [r.key, r.value]));
    const limits: Limits = { ...DEFAULT_LIMITS, ...(S.limits ?? {}) };
    const markup = Number(S.markup_multiplier ?? 2) || 2;

    const messages = trimHistory(body.messages, limits.max_turns);
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user') return out({ error: 'Send a question.' }, 400);

    // 3. Per-visitor limit (counts free answers too, so nobody can hammer the service).
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
    const visitor = await sha256(`${String(body.visitor ?? '').slice(0, 64)}|${ip}|${key}`);
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await sb.from('ag_usage').select('id', { count: 'exact', head: true }).eq('site_id', site.id).eq('visitor_hash', visitor).gte('created_at', since);
    if ((count ?? 0) >= limits.visitor_msgs_per_hour) return out({ reply: 'You have sent a lot of messages. Please try again a little later or use the contact buttons on this card.', ai: false, paused: false });

    // 4. The site's assistant.
    const { data: agent } = await sb.from('ag_agents').select('id, config').eq('site_id', site.id).eq('enabled', true).in('kind', ['assistant', 'custom']).order('id', { ascending: true }).limit(1).maybeSingle();
    const cfg = (agent?.config ?? {}) as { business?: string; faqs?: Faq[]; fallback?: string; max_reply_tokens?: number };
    const log = (row: Record<string, unknown>) => sb.from('ag_usage').insert({ account_id: site.account_id, site_id: site.id, agent_id: agent?.id ?? null, visitor_hash: visitor, ...row });
    if (!agent) return out({ reply: FALLBACK, ai: false, paused: true });

    // 5. Saved answers first. Free, instant, and always correct for what the owner wrote.
    const hit = matchFaq(last.content, cfg.faqs ?? []);
    if (hit) { await log({ answered_without_ai: true }); return out({ reply: hit.a, ai: false, paused: false }); }

    // 6. AI step. Anything missing means "paused": no error shown, no charge, lead-capture message instead.
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const model = Deno.env.get('AGENT_MODEL');
    const rate: Rate | undefined = model ? S.model_rates?.[model] : undefined;
    const pause = async () => { await log({ answered_without_ai: true }); return out({ reply: cfg.fallback || FALLBACK, ai: false, paused: true }); };
    if (!apiKey || !model || !rate || !(rate.in > 0) || !(rate.out > 0)) return await pause();

    const maxOut = Math.min(Number(cfg.max_reply_tokens) || limits.max_reply_tokens, limits.max_reply_tokens);
    const system = [
      { type: 'text', text: 'You are the website assistant for a small business. Answer briefly (a few sentences), warm and plain, only from the business information below. If the answer is not there, say the owner will follow up and invite the visitor to use the contact buttons. Reply in the visitor\'s language. Never invent prices, hours or promises.' },
      { type: 'text', text: `Business information:\n${String(cfg.business ?? '').slice(0, 6000)}`, cache_control: { type: 'ephemeral' } },
    ];
    const inputChars = system.reduce((n, b) => n + b.text.length, 0) + messages.reduce((n, m) => n + m.content.length, 0);

    // 7. Reserve the worst case first (atomic, checks balance and the owner's daily cap), settle to the real cost after.
    const reserve = reserveMicros(rate, inputChars, maxOut, markup);
    const { data: ok } = await sb.rpc('ag_charge', { p_account: site.account_id, p_amount: reserve, p_ref: reqId, p_kind: 'usage' });
    if (!ok) return await pause();

    const refund = (amount: number, ref: string) => amount > 0 ? sb.from('ag_ledger').insert({ account_id: site.account_id, kind: 'refund', amount_micros: amount, ref }) : Promise.resolve();
    let r: Response;
    try {
      r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: maxOut, system, messages }),
        signal: AbortSignal.timeout(25_000),
      });
    } catch (e) { await refund(reserve, reqId); console.error('agent-chat fetch', e); return await pause(); }
    if (!r.ok) { await refund(reserve, reqId); console.error('agent-chat model', r.status); return await pause(); }

    const j = await r.json();
    const u = j.usage ?? {};
    const cost = costMicros(rate, { input: u.input_tokens ?? 0, output: u.output_tokens ?? 0, cacheRead: u.cache_read_input_tokens ?? 0, cacheWrite: u.cache_creation_input_tokens ?? 0 });
    const charge = withMarkup(cost, markup);
    if (charge < reserve) await refund(reserve - charge, reqId);
    else if (charge > reserve) await sb.rpc('ag_charge', { p_account: site.account_id, p_amount: charge - reserve, p_ref: `${reqId}:extra`, p_kind: 'usage' });
    await log({ model, input_tokens: u.input_tokens ?? 0, output_tokens: u.output_tokens ?? 0, cached_tokens: u.cache_read_input_tokens ?? 0, cost_micros: cost, charge_micros: charge, answered_without_ai: false });

    const reply = (j.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();
    return out({ reply: reply || (cfg.fallback || FALLBACK), ai: true, paused: false });
  } catch (e) {
    console.error('agent-chat', e);
    return out({ reply: FALLBACK, ai: false, paused: true });
  }
});
