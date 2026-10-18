// Pure logic for the agent service. No network, no database, so it can be tested on its own.

export type Rate = { in: number; out: number; cache_read?: number; cache_write?: number };   // USD per million tokens
export type Limits = { visitor_msgs_per_hour: number; max_reply_tokens: number; max_turns: number; default_daily_cap_usd: number };
export type Faq = { q: string; a: string; keywords?: string[] };
export type Msg = { role: 'user' | 'assistant'; content: string };

export const DEFAULT_LIMITS: Limits = { visitor_msgs_per_hour: 20, max_reply_tokens: 400, max_turns: 12, default_daily_cap_usd: 3 };

/** Money is stored in micro-dollars. rate (USD per million tokens) x tokens = micro-dollars exactly. */
export function costMicros(rate: Rate, u: { input: number; output: number; cacheRead?: number; cacheWrite?: number }): number {
  const cr = rate.cache_read ?? rate.in * 0.1;
  const cw = rate.cache_write ?? rate.in * 1.25;
  return Math.ceil(u.input * rate.in + u.output * rate.out + (u.cacheRead ?? 0) * cr + (u.cacheWrite ?? 0) * cw);
}

export const withMarkup = (cost: number, multiplier: number) => Math.ceil(cost * Math.max(1, multiplier));

/** Worst case for one reply. Reserved before the model runs, settled to the real cost afterwards. */
export function reserveMicros(rate: Rate, inputChars: number, maxOut: number, multiplier: number): number {
  const estIn = Math.ceil(inputChars / 3) + 50;   // generous: ~3 characters per token
  const worst = costMicros({ ...rate, cache_read: rate.in, cache_write: rate.in * 1.25 }, { input: estIn, output: maxOut });
  return withMarkup(worst, multiplier);
}

export function originAllowed(origin: string | null, allowed: string[]): boolean {
  if (!origin || !allowed.length) return false;   // no list means closed, not open
  return allowed.some((a) => a === origin);
}

const STOP = new Set('a an the and or of to in on for is are do does you your we our i it me my can what how when where who which with at be this that there any have has about'.split(' '));
const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9à-ÿ\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

/** Answer from the owner's saved info first. Returns null when nothing matches well enough, so the AI is used. */
export function matchFaq(question: string, faqs: Faq[], threshold = 0.6): Faq | null {
  const qt = new Set(tokens(question));
  if (!qt.size) return null;
  let best: Faq | null = null, bestScore = 0;
  for (const f of faqs) {
    const ft = new Set([...tokens(f.q), ...(f.keywords ?? []).flatMap(tokens)]);
    if (!ft.size) continue;
    let hit = 0;
    for (const w of qt) if (ft.has(w)) hit++;
    const score = hit / Math.min(qt.size, ft.size);
    if (score > bestScore) { bestScore = score; best = f; }
  }
  return best && bestScore >= threshold ? best : null;
}

/** Keeps the conversation short and cheap: last N turns, each capped. Must start with a user message. */
export function trimHistory(messages: unknown, maxTurns: number): Msg[] {
  const arr = Array.isArray(messages) ? messages : [];
  const clean: Msg[] = arr
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1000) }));
  let out = clean.slice(-Math.max(1, maxTurns));
  while (out.length && out[0].role !== 'user') out = out.slice(1);
  return out;
}

export const daysRemaining = (balanceMicros: number, avgDailyMicros: number) =>
  avgDailyMicros > 0 ? Math.floor(balanceMicros / avgDailyMicros) : null;
