/* =================================================================
   The Band Collection: 4 designs for worship bands and ministry groups,
   first made for the worship band Echo.
   Reverb (the band name repeats and fades like an echo while sound
   rings pulse from the logo), Selah (warm light, a script name and the
   verse set in a deep band), Admit One (a concert ticket for the band,
   with the set list as ticket stubs) and Liner Notes (an album booklet:
   cover art, credits with dotted leaders and a thank-you verse).
   The band name is the business name (falls back to the full name) and
   scales down for long names. The verse comes from the tagline
   ("Text" Reference), the set list from the highlights, and Listen from
   the music links (Spotify, Apple Music, YouTube, SoundCloud).
   Colors come from the element variables (--c-*), so every palette the
   editor makes stays readable. Prefixes: bd-, bdr__, bds__, bda__, bdl__.
   ================================================================= */
import type { ReactNode } from 'react';
import { CalendarDays, Globe, Mail, Phone, QrCode, Share2, UserPlus } from 'lucide-react';
import { BrandGlyph, Gallery, HIcon, el, useCard } from './blocks';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';
import { formatPhone, telHref, waHref, webHref } from '../lib/links';

const MUSIC = ['spotify', 'applemusic', 'youtube', 'soundcloud'];
const ext = (href: string) => (/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener' } : {});

/** "Text" Reference -> { text, ref }. Anything else is shown as the text. */
function parseVerse(s: string) {
  const m = (s || '').trim().match(/^["“](.+?)["”]\s*(.*)$/);
  return m ? { text: m[1].trim(), ref: m[2].trim() } : { text: (s || '').trim(), ref: '' };
}
/** Display-size factor so long band names still fit on one or two lines. */
const nameScale = (n: string) => (n.length <= 5 ? 1 : n.length <= 8 ? 0.8 : n.length <= 12 ? 0.64 : n.length <= 18 ? 0.5 : 0.42);

function useBand() {
  const { data, actions, play, still } = useCard();
  const mark = (data.business || data.fullName || 'Your Band').trim();
  const role = data.jobTitle.trim() || 'Worship Band';
  const city = [data.address.city, data.address.region].filter(Boolean).join(', ');
  const verse = parseVerse(data.tagline);
  const bookHref = data.bookingUrl ? webHref(data.bookingUrl)
    : data.whatsapp ? waHref(data.whatsapp, `Hi, I'd like to book ${mark} for an event.`)
    : data.email ? `mailto:${data.email}?subject=${encodeURIComponent(`Booking request for ${mark}`)}`
    : data.phone ? telHref(data.phone) : '';
  const contacts: { key: string; label: string; href: string; icon: ReactNode; sub: string }[] = [];
  if (data.phone) contacts.push({ key: 'call', label: 'Call', href: telHref(data.phone), icon: <Phone size={19} strokeWidth={1.9} />, sub: formatPhone(data.phone) });
  if (data.whatsapp) contacts.push({ key: 'wa', label: 'WhatsApp', href: waHref(data.whatsapp, 'Hi, I found your card and have a question.'), icon: <BrandGlyph network="whatsapp" size={19} />, sub: 'Message us' });
  if (data.email) contacts.push({ key: 'email', label: 'Email', href: `mailto:${data.email}`, icon: <Mail size={19} strokeWidth={1.9} />, sub: data.email });
  if (data.website) contacts.push({ key: 'web', label: 'Website', href: webHref(data.website), icon: <Globe size={19} strokeWidth={1.9} />, sub: data.website.replace(/^https?:\/\//, '').replace(/\/$/, '') });
  const links = data.socials.map((s) => ({ ...s, url: socialUrl(s.network, s.value), label: NETWORK_BY_ID[s.network]?.label ?? 'Link' })).filter((s) => s.url);
  const music = links.filter((s) => MUSIC.includes(s.network));
  const other = links.filter((s) => !MUSIC.includes(s.network));
  return { data, actions, play, still, mark, role, city, verse, bookHref, contacts: contacts.slice(0, 4), music, other, k: nameScale(mark) };
}
type Band = ReturnType<typeof useBand>;

function Shell({ cls, b, children }: { cls: string; b: Band; children: ReactNode }) {
  return <div className={`tpl tpl-bd ${cls}${b.still ? ' is-still' : ''}`} style={{ ['--k' as string]: b.k }}>{children}</div>;
}

/* ---------------------------------------------------------------- shared parts */
function Book({ b, label }: { b: Band; label?: string }) {
  if (!b.bookHref) return null;
  const text = label ?? (b.mark.length <= 14 ? `Book ${b.mark}` : 'Book the band');
  return (
    <a className="bd-book" href={b.bookHref} {...ext(b.bookHref)} onClick={() => b.play('primary')} {...el('btnPrimaryBg')}>
      <CalendarDays size={20} strokeWidth={2} aria-hidden /><span {...el('btnPrimaryText')}>{text}</span>
    </a>
  );
}
function Contacts({ b }: { b: Band }) {
  if (!b.contacts.length) return null;
  return (
    <nav className={`bd-grid n${b.contacts.length}`} aria-label="Contact">
      {b.contacts.map((c) => (
        <a key={c.key} className="bd-c" href={c.href} {...ext(c.href)} onClick={() => b.play('tap')} {...el('btnSecondaryBg')}>
          <span className="bd-c__ic" {...el('icons')}>{c.icon}</span><span {...el('btnSecondaryText')}>{c.label}</span>
        </a>
      ))}
    </nav>
  );
}
function Tools({ b }: { b: Band }) {
  return (
    <div className="bd-tools">
      <button type="button" className="bd-save" onClick={() => { b.play('primary'); b.actions.save(); }} {...el('btnSecondaryBg')}>
        <UserPlus size={19} strokeWidth={2} aria-hidden /><span {...el('btnSecondaryText')}>Save contact</span>
      </button>
      <button type="button" className="bd-sq" onClick={b.actions.share} aria-label="Share this card" {...el('btnSecondaryBg')}><Share2 size={19} aria-hidden /></button>
      <button type="button" className="bd-sq" onClick={b.actions.qr} aria-label="Show QR code" {...el('btnSecondaryBg')}><QrCode size={19} aria-hidden /></button>
    </div>
  );
}
function Head({ children }: { children: ReactNode }) {
  return <h2 className="bd-h" {...el('caption')}>{children}</h2>;
}
function Listen({ b, title = 'Listen' }: { b: Band; title?: string }) {
  if (!b.music.length) return null;
  return (
    <section className="bd-sec">
      <Head>{title}</Head>
      <div className="bd-listen">
        {b.music.map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noopener" onClick={() => b.play('tap')} {...el('cardBg')}>
            <span className="bd-listen__ic" {...el('icons')}><BrandGlyph network={s.network} size={20} /></span>
            <span {...el('body')}>{s.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
function Others({ b }: { b: Band }) {
  if (!b.other.length) return null;
  return (
    <nav className="bd-soc" aria-label="Social links">
      {b.other.map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noopener" aria-label={s.label} {...el('iconBg')}><span {...el('icons')}><BrandGlyph network={s.network} size={19} /></span></a>
      ))}
    </nav>
  );
}
function Verse({ b, cls = '' }: { b: Band; cls?: string }) {
  if (!b.verse.text) return null;
  return (
    <figure className={`bd-verse ${cls}`}>
      <blockquote {...el('name')}>&ldquo;{b.verse.text}&rdquo;</blockquote>
      {b.verse.ref && <figcaption {...el('accentDetail')}>{b.verse.ref}</figcaption>}
    </figure>
  );
}
function BandArt({ b, cls }: { b: Band; cls: string }) {
  const { data } = b;
  if (data.logoUrl) return <img className={`${cls} is-logo`} src={data.logoUrl} alt={`${b.mark} logo`} />;
  if (data.photoUrl) return <img className={cls} src={data.photoUrl} alt={b.mark} />;
  return null;
}

/* ================================================================ 1 REVERB */
export function Reverb() {
  const b = useBand();
  const hasArt = !!(b.data.logoUrl || b.data.photoUrl);
  return (
    <Shell cls="tpl-bdr" b={b}>
      <header className="bdr__hero" {...el('heroBand')}>
        <div className={`bdr__rings${hasArt ? '' : ' is-low'}`} aria-hidden><i /><i /><i /><i /></div>
        {hasArt && <div className="bdr__art"><BandArt b={b} cls="bdr__img" /></div>}
        <h1 className="bdr__mark" aria-label={b.mark}>
          <span {...el('name')}>{b.mark}</span>
          <span aria-hidden {...el('accentDetail')}>{b.mark}</span>
          <span aria-hidden {...el('accentDetail')}>{b.mark}</span>
        </h1>
        <p className="bdr__role" {...el('accentDetail')}>{b.role}</p>
        {(b.city || b.data.hours) && <p className="bdr__city" {...el('title')}>{[b.city, b.data.hours].filter(Boolean).join(' · ')}</p>}
      </header>
      <div className="bd-body">
        <div className="bd-actions"><Book b={b} /><Contacts b={b} /><Tools b={b} /></div>
        <Listen b={b} />
        {b.data.highlights.length > 0 && (
          <section className="bd-sec">
            <Head>{b.data.highlightsTitle || 'Ministry'}</Head>
            <div className="bdr__list">
              {b.data.highlights.map((h) => (
                <article key={h.id} {...el('cardBg')}>
                  <span className="bdr__well" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} size={19} /></span></span>
                  <span className="bd-tx"><b {...el('body')}>{h.title}</b>{h.subtitle && <small {...el('caption')}>{h.subtitle}</small>}</span>
                </article>
              ))}
            </div>
          </section>
        )}
        <Verse b={b} cls="bdr__verse" />
        <Gallery variant="grid" max={6} />
        <Others b={b} />
      </div>
    </Shell>
  );
}

/* ================================================================ 2 SELAH */
export function Selah() {
  const b = useBand();
  return (
    <Shell cls="tpl-bds" b={b}>
      <header className="bds__hero">
        <span className="bds__rays" aria-hidden />
        <BandArt b={b} cls="bds__img" />
        <h1 className="bds__mark" {...el('name')}>{b.mark}</h1>
        <p className="bds__role" {...el('accentDetail')}>{b.role}</p>
        {b.city && <p className="bds__city" {...el('title')}>{b.city}</p>}
        <span className="bds__rule" aria-hidden {...el('dividers')} />
        {b.data.hours && <p className="bds__hours" {...el('caption')}>{b.data.hours}</p>}
      </header>
      <div className="bd-body">
        <div className="bd-actions"><Book b={b} /><Contacts b={b} /><Tools b={b} /></div>
      </div>
      {b.verse.text && (
        <div className="bds__band" {...el('heroBand')}>
          <svg className="bds__curve" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden><path d="M0 0H400V4C280 44 120 44 0 4Z" /></svg>
          <Verse b={b} cls="bds__verse" />
          <svg className="bds__curve is-end" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden><path d="M0 40H400V36C280 -4 120 -4 0 36Z" /></svg>
        </div>
      )}
      <div className="bd-body">
        {b.data.highlights.length > 0 && (
          <section className="bd-sec">
            <Head>{b.data.highlightsTitle || 'Ministry'}</Head>
            <ul className="bds__list">
              {b.data.highlights.map((h) => (
                <li key={h.id} {...el('dividers')}>
                  <span className="bds__ic" {...el('icons')}><HIcon name={h.icon} size={20} /></span>
                  <span className="bd-tx"><b {...el('body')}>{h.title}</b>{h.subtitle && <small {...el('caption')}>{h.subtitle}</small>}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <Listen b={b} />
        <Gallery variant="grid" max={6} />
        <Others b={b} />
      </div>
    </Shell>
  );
}

/* ================================================================ 3 ADMIT ONE */
export function AdmitOne() {
  const b = useBand();
  const serial = String((b.mark.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 99991, 17))).padStart(5, '0');
  return (
    <Shell cls="tpl-bda" b={b}>
      <header className="bda__stage">
        {b.data.photoUrl && <img className="bda__photo" src={b.data.photoUrl} alt={b.mark} />}
        <span className="bda__beam is-l" aria-hidden /><span className="bda__beam is-r" aria-hidden />
        <span className="bda__fade" aria-hidden />
        <div className="bda__ticket" {...el('cardBg')}>
          <div className="bda__main">
            <p className="bda__admit" {...el('accentDetail')}>Admit one · Live worship</p>
            {b.data.logoUrl && <img className="bda__logo" src={b.data.logoUrl} alt={`${b.mark} logo`} />}
            <h1 className="bda__mark" {...el('name')}>{b.mark}</h1>
            <p className="bda__role" {...el('title')}>{b.role}{b.city && ` · ${b.city}`}</p>
          </div>
          <div className="bda__stub" aria-hidden><span {...el('caption')}>No. {serial}</span></div>
        </div>
      </header>
      <div className="bd-body">
        {b.data.hours && <p className="bda__hours" {...el('accentDetail')}>{b.data.hours}</p>}
        <div className="bd-actions"><Book b={b} label="Book a night" /><Contacts b={b} /><Tools b={b} /></div>
        {b.data.highlights.length > 0 && (
          <section className="bd-sec">
            <Head>{b.data.highlightsTitle || 'Set list'}</Head>
            <div className="bda__stubs">
              {b.data.highlights.map((h, i) => (
                <article key={h.id} {...el('cardBg')}>
                  <span className="bda__no" {...el('btnPrimaryBg')}><small {...el('btnPrimaryText')}>Set</small><b {...el('btnPrimaryText')}>{String(i + 1).padStart(2, '0')}</b></span>
                  <span className="bd-tx"><b {...el('body')}>{h.title}</b>{h.subtitle && <small {...el('caption')}>{h.subtitle}</small>}</span>
                </article>
              ))}
            </div>
          </section>
        )}
        <Listen b={b} title="Hear us live" />
      </div>
      {b.verse.text && <div className="bda__slant" {...el('heroBand')}><Verse b={b} cls="bda__verse" /></div>}
      <div className="bd-body"><Gallery variant="grid" max={6} /><Others b={b} /></div>
    </Shell>
  );
}

/* ================================================================ 4 LINER NOTES */
export function LinerNotes() {
  const b = useBand();
  const year = new Date().getFullYear();
  return (
    <Shell cls="tpl-bdl" b={b}>
      <header className="bdl__hero">
        <div className="bdl__cover" {...el('heroBand')}>
          {b.data.logoUrl || b.data.photoUrl ? <BandArt b={b} cls="bdl__img" />
            : <span className="bdl__type" aria-hidden><i>{b.mark}</i></span>}
          <span className="bdl__corner" aria-hidden>{b.role}</span>
        </div>
        <p className="bdl__eyebrow" {...el('accentDetail')}>Liner notes · {year}</p>
        <h1 className="bdl__mark" {...el('name')}>{b.mark}</h1>
        <p className="bdl__role" {...el('title')}>{b.role}{b.city && ` · ${b.city}`}</p>
        {b.data.hours && <p className="bdl__hours" {...el('caption')}>{b.data.hours}</p>}
      </header>
      <div className="bd-body">
        <div className="bd-actions"><Book b={b} /><Contacts b={b} /><Tools b={b} /></div>
        {b.data.highlights.length > 0 && (
          <section className="bd-sec">
            <Head>{b.data.highlightsTitle || 'Credits'}</Head>
            <ol className="bdl__credits">
              {b.data.highlights.map((h, i) => (
                <li key={h.id}>
                  <span className="bdl__n" {...el('accentDetail')}>{String(i + 1).padStart(2, '0')}</span>
                  <b {...el('body')}>{h.title}</b>
                  <i className="bdl__dots" aria-hidden {...el('dividers')} />
                  {h.subtitle && <small {...el('caption')}>{h.subtitle}</small>}
                </li>
              ))}
            </ol>
          </section>
        )}
        <Listen b={b} title="Now playing" />
        {b.verse.text && <section className="bd-sec bdl__thanks"><Head>Special thanks</Head><Verse b={b} cls="bdl__verse" /></section>}
        <Gallery variant="grid" max={6} />
        <Others b={b} />
      </div>
    </Shell>
  );
}
