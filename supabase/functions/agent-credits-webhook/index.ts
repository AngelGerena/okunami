// Stripe webhook for agent credit packs ONLY. Separate endpoint and secret (AGENT_STRIPE_WEBHOOK_SECRET),
// so the subscription webhook is never touched. Deploy with JWT checking off: Stripe's signature is the authentication.
import Stripe from 'npm:stripe@17.7.0';
import { admin, env, stripe } from '../_shared/okunami.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Use POST.', { status: 405 });
  const raw = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, sig, env('AGENT_STRIPE_WEBHOOK_SECRET'), undefined, Stripe.createSubtleCryptoProvider());
  } catch (e) {
    console.error('agent-credits-webhook signature', e);
    return new Response('Bad signature.', { status: 400 });
  }
  if (event.type !== 'checkout.session.completed') return new Response('ignored', { status: 200 });

  const s = event.data.object as Stripe.Checkout.Session;
  const m = s.metadata ?? {};
  if (m.kind !== 'agent_credits' || s.payment_status !== 'paid') return new Response('ignored', { status: 200 });

  const credits = Number(m.credits_micros);
  if (!m.ag_account_id || !Number.isInteger(credits) || credits <= 0) { console.error('agent-credits-webhook bad metadata', s.id); return new Response('bad metadata', { status: 200 }); }

  // The ledger's unique (kind, ref) makes a repeated webhook harmless: the second insert is rejected and nobody is paid twice.
  const { error } = await admin().from('ag_ledger').insert({ account_id: m.ag_account_id, kind: 'purchase', amount_micros: credits, ref: s.id });
  if (error && error.code !== '23505') { console.error('agent-credits-webhook ledger', error); return new Response('retry', { status: 500 }); }
  return new Response('ok', { status: 200 });
});
