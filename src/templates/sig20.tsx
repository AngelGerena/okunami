/* =================================================================
   The Redo Collection (Oct 2026 audit): six photo-led designs that
   replace the six weakest layouts. No clip-art: each one leads with the
   owner's real photo plus real materials and one signature idea.
   Reel Live (creators: an auto-playing story), Golden Hour (realtors:
   sunset light and a gold slant), Vellum (wedding planners: vellum
   overlay and a gold wax seal), Gloss Bar (nails: pick a polish shade
   and the card recolors), Stillwater (massage: candlelight and a live
   breathing guide) and Glow Edit (beauty sellers: a magazine cover).
   Every class uses a prefix nothing else in the app uses: tpl-rx, rx-,
   rxr__, rxg__, rxv__, rxb__, rxs__, rxe__.
   ================================================================= */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { CalendarDays, Globe, Mail, MapPin, MessageSquare, Phone, Share2, ShoppingBag, Sparkles, UserPlus, Users } from 'lucide-react';
import { Photo, QrBtn, ShareBtn, SocialLinks, el, useCard } from './blocks';
import { mapsHref, telHref, webHref, addressLine } from '../lib/links';

/* Pinyon Script, DM Serif Display and Anton come in one weight only, so they get their own font link
   (the shared link asks every family for 400 to 700, which these faces cannot answer). */
