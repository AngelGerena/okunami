import { IS_DEMO, supabase } from './supabase';

/* Pro Plus done-for-you edits: up to 2 small edits a month, made by Finesse Media.
   The browser reads its status through fc_edits_status and asks the okunami-edits edge function to save
   a request. The plan check and the monthly limit live on the server (fc_edit_submit). */

/** Keep in step with fc_edit_limit() in supabase/migrations/0028_pro_plus_edits.sql. */
export const EDITS_PER_MONTH = 2;

export type EditStatus = 'open' | 'done' | 'declined';
export interface EditRequest {
  id: string;
  details: string;
  photo_url: string | null;
  status: EditStatus;
  created_at: string;
  done_at: string | null;
  card_id: string | null;
  card_name: string | null;
}
export interface EditsStatus {
  allowed: boolean;
  limit: number;
  used: number;
  period: string;      // '2026-11'
  resets_on: string;   // '2026-12-01'
  recent: EditRequest[];
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('okunami-edits', { body });
  if (error) {
    let reason = '';
    try { const ctx = (error as { context?: Response }).context; const j = ctx ? await ctx.json() : null; reason = j?.error ?? ''; } catch { /* no body */ }
    throw new Error(reason || error.message || 'Something went wrong. Please try again.');
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

/* ------------------------------------------------------------ demo (lives in this browser only) */
const DEMO_KEY = 'fc.demo.edits';
const period = () => {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit' }).format(new Date());
  return p.slice(0, 7);
};
const nextMonth = (p: string) => { const [y, m] = p.split('-').map(Number); return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`; };
type DemoRow = EditRequest & { period: string };
const demoAll = (): DemoRow[] => { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '[]'); } catch { return []; } };
const demoSave = (v: DemoRow[]) => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(v)); } catch { /* blocked */ } };
function demoStatus(plan: string): EditsStatus {
  const p = period();
  const rows = demoAll();
  return {
    allowed: plan === 'plus', limit: EDITS_PER_MONTH, period: p, resets_on: nextMonth(p),
    used: rows.filter((r) => r.period === p && r.status !== 'declined').length,
    recent: rows.slice(0, 8),
  };
}

export const editsApi = {
  async status(demoPlan = 'free'): Promise<EditsStatus> {
    if (IS_DEMO) return demoStatus(demoPlan);
    const { data, error } = await supabase.rpc('fc_edits_status');
    if (error) throw new Error(error.message);
    return data as EditsStatus;
  },

  async request(r: { cardId: string | null; details: string; photoUrl?: string | null; lang: string }, demoPlan = 'free'): Promise<{ used: number; limit: number }> {
    if (IS_DEMO) {
      const s = demoStatus(demoPlan);
      if (!s.allowed) throw new Error('Done-for-you edits come with Pro Plus.');
      if (s.used >= s.limit) throw new Error('You have used both edits this month. They reset on the 1st.');
      const row: DemoRow = { id: crypto.randomUUID(), details: r.details.trim(), photo_url: r.photoUrl ?? null, status: 'open', created_at: new Date().toISOString(), done_at: null, card_id: r.cardId, card_name: null, period: period() };
      demoSave([row, ...demoAll()]);
      return { used: s.used + 1, limit: s.limit };
    }
    return call({ action: 'request', cardId: r.cardId, details: r.details, photoUrl: r.photoUrl ?? null, lang: r.lang });
  },

  /* admin */
  async done(id: string): Promise<void> { await call({ action: 'admin_done', id }); },
  async decline(id: string, note: string): Promise<void> { await call({ action: 'admin_decline', id, note }); },
};
