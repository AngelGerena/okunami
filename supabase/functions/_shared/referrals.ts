// okunami.pro sales that belong to a reseller (migration 0025). Used by okunami-stripe-webhook.
//
// A sale counts when the paying account was tagged to a reseller (fc_profiles.referred_by, set by the link or code)
// and its first paid plan started within 3 months of signing up. One sale per account. Monthly plans then count
// each renewal, up to 12 payments; a yearly plan counts once. The commission math itself lives in okunami-partner/logic.ts.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';
import { PARTNERS, UPGRADE_WINDOW_DAYS, partnerEmail } from './partners.ts';

const DAY = 864e5;
const alertTo = () => Deno.env.get('OKUNAMI_ALERT_EMAIL') ?? 'angel@finessemedia.pro';
const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`;

/** Called when a subscription is paid. Adds the sale to the reseller's dashboard the first time. Never throws. */
export async function creditReferral(db: SupabaseClient, userId: string, s: {
  plan: string; interval: string | null; seats: number | null; amountCents: number;
}): Promise<void> {
  try {
    const { data: p } = await db.from('fc_profiles').select('id, email, full_name, created_at, referred_by').eq('id', userId).maybeSingle();
    const reseller = p?.referred_by as string | null;
    if (!p || !reseller || !PARTNERS[reseller]) return;
    if (Date.now() - new Date(p.created_at).getTime() > UPGRADE_WINDOW_DAYS * DAY) {
      console.log('referral: upgrade came after the 3-month window, not credited', userId, reseller);
      return;
    }
    const { data: existing } = await db.from('fc_reseller_leads').select('id').eq('user_id', userId).maybeSingle();
    if (existing) return;   // already on the dashboard (the webhook sees several events per purchase)
    const billing = s.interval === 'year' ? 'year' : 'month';
    const { error } = await db.from('fc_reseller_leads').insert({
      reseller, user_id: userId, source: 'site', status: 'paid', lang: 'en',
      full_name: (p.full_name as string | null) || (p.email as string | null) || 'okunami.pro client',
      email: p.email, plan: s.plan, billing, seats: s.plan === 'team' ? s.seats : null,
      amount_cents: s.amountCents, studio: false, studio_cents: null, plan_payments: 1, paid_at: new Date().toISOString(),
      notes: 'Signed up on okunami.pro with the reseller link or code.',
    });
    if (error) {
      if ((error as { code?: string }).code === '23505') return;   // another event got there first
      throw error;
    }
    const partner = PARTNERS[reseller];
    const what = `${s.plan === 'plus' ? 'Pro Plus' : s.plan === 'team' ? `Business (${s.seats ?? '?'} cards)` : 'Pro'} ${billing === 'year' ? 'yearly' : 'monthly'}, ${money(s.amountCents)}`;
    await partnerEmail([alertTo(), partner.email], `New okunami.pro sale for ${partner.name}: ${p.email ?? 'new client'}`,
      [`${p.email ?? 'A new client'} signed up on okunami.pro with ${partner.name}'s link or code and paid for ${what}.`,
       'It is on the partner dashboard now: https://okunami.pro/socio/']);
  } catch (e) {
    console.error('creditReferral failed', userId, e);
  }
}

/** Called for each paid renewal invoice. Counts one more monthly payment on that sale, up to 12. Never throws. */
export async function countRenewal(db: SupabaseClient, userId: string, invoiceId: string): Promise<void> {
  try {
    const { data: lead } = await db.from('fc_reseller_leads').select('id, billing, plan_payments, last_invoice_id').eq('user_id', userId).maybeSingle();
    if (!lead || lead.billing !== 'month' || lead.last_invoice_id === invoiceId) return;
    const next = Math.min(12, (Number(lead.plan_payments) || 1) + 1);
    if (next === Number(lead.plan_payments)) return;
    await db.from('fc_reseller_leads').update({ plan_payments: next, last_invoice_id: invoiceId, updated_at: new Date().toISOString() }).eq('id', lead.id);
  } catch (e) {
    console.error('countRenewal failed', userId, e);
  }
}
