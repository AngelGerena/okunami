/* =================================================================
   The Construction Collection: 5 photo-led designs for general
   contractors, builders and trades. No drawings: every card leads with
   the owner's real photo and sits on a real material (plywood, hi-vis
   tape, steel, concrete, pine).
   Permit (a posted building permit with license fields and an APPROVED
   stamp), Hi-Vis (full-bleed photo finished with reflective vest tape),
   Ironworks (black-and-white photo, steel-yard type and a load chart),
   Concrete (spray-stenciled name on raw concrete with a pressed seal)
   and Lumber Stamp (a mill grade stamp on a pine board, photo pinned
   like a print, services as a penciled cut list).
   Every class uses a prefix nothing else in the app uses:
   tpl-cx, cx-, cxp__, cxv__, cxi__, cxc__, cxl__.
   ================================================================= */
import { useEffect, type ReactNode } from 'react';
import { CalendarDays, Globe, Mail, MessageSquare, Phone, UserPlus } from 'lucide-react';
import { Photo, QrBtn, ShareBtn, SocialLinks, el, useCard } from './blocks';
import { telHref, webHref } from '../lib/links';

/* Anton, Saira Stencil One and Alfa Slab One come in one weight only, so they get their own link
   (the shared font link asks every family for 400 to 700, which these faces cannot answer). */
