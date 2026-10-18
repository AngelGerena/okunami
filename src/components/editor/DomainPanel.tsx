import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Crown, ExternalLink, Globe2, Loader2, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import type { Card } from '../../lib/types';
import { usePlan } from '../../lib/usePlan';
import { canUseDomain, DOMAIN_PRICE, DOMAIN_TARGET } from '../../lib/plans';
import { cleanDomain, domainApi, hostLabel, PROVIDERS, rootOf, type CardDomain, type DomainMethod, type ProviderId } from '../../lib/domains';
import { INTENT_KEY } from '../../pages/Login';
import { Section } from './Fields';
import { sfx } from '../../lib/sfx';
import { rich, useT } from '../../lib/i18n';

/* "Your own domain" on the Publish step: connect a domain the owner already owns (vcard.theirsite.com).
   Pro Plus and Business. Lite and Pro see the option locked, with a way to upgrade. */

function CopyBtn({ text }: { text: string }) {
  const { t } = useT();
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="dom-copy" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked */ } }}
      aria-label={t("Copy {v}", { v: text })}>{done ? <Check size={14} /> : <Copy size={14} />}{done ? t("Copied") : t("Copy")}</button>
  );
}

/** Where to click at each domain company. {root} is their domain. */
function useSteps(provider: ProviderId, root: string): string[] {
  const { t } = useT();
  const add = t("Add a record with the 3 values below, then save.");
  switch (provider) {
    case 'godaddy': return [t("Sign in to GoDaddy, open My Products, then DNS next to {root}.", { root }), t("Tap Add New Record and pick CNAME."), add];
    case 'spaceship': return [t("Sign in to Spaceship and open Domain Manager."), t("Pick {root}, then open Advanced DNS and tap Add record.", { root }), add];
    case 'namecheap': return [t("Sign in to Namecheap and open Domain List."), t("Tap Manage next to {root}, then Advanced DNS, then Add New Record.", { root }), add];
    case 'squarespace': return [t("Sign in to Squarespace and open Domains."), t("Pick {root}, open DNS, then tap Add record.", { root }), add];
    case 'wix': return [t("Sign in to Wix and open Domains."), t("Tap the three dots next to {root}, then Manage DNS records. Find CNAME and tap Add record.", { root }), add];
    case 'cloudflare': return [t("Sign in to Cloudflare and pick {root}.", { root }), t("Open DNS, then Records, then Add record."), add, t("Set Proxy status to DNS only (gray cloud). The orange cloud blocks the secure lock.")];
    default: return [t("Sign in where you bought {root} and find its DNS settings.", { root }), t("Add a new record and pick CNAME."), add];
  }
}

function RecordBox({ domain }: { domain: string }) {
  const { t } = useT();
  const name = hostLabel(domain);
  return (
    <div className="dom-rec" role="table" aria-label={t("The record to add")}>
      <div role="row"><span role="cell">{t("Type")}</span><b role="cell">CNAME</b><CopyBtn text="CNAME" /></div>
      <div role="row"><span role="cell">{t("Name")}</span><b role="cell">{name}</b><CopyBtn text={name} /></div>
      <div role="row"><span role="cell">{t("Value")}</span><b role="cell">{DOMAIN_TARGET}</b><CopyBtn text={DOMAIN_TARGET} /></div>
    </div>
  );
}

