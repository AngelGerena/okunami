// Shared helpers for the OKUNAMI Stripe functions (Supabase Edge Functions, Deno).
// Copied from okunami-checkout/_shared/okunami.ts. Keep CENTS in step with it and with okunami.pro pricing.
import Stripe from 'npm:stripe@17.7.0';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

export function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing secret ${name}. Add it in Supabase > Edge Functions > Secrets.`);
  return v;
}

export const stripe = () => new Stripe(env('STRIPE_SECRET_KEY'), { httpClient: Stripe.createFetchHttpClient() });

export const admin = (): SupabaseClient =>
  createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

export type Plan = 'pro' | 'plus' | 'team';
export type Interval = 'month' | 'year';

export const CENTS: Record<Plan, Record<Interval, number>> = {
  pro: { month: 800, year: 7900 },
  plus: { month: 1600, year: 15900 },   // yearly = 2 months free (Nov 2026; was $149)
  team: { month: 600, year: 6000 },   // Business is PER CARD ($6 a month, $60 a year)
};
const NAMES: Record<Plan, string> = { pro: 'OKUNAMI Pro', plus: 'OKUNAMI Pro Plus', team: 'OKUNAMI Business (per card)' };

export const TEAM_MIN = 3;
export const TEAM_MAX = 100;
export const TEAM_DEFAULT = 5;
export function clampSeats(n: unknown): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return TEAM_DEFAULT;
  return Math.min(TEAM_MAX, Math.max(TEAM_MIN, v));
}

export function lineItemFor(plan: Plan, interval: Interval, _founding: boolean, _foundingCents = 0, seats = 1) {
  const quantity = plan === 'team' ? clampSeats(seats) : 1;
  const fixed = Deno.env.get(`OKUNAMI_PRICE_${plan.toUpperCase()}_${interval === 'month' ? 'MONTH' : 'YEAR'}`);
  if (fixed) return { price: fixed, quantity };
  return {
    quantity,
    price_data: { currency: 'usd', unit_amount: CENTS[plan][interval], recurring: { interval }, product_data: { name: NAMES[plan] } },
  };
}
