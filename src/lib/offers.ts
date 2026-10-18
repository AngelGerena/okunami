import { useEffect, useState } from 'react';
import { IS_DEMO, supabase } from './supabase';

/* The founding offer is configured and enforced in the database (fc_offer_config, fc_claim_founding).
   The website only READS the public status, so the price, the spots left and the terms shown on every screen
   come from one place. If the status can not be read (for example before the migration is applied), the site
   says nothing about the offer rather than promising something it can not confirm. */
export interface Offer { known: boolean; active: boolean; left: number; spots: number; cents: number }
const UNKNOWN: Offer = { known: false, active: false, left: 0, spots: 0, cents: 0 };

let cached: Offer | null = null;
const subs = new Set<(o: Offer) => void>();
const publish = (o: Offer) => { cached = o; subs.forEach((f) => f(o)); };

export function useOffer(): Offer {
  const [o, setO] = useState<Offer>(cached ?? UNKNOWN);
  useEffect(() => {
    subs.add(setO);
    if (!cached) {
      if (IS_DEMO) publish({ known: true, active: true, left: 100, spots: 100, cents: 500 });
      else supabase.rpc('fc_offer_status').then(
        ({ data, error }) => publish(error || !data?.configured ? UNKNOWN : { known: true, active: !!data.active, left: data.left, spots: data.spots, cents: data.price_cents }),
        () => publish(UNKNOWN),
      );
    }
    return () => { subs.delete(setO); };
  }, []);
  return o;
}

/* Founding 50: the Studio Signature card (custom design) at a founding price. Same counter as the reseller cards
   (fc_studio_offer_status). Unknown or closed means the site shows the regular price only. */
export interface StudioOffer { known: boolean; active: boolean; left: number; spots: number; cents: number; regular: number; endsAt: string | null }
const STUDIO_UNKNOWN: StudioOffer = { known: false, active: false, left: 0, spots: 0, cents: 0, regular: 24900, endsAt: null };
let studioCached: StudioOffer | null = null;
const studioSubs = new Set<(o: StudioOffer) => void>();
const publishStudio = (o: StudioOffer) => { studioCached = o; studioSubs.forEach((f) => f(o)); };

export function useStudioOffer(): StudioOffer {
  const [o, setO] = useState<StudioOffer>(studioCached ?? STUDIO_UNKNOWN);
  useEffect(() => {
    studioSubs.add(setO);
    if (!studioCached) {
      if (IS_DEMO) publishStudio({ known: true, active: true, left: 50, spots: 50, cents: 14900, regular: 24900, endsAt: '2026-12-31T23:59:59-05:00' });
      else supabase.rpc('fc_studio_offer_status').then(
        ({ data, error }) => publishStudio(error || !data?.configured ? STUDIO_UNKNOWN : {
          known: true, active: !!data.active, left: data.left, spots: data.spots,
          cents: data.price_cents, regular: data.regular_cents, endsAt: data.ends_at ?? null }),
        () => publishStudio(STUDIO_UNKNOWN),
      );
    }
    return () => { studioSubs.delete(setO); };
  }, []);
  return o;
}

/** "$5" from cents. */
export const dollars = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;