const SINGLE_WEIGHT_FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Saira+Stencil+One&family=Alfa+Slab+One&display=swap';
function useSingleWeightFonts() {
  useEffect(() => {
    if (document.querySelector(`link[data-fc-font="${SINGLE_WEIGHT_FONTS}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = SINGLE_WEIGHT_FONTS; l.dataset.fcFont = SINGLE_WEIGHT_FONTS;
    document.head.appendChild(l);
  }, []);
}

const digits = (s: string) => (s || '').replace(/\D/g, '');
const smsHref = (phone: string, body?: string) => {
  const d = digits(phone);
  if (!d) return '';
  const base = `sms:+${d.length === 10 ? '1' + d : d}`;
  if (!body) return base;
  const sep = typeof navigator !== 'undefined' && /iP(hone|ad)/.test(navigator.userAgent) ? '&' : '?';
  return `${base}${sep}body=${encodeURIComponent(body)}`;
};
const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').trim().split(/\s+/); return { first, last: rest.join(' ') }; };
/** "Lic. CGC#0148 · Licensed and insured, OSHA 30" -> three badges. */
const splitCreds = (s: string) => (s || '').split(/\s*[·|,•]\s*/).map((x) => x.trim()).filter(Boolean);
const prettyPhone = (s: string) => { const d = digits(s); const t = d.length === 11 && d[0] === '1' ? d.slice(1) : d; return t.length === 10 ? `(${t.slice(0, 3)}) ${t.slice(3, 6)}-${t.slice(6)}` : s; };
const yearIn = (...s: string[]) => s.join(' ').match(/\b(19|20)\d{2}\b/)?.[0] ?? '';
const initials = (s: string) => (s || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

function useCx() {
  const { data, actions, play } = useCard();
  const { first, last } = splitName(data.fullName);
  const phone = data.phone || data.whatsapp;
  const estimateMsg = `Hi ${first}, I found your card. Can I get a free estimate? I can send photos of the job.`;
  const services = data.highlights.filter((h) => h.title).slice(0, 6);
  const area = [data.address?.city, data.address?.region].filter(Boolean).join(', ');
  const creds = splitCreds(data.credentials);
  /* The free estimate goes to the booking link first, then a text with photos, then email, then a call. */
  const estimate = data.bookingUrl ? webHref(data.bookingUrl)
    : phone ? smsHref(phone, estimateMsg)
    : data.email ? `mailto:${data.email}?subject=${encodeURIComponent('Free estimate')}&body=${encodeURIComponent(estimateMsg)}`
    : '';
  const keys: { key: string; label: string; href: string; icon: ReactNode }[] = [];
  if (data.phone) keys.push({ key: 'call', label: 'Call', href: telHref(data.phone), icon: <Phone size={20} strokeWidth={1.9} /> });
  if (phone) keys.push({ key: 'text', label: 'Text photos', href: smsHref(phone, estimateMsg), icon: <MessageSquare size={20} strokeWidth={1.9} /> });
  if (data.email) keys.push({ key: 'email', label: 'Email', href: `mailto:${data.email}`, icon: <Mail size={20} strokeWidth={1.9} /> });
  if (data.website && keys.length < 4) keys.push({ key: 'web', label: 'Website', href: webHref(data.website), icon: <Globe size={20} strokeWidth={1.9} /> });
  const save = () => { play('primary'); actions.save(); };
  return { data, first, last, services, area, creds, estimate, keys, save, play };
}

function Shell({ cls, children }: { cls: string; children: ReactNode }) {
  useSingleWeightFonts();
  const { still } = useCard();
  return <div className={`tpl tpl-cx ${cls}${still ? ' is-still' : ''}`}>{children}</div>;
}

function EstimateBtn({ label = 'Request a free estimate', book = false }: { label?: string; book?: boolean }) {
  const { estimate, play } = useCx();
  if (!estimate) return null;
  const ext = /^https?:/.test(estimate);
  return (
    <a className="cx-main" href={estimate} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined} onClick={() => play('primary')} {...el('btnPrimaryBg')}>
      {book ? <CalendarDays size={20} strokeWidth={2} aria-hidden /> : null}{label}
    </a>
  );
}

function KeyGrid() {
  const { keys, play } = useCx();
  if (!keys.length) return null;
  return (
    <nav className={`cx-keys n${keys.length}`} aria-label="Contact">
      {keys.map((k) => {
        const ext = /^https?:/.test(k.href);
        return <a key={k.key} className="cx-key" href={k.href} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined} onClick={() => play('tap')}>{k.icon}<span>{k.label}</span></a>;
      })}
    </nav>
  );
}

function Area({ extra = [] as string[] }) {
  const { area, data } = useCx();
  const chips = [area && `Serving ${area}`, data.hours, ...extra].filter(Boolean) as string[];
  if (!chips.length) return null;
  return <div className="cx-area">{chips.map((c) => <span key={c} {...el('caption')}>{c}</span>)}</div>;
}

function Tail() {
  const { save } = useCx();
  return (
    <>
      <SocialLinks variant="pills" title="" />
      <div className="cx-tail">
        <button type="button" className="cx-save" onClick={save}><UserPlus size={19} strokeWidth={2} aria-hidden />Save contact</button>
        <ShareBtn iconOnly className="cx-sq" />
        <QrBtn iconOnly className="cx-sq" />
      </div>
    </>
  );
}

/* ================================================================ 1 PERMIT */
export function Permit() {
  const { data, services, creds } = useCx();
  const fields = [
    { k: 'Contractor', v: data.business },
    { k: 'License', v: creds[0] },
    { k: 'Job line', v: prettyPhone(data.phone || data.whatsapp) },
    { k: 'Hours', v: data.hours },
  ].filter((f) => f.v);
  const scope = services.map((s) => s.title.toLowerCase()).join(', ');
  return (
    <Shell cls="tpl-cxp">
      <div className="cxp__top"><b {...el('caption')}>{data.business || 'Licensed contractor'}</b>{creds[0] && <span>{creds[0]}</span>}</div>
      <section className="cxp__placard" aria-label="Building permit">
        <div className="cxp__band" {...el('accentDetail')}><h2>Building permit</h2><p>Post in plain view{creds[1] ? ` · ${creds[1]}` : ''}</p></div>
        <div className="cxp__who">
          <div className="cxp__photo"><Photo className="cxp__img" /></div>
          <div><h1 className="cxp__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><p className="cxp__role" {...el('title')}>{data.jobTitle || 'General Contractor'}</p>{data.tagline && <p className="cxp__tag">{data.tagline}</p>}</div>
        </div>
        {fields.length > 0 && <dl className="cxp__fields">{fields.map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>}
        <div className="cxp__foot">{scope && <p>Scope: {scope}</p>}<span className="cxp__stamp" aria-hidden>Approved<small>Free estimates</small></span></div>
      </section>
      <div className="cx-pad">
        <EstimateBtn />
        <KeyGrid />
        {services.length > 0 && (
          <section className="cxp__insp">
            <header><b>{data.highlightsTitle || 'Work I do'}</b><span>Inspections passed</span></header>
            <ul>{services.map((s) => <li key={s.id}><span><b>{s.title}</b>{s.subtitle && <small>{s.subtitle}</small>}</span><em>Passed</em></li>)}</ul>
          </section>
        )}
        <Area />
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 2 HI-VIS */
export function HiVis() {
  const { data, first, last, services, creds } = useCx();
  return (
    <Shell cls="tpl-cxv">
      <div className="cxv__hero">
        <Photo className="cxv__img" />
        <div className="cxv__nm">
          <h1 {...el('name')}>{first}{last && <><br />{last}</>}</h1>
          <p {...el('accentDetail')}>{data.jobTitle || 'General Contractor'}</p>
          {data.business && <small>{data.business}</small>}
        </div>
        <div className="cxv__tape" aria-hidden />
      </div>
      <div className="cx-pad">
        {creds.length > 0 && <div className="cxv__creds">{creds.map((c) => <span key={c}>{c}</span>)}</div>}
        <EstimateBtn label="Get a free estimate" />
        <KeyGrid />
        {services.length > 0 && (
          <section className="cxv__list">
            <p className="cx-lbl" {...el('caption')}>{data.highlightsTitle || 'What I build'}</p>
            {services.map((s, i) => <div key={s.id}><i>{String(i + 1).padStart(2, '0')}</i><span><b>{s.title}</b>{s.subtitle && <small>{s.subtitle}</small>}</span></div>)}
          </section>
        )}
        <Area />
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 3 IRONWORKS */
export function Ironworks() {
  const { data, first, last, services, creds } = useCx();
  return (
    <Shell cls="tpl-cxi">
      <div className="cxi__hero">
        <Photo className="cxi__img" />
        <div className="cxi__steel">
          <h1 {...el('name')}>{first}{last && <span>{last}</span>}</h1>
          <p>{data.jobTitle || 'General Contractor'}</p>
        </div>
      </div>
      <div className="cxi__plate" aria-hidden />
      {(data.business || creds[0]) && <div className="cxi__head"><span>{data.business}</span><span>{creds[0]}</span></div>}
      <div className="cx-pad">
        <EstimateBtn label="Book a site visit" book />
        <KeyGrid />
        {services.length > 0 && (
          <section className="cxi__chart">
            <header><span>Load chart</span><span>{data.highlightsTitle || 'Jobs I take'}</span></header>
            <table>
              <thead><tr><th>Job</th><th>Scope</th></tr></thead>
              <tbody>{services.map((s) => <tr key={s.id}><td><b>{s.title}</b></td><td>{s.subtitle}</td></tr>)}</tbody>
            </table>
          </section>
        )}
        <Area extra={creds.slice(1)} />
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 4 CONCRETE */
export function Concrete() {
  const { data, first, last, services, creds } = useCx();
  const year = yearIn(data.tagline, data.credentials, data.kicker ?? '');
  return (
    <Shell cls="tpl-cxc">
      <div className="cxc__forms" aria-hidden />
      <div className="cxc__hero">
        <div className="cxc__id">
          <h1 {...el('name')}>{first}{last && <><br />{last}</>}</h1>
          <p {...el('accentDetail')}>{data.jobTitle || 'General Contractor'}</p>
        </div>
        <div className="cxc__photo"><Photo className="cxc__img" /></div>
      </div>
      <div className="cx-pad">
        <div className="cxc__row">
          <p><b>{data.business}</b>{creds.length > 0 && <span>{creds.join(' · ')}</span>}</p>
          <div className="cxc__seal" aria-hidden>{year ? <><b>{year}</b><span>Poured since</span></> : <b>{initials(data.business || data.fullName)}</b>}</div>
        </div>
        <EstimateBtn label="Get a quote" />
        <KeyGrid />
        {services.length > 0 && (
          <>
            <p className="cx-lbl" {...el('caption')}>{data.highlightsTitle || 'What I pour and build'}</p>
            <div className="cxc__slabs">{services.map((s) => <div key={s.id}><i {...el('accentDetail')} /><b>{s.title}</b>{s.subtitle && <small>{s.subtitle}</small>}</div>)}</div>
          </>
        )}
        <Area />
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 5 LUMBER STAMP */
export function LumberStamp() {
  const { data, first, last, services, creds } = useCx();
  const year = yearIn(data.tagline, data.credentials);
  return (
    <Shell cls="tpl-cxl">
      <div className="cxl__board">
        <div className="cxl__photo"><Photo className="cxl__img" /></div>
        <div className="cxl__mill">
          <div className="cxl__r1"><span>{(data.business || 'Licensed builder').split(' ')[0]}</span>{year && <span>Est {year}</span>}</div>
          <h1 {...el('name')}>{first}{last && <><br />{last}</>}</h1>
          <p className="cxl__role">{data.jobTitle || 'General Contractor'}</p>
          {creds.length > 0 && <div className="cxl__r3">{creds.slice(0, 2).map((c) => <span key={c}>{c}</span>)}</div>}
        </div>
        <p className="cxl__pencil">Call {first} for a free estimate</p>
      </div>
      <div className="cx-pad">
        <EstimateBtn label="Get a free estimate" />
        <KeyGrid />
        {services.length > 0 && (
          <section className="cxl__cut">
            <h2>{data.highlightsTitle || 'Cut list'}</h2>
            {services.map((s, i) => <div key={s.id}><span>{i + 1}</span><span><b>{s.title}</b>{s.subtitle && <small>{s.subtitle}</small>}</span></div>)}
          </section>
        )}
        <Area />
        <Tail />
      </div>
    </Shell>
  );
}
