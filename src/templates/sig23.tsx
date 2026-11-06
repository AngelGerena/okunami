/* =================================================================
   Redo Alternates: the second look for each Redo design, so clients
   can choose either one. Headliner (creators: a concert poster with
   crossing marquee ribbons), Listing Sheet (realtors: an agent listing
   sheet with a brass key tag), Letterpress (wedding planners: gold foil
   initials on cotton paper), Lacquer (nails: a liquid lacquer pour),
   Eucalyptus (massage: a smooth curve and polished river stones) and
   Frosted (beauty sellers: frosted glass over the photo with an
   iridescent edge). Shared pieces come from sig20 (rx- classes).
   Prefixes: ryh__, ryl__, ryp__, ryq__, rye__, ryf__.
   ================================================================= */
import { type CSSProperties } from 'react';
import { ShoppingBag, UserPlus, Users } from 'lucide-react';
import { Photo, el, useCard } from './blocks';
import { webHref } from '../lib/links';
import { Keys, Lbl, Main, Shell, Tail, initials, priceOf, useRx } from './sig20';

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener noreferrer' } : {});
const Arrow = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg>;

/* ================================================================ 1 HEADLINER (creators) */
export function Headliner() {
  const { data, first, last, services, book, contact } = useRx();
  const titles = services.map((s) => s.title.toUpperCase());
  const handle = (data.socials.find((s) => s.network === 'instagram' || s.network === 'tiktok')?.value || '').replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '');
  const r1 = (titles.length ? titles : [data.jobTitle.toUpperCase()]).join(' · ');
  const r2 = ['COLLABS OPEN', handle ? `@${handle.replace(/^@/, '').toUpperCase()}` : (data.business || '').toUpperCase()].filter(Boolean).join(' · ');
  return (
    <Shell cls="tpl-ryh">
      <div className="ryh__hero">
        <Photo className="ryh__img" />
        {book && <a className="ryh__badge" href={book} {...ext(book)}><span><b>BOOK</b>ME NOW</span></a>}
        <div className="ryh__ribbon" aria-hidden><span>{`${r1} · ${r1} · ${r1} · ${r1} · `}</span></div>
        <div className="ryh__ribbon r2" aria-hidden><span>{`${r2} · ${r2} · ${r2} · ${r2} · `}</span></div>
        <div className="ryh__name"><h1 {...el('name')}>{first}{last && <em {...el('accentDetail')}>{last}</em>}</h1><p {...el('caption')}>{[data.jobTitle, data.tagline].filter(Boolean).join(' · ')}</p></div>
      </div>
      <div className="rx-pad">
        <Main label="Book a collab" href={book} />
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'Headlining'}</Lbl>
          <div className="ryh__big">{services.map((s, k) => <div key={s.id}><i {...el('accentDetail')}>{String(k + 1).padStart(2, '0')}</i><b>{s.title}</b><small>{s.subtitle}</small></div>)}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 2 LISTING SHEET (realtors) */