export default function DomainPanel({ card, onChange }: { card: Card; onChange?: () => void }) {
  const { t } = useT();
  const nav = useNavigate();
  const { plan, ready } = usePlan();
  const allowed = canUseDomain(plan);
  const slug = card.data.slug;

  const [row, setRow] = useState<CardDomain | null | undefined>(undefined);
  const [method, setMethod] = useState<DomainMethod>('diy');
  const [step, setStep] = useState<'pick' | 'form'>('pick');
  const [domain, setDomain] = useState('');
  const [provider, setProvider] = useState<ProviderId>('godaddy');
  const [phone, setPhone] = useState(card.data.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try { setRow(await domainApi.mine(card.id, slug)); } catch { setRow(null); }
    onChange?.();
  }, [card.id, slug, onChange]);
  useEffect(() => { if (allowed) load(); else setRow(null); }, [allowed, load]);

  // Back from Stripe Checkout.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('domain');
    if (q === 'paid') setNote(t("Payment received. Angel at Finesse Media will reach out within 1 business day to connect your domain."));
    if (q === 'canceled') setNote(t("Checkout canceled. No charge was made."));
  }, [t]);

  const root = rootOf(cleanDomain(domain) ?? (domain || 'yourdomain.com'));
  const steps = useSteps(provider, row ? rootOf(row.domain) : root);

  if (!ready) return null;

  /* ---------------------------------------------- locked (Lite and Pro) */
  if (!allowed) {
    const upgrade = () => { try { localStorage.setItem(INTENT_KEY, 'plus'); } catch { /* storage blocked */ } nav('/app'); };
    return (
      <Section title={t("Your own domain")} hint={t("Use a website you already own, like vcard.yourbusiness.com.")}>
        <div className="dom-lock">
          <span className="dom-lock__ic"><Lock size={18} /></span>
          <div><b>{t("Comes with Pro Plus and Business")}</b><small>{t("Your QR code, NFC tag and Share button would all use your own domain.")}</small></div>
          <button type="button" className="btn btn--gold btn--sm" onClick={upgrade}><Crown size={14} /> {t("Upgrade")}</button>
        </div>
      </Section>
    );
  }

  const submit = async () => {
    setErr('');
    const d = cleanDomain(domain);
    if (!d) { setErr(t("Enter a domain like vcard.yourbusiness.com.")); return; }
    if (method === 'diy' && hostLabel(d) === '@') { setErr(t("Use a part of your domain, like vcard.{root}, so your website keeps working.", { root: d })); return; }
    setBusy(true);
    try {
      const res = await domainApi.request({ cardId: card.id, domain: d, method, provider: method === 'register' ? 'unknown' : provider, phone: method === 'diy' ? undefined : phone });
      if (res.url) { window.location.href = res.url; return; }
      sfx('tap');
      if (method === 'diy') await domainApi.check(card.id, slug).catch(() => undefined);   // they may have added the record already
      await load();
    } catch (e) { setErr(e instanceof Error ? e.message : t("Something went wrong.")); }
    setBusy(false);
  };
  const check = async () => {
    setBusy(true); setErr('');
    try { await domainApi.check(card.id, slug); await load(); } catch (e) { setErr(e instanceof Error ? e.message : t("Something went wrong.")); }
    setBusy(false);
  };
  const remove = async () => {
    if (!window.confirm(t("Stop using this domain? Your okunami.pro link keeps working."))) return;
    setBusy(true);
    try { await domainApi.cancel(card.id, slug); setStep('pick'); await load(); } catch (e) { setErr(e instanceof Error ? e.message : t("Something went wrong.")); }
    setBusy(false);
  };

  const okunamiLink = `okunami.pro/${slug}`;
  const head = (title: string) => <div className="dom-card__h"><Globe2 size={16} aria-hidden /> {title}</div>;
  const msgs = (
    <>
      {note && <p className="dom-msg" role="status">{note}</p>}
      {err && <p className="err" role="alert">{err}</p>}
    </>
  );

  /* ---------------------------------------------- has a domain */
  if (row) {
    const s = row.status;
    return (
      <Section title={t("Your own domain")} hint={t("Use a website you already own, like vcard.yourbusiness.com.")}>
        <div className="dom-card">
          {head(row.domain)}
          <div className="dom-card__b">
            {msgs}
            {s === 'connected' && (
              <div className="dom-live">
                <span className="dom-live__ic"><Check size={26} strokeWidth={3} /></span>
                <b className="dom-big">{t("You're connected")}</b>
                <span className="dom-pill"><ShieldCheck size={14} /> {row.domain}</span>
                <p className="note">{t("Your QR code, NFC tag and Share button now use your domain. Your okunami.pro link keeps working too.")}</p>
                <a className="btn btn--gold" href={`https://${row.domain}`} target="_blank" rel="noopener"><ExternalLink size={16} /> {t("Open my card")}</a>
              </div>
            )}
            {s === 'pending_payment' && (
              <p className="note">{t("Checkout isn't finished yet. Start again to pay, or pick another option.")}</p>
            )}
            {s === 'requested' && (
              <>
                <b className="dom-big">{t("Angel is on it")}</b>
                <p className="note">{row.method === 'register'
                  ? t("Angel at Finesse Media will reach out within 1 business day to register your domain in your name and connect it.")
                  : t("Angel at Finesse Media will reach out within 1 business day to connect your domain.")}</p>
                <p className="note">{rich(t("Your card still works at <b>{link}</b> while you wait.", { link: okunamiLink }), { b: (c) => <b>{c}</b> })}</p>
              </>
            )}
            {s === 'waiting_dns' && (
              <>
                <p className="dom-q">{t("Where did you buy your domain?")}</p>
                <div className="dom-tabs" role="radiogroup" aria-label={t("Domain company")}>
                  {PROVIDERS.map((p) => <button key={p.id} type="button" role="radio" aria-checked={provider === p.id} className={provider === p.id ? 'on' : ''} onClick={() => setProvider(p.id)}>{p.id === 'other' ? t("Other") : p.name}</button>)}
                </div>
                <ol className="dom-steps">{steps.map((x) => <li key={x}>{x}</li>)}</ol>
                <RecordBox domain={row.domain} />
                <p className="note">{t("Stuck? Tap Stop using this domain, then pick Domain Hookup and Angel will do it for you.")}</p>
              </>
            )}
            {s === 'checking_ssl' && (
              <>
                <b className="dom-big">{t("Almost there")}</b>
                <div className="dom-stat is-ok"><Check size={16} /> {t("Record found")}</div>
                <div className="dom-stat is-wait"><Loader2 size={16} className="spin" /> {t("Setting up your secure lock (https)")}</div>
                <p className="note">{t("This can take a few minutes to an hour. You can leave this screen and check back.")}</p>
                <p className="note">{rich(t("Your card still works at <b>{link}</b> while you wait.", { link: okunamiLink }), { b: (c) => <b>{c}</b> })}</p>
              </>
            )}
            <div className="dom-acts">
              {s !== 'connected' && s !== 'pending_payment' && <button type="button" className="btn btn--gold" onClick={check} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />} {s === 'waiting_dns' ? t("I added it, check now") : t("Check again")}</button>}
              <button type="button" className="btn btn--ghost" onClick={remove} disabled={busy}>{s === 'pending_payment' ? t("Start over") : t("Stop using this domain")}</button>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  /* ---------------------------------------------- new: pick how, then the details */
  return (
    <Section title={t("Your own domain")} hint={t("Use a website you already own, like vcard.yourbusiness.com.")}>
      {row === undefined ? <div className="dom-card"><div className="dom-card__b"><Loader2 size={18} className="spin" /></div></div> : (
        <div className="dom-card">
          {head(step === 'pick' ? t("How should we set it up?") : method === 'register' ? t("The domain you want") : t("Your domain"))}
          <div className="dom-card__b">
            {msgs}
            {step === 'pick' ? (
              <>
                <div className="dom-opts" role="radiogroup" aria-label={t("How should we set it up?")}>
                  <button type="button" role="radio" aria-checked={method === 'diy'} className={`dom-opt${method === 'diy' ? ' on' : ''}`} onClick={() => setMethod('diy')}>
                    <span className="dom-opt__dot" aria-hidden /><span><b>{t("I'll do it myself")}</b><small>{t("A step-by-step guide for your domain company. About 5 minutes.")}</small></span><em className="dom-tag is-free">{t("Free")}</em>
                  </button>
                  <button type="button" role="radio" aria-checked={method === 'hookup'} className={`dom-opt is-dark${method === 'hookup' ? ' on' : ''}`} onClick={() => setMethod('hookup')}>
                    <span className="dom-opt__dot" aria-hidden /><span><b>{t("Domain Hookup")}</b><small>{t("Angel at Finesse Media connects it for you, start to finish.")}</small></span><em className="dom-tag">{t("${n} one time", { n: DOMAIN_PRICE.hookup })}</em>
                  </button>
                  <button type="button" role="radio" aria-checked={method === 'register'} className={`dom-opt${method === 'register' ? ' on' : ''}`} onClick={() => setMethod('register')}>
                    <span className="dom-opt__dot" aria-hidden /><span><b>{t("I don't have a domain yet")}</b><small>{t("We help you register one in your name, then connect it.")}</small></span><em className="dom-tag is-ink">{t("${n} + domain", { n: DOMAIN_PRICE.register })}</em>
                  </button>
                </div>
                <p className="note">{t("Yearly plans get Domain Hookup free.")}</p>
                <div className="dom-acts"><button type="button" className="btn btn--gold" onClick={() => { setStep('form'); setErr(''); }}>{t("Continue")}</button></div>
              </>
            ) : (
              <>
                <div className="fld">
                  <label htmlFor="dom-in">{method === 'register' ? t("The domain you'd like") : t("Your card's address")}</label>
                  <input id="dom-in" className="dom-in" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={method === 'register' ? 'mariasalon.com' : 'vcard.mariasalon.com'}
                    autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="url" />
                  <small>{method === 'register' ? t("We'll check it's available and suggest close options if not.") : t("We suggest vcard. in front of your domain, so your website keeps working.")}</small>
                </div>
                {method !== 'register' && (
                  <>
                    <p className="dom-q">{t("Where did you buy your domain?")}</p>
                    <div className="dom-tabs" role="radiogroup" aria-label={t("Domain company")}>
                      {PROVIDERS.map((p) => <button key={p.id} type="button" role="radio" aria-checked={provider === p.id} className={provider === p.id ? 'on' : ''} onClick={() => setProvider(p.id)}>{p.id === 'other' ? t("Other") : p.name}</button>)}
                    </div>
                  </>
                )}
                {method === 'diy' && cleanDomain(domain) && hostLabel(cleanDomain(domain)!) !== '@' && (
                  <>
                    <ol className="dom-steps">{steps.map((x) => <li key={x}>{x}</li>)}</ol>
                    <RecordBox domain={cleanDomain(domain)!} />
                  </>
                )}
                {method !== 'diy' && (
                  <div className="fld">
                    <label htmlFor="dom-ph">{t("Best phone or WhatsApp to reach you")}</label>
                    <input id="dom-ph" className="dom-in" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
                  </div>
                )}
                <div className="dom-acts">
                  <button type="button" className="btn btn--gold" onClick={submit} disabled={busy || !domain.trim()}>
                    {busy && <Loader2 size={16} className="spin" />}
                    {method === 'diy' ? t("I added it, check now") : t("Continue to payment")}
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => { setStep('pick'); setErr(''); }}>{t("Back")}</button>
                </div>
                {method === 'hookup' && <p className="note">{t("On a yearly plan this step is free and skips payment.")}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}
