/* =================================================================
   The Author Collection: 6 editorial designs for speakers, life coaches
   and authors, first made for a speaker's book-cover brand.
   Cover Story (a magazine cover with a blush spine and a black name
   band), Back Cover (the back of a book: blurb, framed author photo and
   a black band), Full Feature (a full-bleed black-and-white portrait with
   the name set huge), Color Block (a solid accent block with stacked
   poster type over the photo), Signed Print (a framed print with the
   name signed across it) and Proof Sheet (a photographer's film strip
   with the best frame circled).
   Every design shares one booking pop-up: a month calendar, AM/PM time
   slots and event details, then a ready-made request by WhatsApp or text.
   The tagline is the motto or blurb, the highlights are speaking topics,
   the kicker is the small line over the masthead.
   Colors come from the element variables (--c-*), so every palette the
   editor makes stays readable. Prefixes: au-, auc__, aub__, auf__,
   auk__, aus__, aup__.
   ================================================================= */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Mail, MessageSquare, Phone, QrCode, Share2, UserPlus, X } from 'lucide-react';
import { BrandGlyph, Gallery, HIcon, el, useCard } from './blocks';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';
import { formatPhone, telHref, waHref } from '../lib/links';
import { useBackToClose } from '../lib/useBackToClose';

const ext = (href: string) => (/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener' } : {});
/** sms: link with the same number format as the Call button (telHref adds the country code). */
const smsTo = (phone: string) => telHref(phone).replace(/^tel:/, 'sms:');
const smsHref = (phone: string, body: string) => `${smsTo(phone)}?&body=${encodeURIComponent(body)}`;

function useAuthor() {
  const { data, actions, play, still } = useCard();
  const name = (data.fullName || data.business || 'Your Name').trim();
  const parts = name.split(/\s+/);
  const first = parts[0];
  const last = parts.slice(1).join(' ');
  const role = data.jobTitle.trim();
  const brand = data.business.trim();
  const motto = data.tagline.trim().replace(/^["“]|["”]$/g, '');
  const contacts: { key: string; label: string; href: string; icon: ReactNode }[] = [];
  if (data.phone) contacts.push({ key: 'call', label: 'Call', href: telHref(data.phone), icon: <Phone size={18} strokeWidth={1.9} /> });
  if (data.phone) contacts.push({ key: 'text', label: 'Text', href: smsTo(data.phone), icon: <MessageSquare size={18} strokeWidth={1.9} /> });
  if (data.whatsapp) contacts.push({ key: 'wa', label: 'WhatsApp', href: waHref(data.whatsapp, 'Hi, I found your card and have a question.'), icon: <BrandGlyph network="whatsapp" size={18} /> });
  if (data.email) contacts.push({ key: 'email', label: 'Email', href: `mailto:${data.email}`, icon: <Mail size={18} strokeWidth={1.9} /> });
  const links = data.socials.map((s) => ({ ...s, url: socialUrl(s.network, s.value), label: NETWORK_BY_ID[s.network]?.label ?? 'Link' })).filter((s) => s.url);
  const canBook = !!(data.whatsapp || data.phone || data.email);
  return { data, actions, play, still, name, first, last, role, brand, motto, contacts: contacts.slice(0, 4), links, canBook };
}
type Au = ReturnType<typeof useAuthor>;

function Shell({ cls, a, children }: { cls: string; a: Au; children: ReactNode }) {
  return <div className={`tpl tpl-au ${cls}${a.still ? ' is-still' : ''}`}>{children}</div>;
}

/** The brand mark: the logo when there is one, otherwise the business name set as a wordmark. */
function Mark({ a, cls = '' }: { a: Au; cls?: string }) {
  if (a.data.logoUrl) return <img className={`au-logo ${cls}`} src={a.data.logoUrl} alt={a.brand || a.name} />;
  if (!a.brand) return null;
  return <p className={`au-word ${cls}`} {...el('name')}>{a.brand}</p>;
}
function Photo({ a, cls }: { a: Au; cls: string }) {
  if (!a.data.photoUrl) return <div className={`${cls} au-nophoto`} aria-hidden {...el('heroBand')} />;
  return <img className={cls} src={a.data.photoUrl} alt={a.name} />;
}

/* ---------------------------------------------------------------- booking pop-up */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const TYPES = ['Keynote', 'Company', 'Church', "Women's event", 'Workshop', 'Virtual'];
const SIZES = ['Under 50', '50 to 150', '150 to 500', 'Over 500'];
const ampm = (h: number) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
const dateText = (d: Date) => `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

/* The pop-up is drawn at the top of the page (a portal), so no page bar or card layer can cover it.
   It copies the card's color and font variables, so it still matches the design and the editor's palette. */
const VARS = ['--c-pageBg', '--c-cardBg', '--c-name', '--c-body', '--c-caption', '--c-dividers', '--c-accentDetail', '--c-onAccent',
  '--c-heroBand', '--c-onBand', '--c-btnSecondaryBg', '--c-btnSecondaryText', '--f-display', '--f-body', '--shadow-rgb', '--r-sm'];
function themeOf(node: HTMLElement | null): CSSProperties {
  if (!node) return {};
  const cs = getComputedStyle(node);
  const out: Record<string, string> = {};
  VARS.forEach((v) => { const x = cs.getPropertyValue(v).trim(); if (x) out[v] = x; });
  return out as CSSProperties;
}

function BookSheet({ a, onClose, theme }: { a: Au; onClose: () => void; theme: CSSProperties }) {
  useBackToClose(onClose);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const minDay = new Date(today); minDay.setDate(minDay.getDate() + 1);
  const firstView = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  const lastView = new Date(today.getFullYear() + 1, today.getMonth(), 1);
  const [view, setView] = useState(firstView);
  const [day, setDay] = useState<Date | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [type, setType] = useState<number | null>(null);
  const [who, setWho] = useState('');
  const [city, setCity] = useState('');
  const [size, setSize] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const last = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && sheetRef.current) {
        const f = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]:not([aria-disabled]),input,select'));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; last?.focus?.(); };
  }, [onClose]);

  const lead = view.getDay();
  const dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const ready = !!day && hour !== null;
  const tbc = 'To be confirmed';
  const msg = ready
    ? `Hi ${a.first}${who.trim() ? `, this is ${who.trim()}` : ''}. I'd like to book you for an event.\nDate: ${dateText(day!)}\nTime: ${ampm(hour!)}\nEvent type: ${type === null ? tbc : TYPES[type]}\nCity: ${city.trim() || tbc}\nAudience size: ${size || tbc}`
    : '';
  const sends: { key: string; label: string; href: string; icon: ReactNode; primary?: boolean }[] = [];
  if (a.data.whatsapp) sends.push({ key: 'wa', label: 'WhatsApp', href: ready ? waHref(a.data.whatsapp, msg) : '', icon: <BrandGlyph network="whatsapp" size={18} />, primary: true });
  if (a.data.phone) sends.push({ key: 'sms', label: 'Text', href: ready ? smsHref(a.data.phone, msg) : '', icon: <MessageSquare size={18} /> });
  if (!sends.length && a.data.email) sends.push({ key: 'mail', label: 'Email', href: ready ? `mailto:${a.data.email}?subject=${encodeURIComponent('Booking request')}&body=${encodeURIComponent(msg)}` : '', icon: <Mail size={18} />, primary: true });

  return createPortal(
    <div className="au-bk" style={theme} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="au-bk__sheet" role="dialog" aria-modal="true" aria-labelledby="au-bk-title" ref={sheetRef}>
        <div className="au-bk__head">
          <div><p className="au-bk__kicker">Book {a.name}</p><h2 id="au-bk-title">Request a date</h2></div>
          <button ref={closeRef} type="button" className="au-bk__x" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="au-bk__body">
          <p className="au-bk__step">1. Pick the day</p>
          <div className="au-cal">
            <div className="au-cal__top">
              <button type="button" className="au-cal__nav" aria-label="Previous month" disabled={view <= firstView}
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
              <p className="au-cal__month" aria-live="polite">{MONTHS[view.getMonth()]} {view.getFullYear()}</p>
              <button type="button" className="au-cal__nav" aria-label="Next month" disabled={view >= lastView}
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
            </div>
            <div className="au-cal__dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
            <div className="au-cal__grid">
              {Array.from({ length: lead }, (_, i) => <span key={`l${i}`} />)}
              {Array.from({ length: dim }, (_, i) => {
                const dt = new Date(view.getFullYear(), view.getMonth(), i + 1);
                const on = !!day && +day === +dt;
                return (
                  <button key={i} type="button" className={`au-day${+dt === +today ? ' is-today' : ''}`} disabled={dt < minDay}
                    aria-pressed={on} aria-label={`${DAYS[dt.getDay()]} ${MONTHS[dt.getMonth()]} ${i + 1}`} onClick={() => setDay(dt)}>{i + 1}</button>
                );
              })}
            </div>
          </div>
          <p className="au-bk__step">2. Pick the time</p>
          <div className="au-slots">
            {HOURS.map((h) => <button key={h} type="button" className="au-slot" aria-pressed={hour === h} onClick={() => setHour(h)}>{ampm(h)}</button>)}
          </div>
          <p className="au-bk__step">3. Tell {a.first} about the event</p>
          <div className="au-chips">
            {TYPES.map((t, i) => <button key={t} type="button" className="au-chip" aria-pressed={type === i} onClick={() => setType(type === i ? null : i)}>{t}</button>)}
          </div>
          <div className="au-fields">
            <label><span>Your name</span><input value={who} onChange={(e) => setWho(e.target.value)} autoComplete="name" /></label>
            <label><span>City</span><input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" /></label>
            <label className="is-full"><span>Audience size</span>
              <select value={size} onChange={(e) => setSize(e.target.value)}><option value="">-</option>{SIZES.map((s) => <option key={s}>{s}</option>)}</select>
            </label>
          </div>
        </div>
        <div className="au-bk__foot">
          <p className="au-bk__sum" aria-live="polite">{ready ? <><b>{dateText(day!)}</b> at <b>{ampm(hour!)}</b></> : 'Pick a day and a time to send your request.'}</p>
          <div className={`au-bk__send n${sends.length}`}>
            {sends.map((s) => (
              <a key={s.key} className={`au-send${s.primary ? ' is-primary' : ''}`} href={s.href || undefined} {...ext(s.href)}
                aria-disabled={ready ? undefined : true} onClick={(e) => { if (!ready) e.preventDefault(); else a.play('primary'); }}>
                {s.icon}<span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------------------------------------------------------------- shared body */
function Body({ a, topicsTitle = 'Speaking topics' }: { a: Au; topicsTitle?: string }) {
  const [theme, setTheme] = useState<CSSProperties | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { data } = a;
  const openSheet = () => { a.play('primary'); setTheme(themeOf(bodyRef.current)); };
  return (
    <div className="au-body" ref={bodyRef}>
      <button type="button" className="au-save" onClick={() => { a.play('primary'); a.actions.save(); }} {...el('btnPrimaryBg')}>
        <UserPlus size={20} strokeWidth={2} aria-hidden /><span {...el('btnPrimaryText')}>Save contact</span>
      </button>
      {a.contacts.length > 0 && (
        <nav className={`au-grid n${a.contacts.length}`} aria-label="Contact">
          {a.contacts.map((c) => (
            <a key={c.key} className="au-c" href={c.href} {...ext(c.href)} onClick={() => a.play('tap')} {...el('btnSecondaryBg')}>
              <span className="au-c__ic" {...el('icons')}>{c.icon}</span><span {...el('btnSecondaryText')}>{c.label}</span>
            </a>
          ))}
        </nav>
      )}
      {(a.canBook || data.highlights.length > 0) && (
        <section className="au-panel" {...el('cardBg')}>
          <h2 className="au-h" {...el('caption')}>{data.highlightsTitle || topicsTitle}</h2>
          {data.highlights.length > 0 && (
            <ul className="au-topics">
              {data.highlights.map((h) => (
                <li key={h.id} {...el('dividers')}><span className="au-topics__ic" {...el('icons')}><HIcon name={h.icon} size={15} /></span><span {...el('body')}>{h.title}</span></li>
              ))}
            </ul>
          )}
          {a.canBook && (
            <button type="button" className="au-book" aria-haspopup="dialog" onClick={openSheet} {...el('heroBand')}>
              <CalendarDays size={19} strokeWidth={2} aria-hidden /><span {...el('accentDetail')}>Request a date</span>
            </button>
          )}
          {a.canBook && <p className="au-note" {...el('caption')}>Pick the day and time, then send it by {data.whatsapp ? 'WhatsApp or text' : data.phone ? 'text' : 'email'}.</p>}
        </section>
      )}
      <Gallery variant="grid" max={6} />
      {a.links.length > 0 && (
        <nav className="au-soc" aria-label="Social links">
          {a.links.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener" aria-label={s.label} {...el('iconBg')}><span {...el('icons')}><BrandGlyph network={s.network} size={19} /></span></a>
          ))}
        </nav>
      )}
      <div className="au-tools">
        <button type="button" className="au-tool" onClick={a.actions.share} {...el('btnSecondaryBg')}><Share2 size={18} aria-hidden /><span {...el('btnSecondaryText')}>Share</span></button>
        <button type="button" className="au-tool" onClick={a.actions.qr} {...el('btnSecondaryBg')}><QrCode size={18} aria-hidden /><span {...el('btnSecondaryText')}>QR code</span></button>
      </div>
      {data.phone && <p className="au-num" {...el('caption')}>{formatPhone(data.phone)}</p>}
      {theme && <BookSheet a={a} theme={theme} onClose={() => setTheme(null)} />}
    </div>
  );
}

/* ================================================================ 1 COVER STORY */
export function CoverStory() {
  const a = useAuthor();
  return (
    <Shell cls="tpl-auc" a={a}>
      <header className="auc__hero">
        <span className="au-spine" aria-hidden {...el('accentDetail')} />
        <div className="auc__mast">
          <p className="auc__kicker" {...el('caption')}>{a.data.kicker || 'Special edition'}</p>
          <Mark a={a} cls="auc__mark" />
        </div>
        <div className="auc__photo au-ratio r105">
          <Photo a={a} cls="auc__img" />
          {a.motto && <p className="auc__line" {...el('name')}>&ldquo;{a.motto}&rdquo;</p>}
        </div>
        <div className="auc__band" {...el('heroBand')}>
          <h1 className="auc__name" {...el('name')}>{a.name}</h1>
          {a.role && <p className="auc__role" {...el('accentDetail')}>{a.role}</p>}
        </div>
      </header>
      <div className="au-cut au-cut--slant" aria-hidden {...el('heroBand')} />
      <Body a={a} />
    </Shell>
  );
}

/* ================================================================ 2 BACK COVER */
export function BackCover() {
  const a = useAuthor();
  return (
    <Shell cls="tpl-aub" a={a}>
      <header className="aub__hero">
        <span className="au-spine is-right" aria-hidden {...el('accentDetail')} />
        <p className="aub__eyebrow" {...el('name')}>{a.data.kicker || a.brand || 'About the author'}</p>
        {a.motto && <p className="aub__blurb" {...el('body')}>{a.motto}</p>}
        <div className="aub__sig" {...el('dividers')}>
          <div className="aub__frame"><div className="au-ratio r125"><Photo a={a} cls="aub__img" /></div></div>
          <h1 className="aub__name" {...el('name')}>{a.name}</h1>
          {a.role && <p className="aub__role" {...el('caption')}>{a.role}</p>}
        </div>
        <div className="aub__band" {...el('heroBand')}>
          {a.data.logoUrl ? <img className="au-logo" src={a.data.logoUrl} alt={a.brand || a.name} /> : <p className="aub__bandname" {...el('accentDetail')}>{a.brand || a.name}</p>}
        </div>
      </header>
      <div className="au-cut au-cut--slant-r" aria-hidden {...el('heroBand')} />
      <Body a={a} />
    </Shell>
  );
}

/* ================================================================ 3 FULL FEATURE */
export function FullFeature() {
  const a = useAuthor();
  return (
    <Shell cls="tpl-auf" a={a}>
      <header className="auf__hero" {...el('heroBand')}>
        <Photo a={a} cls="auf__img" />
        <span className="auf__shade" aria-hidden />
        <Mark a={a} cls="auf__mark" />
        <div className="auf__cap">
          {(a.data.kicker || a.brand) && <p className="auf__kicker" {...el('accentDetail')}>&ldquo;{a.data.kicker || a.brand}&rdquo;</p>}
          <h1 className="auf__name">{a.first}{a.last && <><br />{a.last}</>}</h1>
          <span className="auf__rule" aria-hidden {...el('accentDetail')} />
          {a.role && <p className="auf__role">{a.role}</p>}
        </div>
      </header>
      <div className="au-cut au-cut--curve" aria-hidden {...el('pageBg')} />
      {a.motto && <p className="au-motto" {...el('name')}>&ldquo;{a.motto}&rdquo;</p>}
      <Body a={a} />
    </Shell>
  );
}

/* ================================================================ 4 COLOR BLOCK */
export function ColorBlock() {
  const a = useAuthor();
  return (
    <Shell cls="tpl-auk" a={a}>
      <header className="auk__hero" {...el('accentDetail')}>
        <Mark a={a} cls="auk__mark" />
        <div className="auk__block">
          <Photo a={a} cls="auk__img" />
          <h1 className="auk__name" {...el('name')}><span>{a.first}</span>{a.last && <span>{a.last}</span>}</h1>
        </div>
        <div className="auk__band" {...el('heroBand')}>{a.role && <p className="auk__role">{a.role}</p>}</div>
      </header>
      <div className="au-cut au-cut--slant-r" aria-hidden {...el('heroBand')} />
      {a.motto && <p className="au-motto" {...el('name')}>&ldquo;{a.motto}&rdquo;</p>}
      <Body a={a} />
    </Shell>
  );
}

/* ================================================================ 5 SIGNED PRINT */
export function SignedPrint() {
  const a = useAuthor();
  return (
    <Shell cls="tpl-aus" a={a}>
      <header className="aus__hero">
        <Mark a={a} cls="aus__mark" />
        <div className="aus__frame" {...el('dividers')}><div className="au-ratio r80"><Photo a={a} cls="aus__img" /></div></div>
        <p className="aus__sig" aria-hidden {...el('name')}>{a.name}</p>
        <h1 className="au-sr">{a.name}</h1>
        {a.role && <p className="aus__role" {...el('caption')}>{a.role}</p>}
        {a.motto && <p className="aus__quote" {...el('accentDetail')}>&ldquo;{a.motto}&rdquo;</p>}
      </header>
      <div className="au-cut au-cut--curve" aria-hidden {...el('accentDetail')} />
      <Body a={a} />
    </Shell>
  );
}

/* ================================================================ 6 PROOF SHEET */
export function ProofSheet() {
  const a = useAuthor();
  const g = a.data.gallery;
  const frames = [g[0] || a.data.photoUrl, a.data.photoUrl, g[1] || a.data.photoUrl];
  return (
    <Shell cls="tpl-aup" a={a}>
      <header className="aup__hero">
        <div className="aup__strip" {...el('heroBand')}>
          <p className="aup__edge"><span>{(a.name).toUpperCase()} 400</span><span>{(a.brand || 'PORTFOLIO').toUpperCase()}</span></p>
          <div className="aup__frames">
            {frames.map((src, i) => (
              <figure key={i} className={i === 1 ? 'is-pick' : ''}>
                <div className="au-ratio r133">{src ? <img src={src} alt={i === 1 ? a.name : ''} className={`f${i}`} /> : <span className="au-nophoto" />}</div>
                <figcaption>{12 + i}</figcaption>
                {i === 1 && <svg className="aup__circle" viewBox="0 0 120 150" aria-hidden><path d="M60 6C24 4 6 36 7 76c1 42 24 68 56 67 33-1 52-31 50-71C111 33 92 8 57 9 42 10 30 16 22 25" /></svg>}
              </figure>
            ))}
          </div>
          <p className="aup__edge"><span>13</span><span>OKUNAMI</span></p>
        </div>
        <div className="aup__id">
          <Mark a={a} cls="aup__mark" />
          <h1 className="aup__name" {...el('name')}>{a.name}</h1>
          {a.role && <p className="aup__role" {...el('caption')}>{a.role}</p>}
        </div>
      </header>
      <div className="au-cut au-cut--slant" aria-hidden {...el('heroBand')} />
      {a.motto && <p className="au-motto" {...el('name')}>&ldquo;{a.motto}&rdquo;</p>}
      <Body a={a} />
    </Shell>
  );
}