export function ListingSheet() {
  const { data, services, book, contact } = useRx();
  const city = [data.address?.city, data.address?.region].filter(Boolean).join(', ');
  const specs = [
    { k: 'Market', v: city },
    { k: 'Specialties', v: services.slice(0, 2).map((s) => s.title).join(' · ') },
    { k: 'Brokerage', v: data.business },
    { k: 'Hours', v: data.hours },
  ].filter((x) => x.v);
  const worth = data.email ? `mailto:${data.email}?subject=${encodeURIComponent('What is my home worth?')}` : data.phone ? `sms:${data.phone.replace(/\D/g, '')}` : '';
  const seller = data.niche === 'realestate';
  return (
    <Shell cls="tpl-ryl">
      <div className="ryl__mast"><b>{data.business || 'Agent sheet'}</b><span>Agent sheet · {new Date().getFullYear()}</span></div>
      <div className="ryl__photo">
        <Photo className="ryl__img" />
        <span className="ryl__rib">FEATURED AGENT</span>
        {city && <span className="ryl__key"><i />Now showing · {data.address?.city || city}</span>}
      </div>
      <h1 className="ryl__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
      <p className="ryl__sub" {...el('caption')}>{data.jobTitle}{data.tagline && <> · <b {...el('accentDetail')}>{data.tagline}</b></>}</p>
      <div className="rx-pad">
        {specs.length > 0 && <dl className="ryl__specs">{specs.map((x) => <div key={x.k}><dt>{x.k}</dt><dd>{x.v}</dd></div>)}</dl>}
        <Main label="Schedule a private showing" href={book} />
        {seller && worth && <a className="rx-alt" href={worth}>What is my home worth?</a>}
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'How I help'}</Lbl>
          <div className="ryl__rows">{services.map((s, k) => <div key={s.id}><i {...el('accentDetail')}>{String(k + 1).padStart(2, '0')}</i><span><b>{s.title}</b><small>{s.subtitle}</small></span><Arrow /></div>)}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 3 LETTERPRESS (wedding planners) */
export function Letterpress() {
  const { data, services, book, contact } = useRx();
  const ini = initials(data.fullName || data.business) || 'AB';
  return (
    <Shell cls="tpl-ryp">
      <div className="ryp__top">
        <div className="ryp__mono" aria-hidden>{ini[0]}<span>{ini.slice(1)}</span></div>
        {data.business && <div className="ryp__rule">{data.business}</div>}
      </div>
      <figure className="ryp__print"><Photo className="ryp__img" />{data.tagline && <figcaption>{data.tagline}</figcaption>}</figure>
      <h1 className="ryp__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
      <p className="ryp__sub" {...el('caption')}>{data.jobTitle}</p>
      <div className="rx-pad">
        <Main label="Check our availability" href={book} />
        <Keys list={contact} />
        {services.length > 0 && (
          <div className="ryp__order"><h2 {...el('accentDetail')}>{data.highlightsTitle || 'The order of planning'}</h2>{services.map((s) => <div key={s.id}><b>{s.title}</b><small>{s.subtitle}</small></div>)}</div>
        )}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 4 LACQUER (nails and lashes) */
export function Lacquer() {
  const { data, services, book, contact } = useRx();
  const { theme, mode } = useCard();
  const accent = theme.tokens?.[mode]?.accent || '#C2185B';
  const words = (data.business || 'Polished Studio').split(/\s+/);
  const top = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const bottom = words.slice(Math.ceil(words.length / 2)).join(' ');
  const shades = [accent, '#B5577A', '#6E1F4C', '#C98A78', '#8E0F42', '#E0457B'];
  return (
    <Shell cls="tpl-ryq">
      <div className="ryq__hero"><Photo className="ryq__img" /><h1 className="ryq__title" {...el('name')}>{top}{bottom && <><br /><i>{bottom}</i></>}</h1></div>
      <div className="ryq__pour" aria-hidden>
        <svg viewBox="0 0 400 110" preserveAspectRatio="none">
          <path d="M0 40 C120 0 260 90 400 30 L400 110 L0 110Z" fill="var(--c-accentDetail)" />
          <path d="M0 40 C120 0 260 90 400 30 L400 110 L0 110Z" fill="url(#ryqShade)" />
          <defs>
            <linearGradient id="ryqShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".45" /></linearGradient>
            <linearGradient id="ryqHl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".75" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          </defs>
          <path d="M30 38 C130 12 250 74 370 34" stroke="url(#ryqHl)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M0 70 C140 40 260 110 400 64 L400 110 L0 110Z" fill="var(--c-pageBg)" />
        </svg>
      </div>
      <div className="ryq__id"><b>{data.fullName || 'Your Name'}</b><span>{[data.jobTitle, data.tagline].filter(Boolean).join(' · ')}</span></div>
      <div className="rx-pad">
        <Main label="Book your set" href={book} />
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'Shades and prices'}</Lbl>
          <div className="ryq__bottles">{services.map((s, k) => { const p = priceOf(s.subtitle); return (
            <div key={s.id} style={{ '--c': shades[k % shades.length] } as CSSProperties}><b>{s.title}</b>{p.rest && <small>{p.rest}</small>}{p.price && <em>{p.price}</em>}</div>
          ); })}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 5 EUCALYPTUS (massage and spa) */
export function Eucalyptus() {
  const { data, services, book, contact } = useRx();
  return (
    <Shell cls="tpl-rye">
      <div className="rye__hero"><Photo className="rye__img" /></div>
      <div className="rye__curve" aria-hidden><svg viewBox="0 0 400 92" preserveAspectRatio="none"><path d="M0 46 C110 0 290 0 400 46 L400 92 L0 92Z" fill="var(--c-pageBg)" /><path d="M0 46 C110 0 290 0 400 46" stroke="var(--c-accentDetail)" strokeWidth="2" fill="none" /></svg></div>
      <div className="rye__id">
        {data.business && <small {...el('accentDetail')}>{data.business}</small>}
        <h1 {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <p {...el('caption')}>{[data.credentials, data.tagline].filter(Boolean).join(' · ')}</p>
      </div>
      <div className="rx-pad">
        <Main label="Book a massage" href={book} />
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'Treatments'}</Lbl>
          <div className="rye__stones">{services.map((s) => <div key={s.id}><b>{s.title}</b><small>{s.subtitle}</small></div>)}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}

/* ================================================================ 6 FROSTED (beauty sellers) */
export function Frosted() {
  const { data, services, contact, save } = useRx();
  const seller = data.niche === 'consultant';
  const shop = data.website ? webHref(data.website) : '';
  const join = data.bookingUrl ? webHref(data.bookingUrl) : '';
  return (
    <Shell cls="tpl-ryf" style={data.photoUrl ? ({ '--ryf-photo': `url("${data.photoUrl.replace(/"/g, '%22')}")` } as CSSProperties) : undefined}>
      <div className="ryf__bg" aria-hidden />
      <div className="ryf__hero">
        <Photo className="ryf__img" />
        <div className="ryf__glass">
          <h1 {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <p>{[data.jobTitle, data.business].filter(Boolean).join(' · ')}</p>
          {shop && <a className="ryf__cta" href={shop} {...ext(shop)}><ShoppingBag size={18} strokeWidth={2} aria-hidden />{seller ? 'Shop my picks' : 'Visit my website'}</a>}
          <div className="ryf__row">
            {join && <a href={join} {...ext(join)}><Users size={17} strokeWidth={2} aria-hidden />{seller ? 'Join my team' : 'Book now'}</a>}
            <button type="button" onClick={save}><UserPlus size={17} strokeWidth={2} aria-hidden />Save</button>
          </div>
        </div>
      </div>
      <div className="rx-pad">
        <Keys list={contact} />
        {services.length > 0 && <><Lbl>{data.highlightsTitle || 'My shelf'}</Lbl>
          <div className="ryf__shelf">{services.map((s) => <div key={s.id}><b>{s.title}</b><small>{s.subtitle}</small></div>)}</div></>}
        <Tail />
      </div>
    </Shell>
  );
}