const SINGLE_WEIGHT_FONTS = 'https://fonts.googleapis.com/css2?family=Pinyon+Script&family=DM+Serif+Display:ital@0;1&family=Anton&display=swap';
function useSingleWeightFonts() {
  useEffect(() => {
    if (document.querySelector(`link[data-fc-font="${SINGLE_WEIGHT_FONTS}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = SINGLE_WEIGHT_FONTS; l.dataset.fcFont = SINGLE_WEIGHT_FONTS;
    document.head.appendChild(l);
  }, []);
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const digits = (s: string) => (s || '').replace(/\D/g, '');
const smsHref = (phone: string) => { const d = digits(phone); return d ? `sms:+${d.length === 10 ? '1' + d : d}` : ''; };
const waHref = (n: string) => { const d = digits(n); return d ? `https://wa.me/${d.length === 10 ? '1' + d : d}` : ''; };
const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener noreferrer' } : {});
const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').trim().split(/\s+/); return { first, last: rest.join(' ') }; };
const initials = (s: string) => (s || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
/** "$70 · 90 min" -> { price: '$70', rest: '90 min' }; "From $10 per nail" -> { price: 'From $10', rest: 'per nail' }. */
function priceOf(sub: string) {
  const m = (sub || '').match(/((?:from\s+)?\$\s?\d[\d,.]*\+?)/i);
  if (!m) return { price: '', rest: sub };
  const rest = sub.replace(m[0], '').replace(/^[\s·,|-]+|[\s·,|-]+$/g, '').trim();
  return { price: m[0].replace(/\s+/g, ' '), rest };
}

type Key = { key: string; label: string; href: string; icon: ReactNode };
function useRx() {
  const { data, actions, play, still } = useCard();
  const { first, last } = splitName(data.fullName);
  const services = data.highlights.filter((h) => h.title).slice(0, 6);
  const book = data.bookingUrl ? webHref(data.bookingUrl) : data.email ? `mailto:${data.email}?subject=${encodeURIComponent('Booking request')}` : data.phone ? telHref(data.phone) : '';
  const contact: Key[] = [];
  if (data.phone) contact.push({ key: 'call', label: 'Call', href: telHref(data.phone), icon: <Phone size={20} strokeWidth={1.9} /> });
  if (data.phone) contact.push({ key: 'text', label: 'Text', href: smsHref(data.phone), icon: <MessageSquare size={20} strokeWidth={1.9} /> });
  else if (data.whatsapp) contact.push({ key: 'wa', label: 'WhatsApp', href: waHref(data.whatsapp), icon: <MessageSquare size={20} strokeWidth={1.9} /> });
  if (data.email) contact.push({ key: 'email', label: 'Email', href: `mailto:${data.email}`, icon: <Mail size={20} strokeWidth={1.9} /> });
  if (data.hasLocation && addressLine(data.address)) contact.push({ key: 'map', label: 'Visit', href: mapsHref(data.address), icon: <MapPin size={20} strokeWidth={1.9} /> });
  else if (data.website) contact.push({ key: 'web', label: 'Website', href: webHref(data.website), icon: <Globe size={20} strokeWidth={1.9} /> });
  const save = () => { play('primary'); actions.save(); };
  return { data, first, last, services, book, contact: contact.slice(0, 4), save, play, still, actions };
}

function Shell({ cls, style, children }: { cls: string; style?: CSSProperties; children: ReactNode }) {
  useSingleWeightFonts();
  const { still } = useCard();
  return <div className={`tpl tpl-rx ${cls}${still ? ' is-still' : ''}`} style={style}>{children}</div>;
}

function Main({ label, href, icon = <CalendarDays size={19} strokeWidth={2} aria-hidden /> }: { label: string; href: string; icon?: ReactNode }) {
  const { play } = useCard();
  if (!href) return null;
  return <a className="rx-main" href={href} {...ext(href)} onClick={() => play('primary')} {...el('btnPrimaryBg')}>{icon}{label}</a>;
}

function Keys({ list }: { list: Key[] }) {
  const { play } = useCard();
  if (!list.length) return null;
  return <nav className={`rx-keys n${list.length}`} aria-label="Contact">{list.map((k) => <a key={k.key} className="rx-key" href={k.href} {...ext(k.href)} onClick={() => play('tap')}>{k.icon}<span>{k.label}</span></a>)}</nav>;
}

/** Save contact, Share and the QR code, on every design. */
function Tail() {
  const { save } = useRx();
  return (
    <>
      <SocialLinks variant="pills" title="" />
      <div className="rx-tail">
        <button type="button" className="rx-save" onClick={save}><UserPlus size={19} strokeWidth={2} aria-hidden />Save contact</button>
        <ShareBtn iconOnly className="rx-sq" />
        <QrBtn iconOnly className="rx-sq" />
      </div>
    </>
  );
}

const Lbl = ({ children }: { children: ReactNode }) => <p className="rx-lbl" {...el('caption')}>{children}</p>;

/* ================================================================ 1 REEL LIVE (creators) */
export function ReelLive() {
  const { data, first, last, services, book, actions, still, contact } = useRx();
  const caps = services.slice(0, 3);
  const n = Math.max(caps.length, 1);
  const [i, setI] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (still || reduced() || n < 2) return;
    const id = window.setInterval(() => { setI((x) => (x + 1) % n); setTick((t) => t + 1); }, 3600);
    return () => window.clearInterval(id);
  }, [still, n]);
  const handle = (data.socials.find((s) => s.network === 'instagram' || s.network === 'tiktok')?.value || data.business || '').replace(/^https?:\/\/[^/]+\//, '').replace(/^@?/, '@').replace(/\/$/, '');
  const rail: Key[] = [];
  if (data.phone) rail.push({ key: 'call', label: 'Call', href: telHref(data.phone), icon: <Phone size={21} strokeWidth={1.9} /> });
  if (data.phone || data.whatsapp) rail.push({ key: 'dm', label: 'DM', href: data.phone ? smsHref(data.phone) : waHref(data.whatsapp), icon: <MessageSquare size={21} strokeWidth={1.9} /> });
  if (data.email) rail.push({ key: 'email', label: 'Email', href: `mailto:${data.email}`, icon: <Mail size={21} strokeWidth={1.9} /> });
  return (
    <Shell cls="tpl-rxr">
      <div className="rxr__reel">
        {Array.from({ length: n }, (_, k) => (
          <div key={k} className={`rxr__slide s${k + 1}${k === i ? ' is-on' : ''}`}>
            <Photo className="rxr__img" />
            {caps[k] && <div className="rxr__cap"><b>{caps[k].title}</b>{caps[k].subtitle}</div>}
          </div>
        ))}
        <div className="rxr__prog" aria-hidden>{Array.from({ length: n }, (_, k) => <i key={`${k}-${tick}`} className={k < i ? 'done' : k === i ? 'run' : ''}><b /></i>)}</div>
        <div className="rxr__handle">{handle && <span>{handle.length > 1 ? handle : ''}</span>}<span className="rxr__live"><i />{data.tagline ? 'COLLABS OPEN' : 'AVAILABLE'}</span></div>
        <div className="rxr__rail">
          {rail.map((r) => <a key={r.key} href={r.href} {...ext(r.href)}><span>{r.icon}</span>{r.label}</a>)}
          <button type="button" onClick={actions.share}><span><Share2 size={21} strokeWidth={1.9} /></span>Share</button>
        </div>
        <div className="rxr__name"><h1 {...el('name')}>{first}{last && <><br />{last}</>}</h1><p {...el('caption')}>{data.jobTitle}</p></div>
      </div>
      <div className="rx-pad">
        <Main label="Book a collab" href={book} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'Work with me'}</Lbl>
          <div className="rxr__rate">{services.slice(0, 4).map((s, k) => <div key={s.id}><i {...el('accentDetail')}>{String(k + 1).padStart(2, '0')}</i><b>{s.title}</b><small>{s.subtitle}</small></div>)}</div></>}
        <Keys list={contact} />
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 2 GOLDEN HOUR (realtors) */
export function GoldenHour() {
  const { data, first, last, services, book, contact } = useRx();
  const city = [data.address?.city, data.address?.region].filter(Boolean).join(', ');
  return (
    <Shell cls="tpl-rxg">
      <div className="rxg__hero">
        <Photo className="rxg__img" />
        <div className="rxg__name">
          {data.business && <small>{data.business}</small>}
          <h1 {...el('name')}>{first}{last && <><br /><i {...el('accentDetail')}>{last}</i></>}</h1>
          <p>{[data.jobTitle, data.tagline].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <div className="rxg__slant" aria-hidden />
      <div className="rx-pad">
        <Main label="Schedule a private showing" href={book} />
        <Keys list={contact} />
        {(city || data.hours) && <div className="rxg__chips">{city && <span>Serving {city}</span>}{data.hours && <span>{data.hours}</span>}</div>}
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'How I help'}</Lbl>
          <div className="rxg__svc">{services.slice(0, 4).map((s) => <div key={s.id}><b {...el('accentDetail')}>{s.title}</b><small>{s.subtitle}</small></div>)}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 3 VELLUM (wedding planners) */
export function Vellum() {
  const { data, services, book, contact } = useRx();
  const roman = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.'];
  return (
    <Shell cls="tpl-rxv">
      <div className="rxv__hero">
        <Photo className="rxv__img" />
        <span className="rxv__seal" aria-hidden>{initials(data.fullName || data.business)}</span>
        <div className="rxv__sheet">
          {data.business && <small>{data.business}</small>}
          <h1 {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <p>{data.jobTitle || 'Wedding planner'}</p>
        </div>
      </div>
      <div className="rx-pad">
        <Main label="Check our availability" href={book} />
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'How I plan'}</Lbl>
          <div className="rxv__list">{services.map((s, k) => <div key={s.id}><i {...el('accentDetail')}>{roman[k]}</i><span><b>{s.title}</b><small>{s.subtitle}</small></span></div>)}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 4 GLOSS BAR (nails and lashes) */
export function GlossBar() {
  const { data, services, book, contact, play } = useRx();
  const { theme, mode } = useCard();
  const base = theme.tokens?.[mode]?.accent || '#C2185B';
  const shades = useMemo(() => [base, '#E0457B', '#7B2D5B', '#D9534F', '#B98A6E'].filter((c, k, a) => a.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === k).slice(0, 5), [base]);
  const [shade, setShade] = useState(shades[0]);
  return (
    <Shell cls="tpl-rxb" style={{ '--rxb-shade': shade } as CSSProperties}>
      <div className="rxb__hero"><Photo className="rxb__img" /></div>
      <div className="rxb__card">
        <h1 {...el('name')}>{data.business || data.fullName || 'Your Studio'}</h1>
        {data.tagline && <p>{data.tagline}</p>}
        {data.business && <span className="rxb__who"><i />{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</span>}
      </div>
      <div className="rx-pad">
        <div className="rxb__shades" role="group" aria-label="Pick a shade">
          {shades.map((c) => <button key={c} type="button" style={{ '--c': c } as CSSProperties} aria-pressed={shade === c} aria-label={`Shade ${c}`} onClick={() => { setShade(c); play('tap'); }} />)}
        </div>
        <p className="rxb__hint">Pick a shade</p>
        <Main label="Book your set" href={book} />
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'The menu'}</Lbl>
          <div className="rxb__menu">{services.map((s, k) => { const p = priceOf(s.subtitle); return (
            <div key={s.id}><span className="rxb__dome" style={{ '--c': shades[k % shades.length] } as CSSProperties} /><span><b>{s.title}</b>{p.rest && <small>{p.rest}</small>}</span>{p.price && <em>{p.price}</em>}</div>
          ); })}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 5 STILLWATER (massage and spa) */
export function Stillwater() {
  const { data, services, book, contact } = useRx();
  return (
    <Shell cls="tpl-rxs">
      <div className="rxs__hero">
        <Photo className="rxs__img" />
        <div className="rxs__name"><h1 {...el('name')}>{data.fullName || 'Your Name'}</h1><p>{[data.credentials, data.jobTitle].filter(Boolean).join(' · ')}</p></div>
      </div>
      <div className="rxs__basalt">
        <div className="rxs__breath" aria-hidden><span /></div>
        {data.tagline && <b>{data.tagline}</b>}
        {data.business && <small>{data.business}</small>}
      </div>
      <div className="rx-pad">
        <Main label="Book a massage" href={book} />
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'Treatments'}</Lbl>
          <div className="rxs__menu">{services.map((s) => <div key={s.id}><b>{s.title}</b><span aria-hidden /><small>{s.subtitle}</small></div>)}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 6 GLOW EDIT (beauty sellers) */
export function GlowEdit() {
  const { data, services, contact } = useRx();
  const seller = data.niche === 'consultant';
  const shop = data.website ? webHref(data.website) : '';
  const join = data.bookingUrl ? webHref(data.bookingUrl) : '';
  const mast = ((data.business || data.fullName || 'Glow').split(/\s+/)[0] || 'Glow').toUpperCase().slice(0, 7);
  const lines = services.slice(0, 3).map((s) => s.title);
  return (
    <Shell cls="tpl-rxe">
      <div className="rxe__cover">
        <Photo className="rxe__img" />
        <div className="rxe__mast" aria-hidden>{mast}</div>
        <div className="rxe__issue" aria-hidden><span>THE {seller ? 'BEAUTY' : 'SIGNATURE'} ISSUE</span><span>NO. 01</span></div>
        {lines.length > 0 && <div className="rxe__lines">{lines.map((l) => <span key={l}>{l}</span>)}</div>}
        <div className="rxe__name"><h1 {...el('name')}>{data.fullName || 'Your Name'}</h1><p>{[data.jobTitle, data.business].filter(Boolean).join(' · ')}</p></div>
      </div>
      <div className="rx-pad">
        <Main label={seller ? 'Shop my picks' : 'Visit my website'} href={shop} icon={<ShoppingBag size={18} strokeWidth={2} aria-hidden />} />
        {join && <a className="rx-alt" href={join} {...ext(join)}>{seller ? <Users size={18} strokeWidth={2} aria-hidden /> : <Sparkles size={18} strokeWidth={2} aria-hidden />}{seller ? 'Join my team' : 'Book now'}</a>}
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>In this issue</Lbl>
          <div className="rxe__toc">{services.map((s, k) => <div key={s.id}><i {...el('accentDetail')}>{String(k + 1).padStart(2, '0')}</i><span><b>{s.title}</b><small>{s.subtitle}</small></span><em>P. {12 * (k + 1)}</em></div>)}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}
