/* =================================================================
   The Darkroom Collection: 10 high-end photographer designs in black
   and red, with gloss, chrome, carbon fiber and camera details.
   Every design ends with the photographer's portfolio (gallery).
   ================================================================= */
import type { ReactNode } from 'react';
import { Gallery, Highlights, Logo, Photo, QrBtn, ShareBtn, SocialLinks, Title, el, useCard, useContactActions } from './blocks';
import { webHref } from '../lib/links';

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});

/** Book, portfolio and the contact row every photographer design shares. */
function usePhoto() {
  const { data } = useCard();
  const book = data.bookingUrl ? webHref(data.bookingUrl) : '';
  const folio = data.gallery.length ? '#portfolio' : data.website ? webHref(data.website) : '';
  const contacts = useContactActions().filter((a) => a.key !== 'book' && a.key !== 'web' && a.key !== 'map');
  return { data, book, folio, contacts };
}

/** One action link: an anchor, or the save button when there is no link. */
function Act({ href, className, children, label }: { href: string; className: string; children: ReactNode; label?: string }) {
  if (!href) return null;
  return <a href={href} className={className} aria-label={label} {...ext(href)} {...el('btnPrimaryBg')}>{children}</a>;
}
function SaveAct({ className, children }: { className: string; children: ReactNode }) {
  const { actions } = useCard();
  return <button type="button" className={className} onClick={actions.save} {...el('btnSecondaryBg')}>{children}</button>;
}

function Contacts({ className = '' }: { className?: string }) {
  const { contacts } = usePhoto();
  if (!contacts.length) return null;
  // Real buttons with icons (not small text links), so Call and Text read as the main ways to reach you.
  return <nav className={`dk-contacts ${className}`} aria-label="Contact">{contacts.map((a) => <a key={a.key} href={a.href} {...ext(a.href)} {...el('links')}><span className="dk-contacts__ic" aria-hidden>{a.icon}</span>{a.key === 'wa' ? 'Text' : a.label}</a>)}</nav>;
}

/** Portfolio, sessions, socials, share and QR: the same tail on every design. */
function Folio() {
  return (
    <div className="dk-tail">
      <div id="portfolio"><Gallery variant="grid" title="Portfolio" max={9} /></div>
      <Highlights variant="chips" />
      <SocialLinks variant="pills" title="" />
      <div className="row dk-row"><ShareBtn /><QrBtn /></div>
    </div>
  );
}

/* ================================================================ 1 APERTURE */
export function Aperture() {
  const { data, book, folio } = usePhoto();
  return (
    <div className="tpl tpl-dk dk-carbon tpl-dkap">
      <div className="pad stack center">
        <div className="ap__top"><span {...el('caption')}>{data.business || 'Studio'}</span><span className="ap__rec" {...el('accentDetail')}><i />f/1.4</span></div>
        <div className="ap__lens" {...el('accentDetail')}>
          <svg className="ap__blades" viewBox="0 0 272 272" aria-hidden><g><path d="M136 8 L196 40 L168 92 Z" /><path d="M240 60 L262 124 L204 128 Z" /><path d="M258 168 L222 226 L180 186 Z" /><path d="M188 258 L120 264 L130 206 Z" /><path d="M76 246 L22 206 L72 172 Z" /><path d="M12 140 L30 74 L82 104 Z" /><path d="M60 26 L120 8 L110 66 Z" /></g></svg>
          <Photo className="ap__img" />
          <span className="ap__glint" aria-hidden />
        </div>
        <div><h1 className="ap__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title className="dk-role" /></div>
        <div className="full stack-sm">
          <Act href={book} className="dk-pull">Book a session</Act>
          <Act href={folio} className="dk-pull">View portfolio</Act>
          <SaveAct className="dk-ghost">Save contact</SaveAct>
        </div>
        <Contacts />
        <div className="full"><Folio /></div>
      </div>
    </div>
  );
}

/* ================================================================ 2 VIEWFINDER */
export function Viewfinder() {
  const { data, book, folio } = usePhoto();
  return (
    <div className="tpl tpl-dk tpl-vf">
      <div className="vf__screen" {...el('heroBand')}>
        <Photo className="vf__img" />
        <div className="vf__hud top"><span><i className="vf__dot" {...el('accentDetail')} />REC</span><span>RAW · 45MP</span></div>
        <span className="vf__br tl" aria-hidden /><span className="vf__br tr" aria-hidden /><span className="vf__br bl" aria-hidden /><span className="vf__br br" aria-hidden />
        <span className="vf__focus" aria-hidden {...el('accentDetail')} />
        <div className="vf__hud bottom" aria-hidden><span>1/250</span><span>F2.8</span><span>ISO 100</span><span className="vf__ev">±0.0</span></div>
      </div>
      <div className="pad stack">
        <div className="vf__id">
          <div><h1 className="vf__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><p className="vf__sub" {...el('caption')}>{[data.jobTitle, data.business].filter(Boolean).join(' · ')}</p></div>
          {book && <a href={book} {...ext(book)} className="vf__shutter" {...el('btnPrimaryBg')}>Book</a>}
        </div>
        <div className="dk-grid2">
          <Act href={folio} className="dk-gloss">Portfolio</Act>
          <SaveAct className="dk-gloss">Save contact</SaveAct>
        </div>
        <Contacts className="vf__keys" />
        <Folio />
      </div>
    </div>
  );
}

/* ================================================================ 3 RED RING LENS */
export function LensRing() {
  const { data, book, folio } = usePhoto();
  const rim = `${(data.business || 'Studio').toUpperCase()} · 85mm 1:1.2 · PORTRAIT · `;
  return (
    <div className="tpl tpl-dk tpl-lr">
      <div className="pad stack center">
        <div className="lr__lens">
          <span className="lr__knurl" aria-hidden /><span className="lr__bezel" aria-hidden /><span className="lr__red" aria-hidden {...el('accentDetail')} /><span className="lr__well" aria-hidden />
          <svg className="lr__rim" viewBox="0 0 300 300" aria-hidden><defs><path id="lrArc" d="M150,150 m-123,0 a123,123 0 1,1 246,0 a123,123 0 1,1 -246,0" /></defs><text><textPath href="#lrArc">{rim + rim}</textPath></text></svg>
          <Photo className="lr__img" />
          <span className="lr__coat" aria-hidden />
        </div>
        <div><h1 className="lr__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title className="dk-role" /></div>
        <div className="full stack-sm">
          <Act href={book} className="dk-ring">Book a session</Act>
          <Act href={folio} className="dk-ring">View portfolio</Act>
          <SaveAct className="dk-ring">Save contact</SaveAct>
        </div>
        <Contacts />
        <div className="full"><Folio /></div>
      </div>
    </div>
  );
}

/* ================================================================ 4 RANGEFINDER */
export function Rangefinder() {
  const { data, book, folio } = usePhoto();
  return (
    <div className="tpl tpl-dk tpl-rf">
      <header className="rf__plate">
        <span className="rf__dial" aria-hidden><span>250</span></span>
        <span className="rf__brand">{data.business || 'Studio'}</span>
        {data.logoUrl ? <Logo className="rf__logo" /> : <span className="rf__badge" {...el('accentDetail')}>{(data.business || data.fullName || 'S').split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase()}</span>}
      </header>
      <div className="pad stack">
        <div className="rf__frame"><Photo className="rf__img" /><span className="rf__lines" aria-hidden /><span className="rf__patch" aria-hidden /></div>
        <div><h1 className="rf__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title className="dk-role" /></div>
        <div className="stack-sm">
          <Act href={book} className="dk-chrome">Book a session <i className="rf__led" {...el('accentDetail')} /></Act>
          <Act href={folio} className="dk-chrome">View portfolio</Act>
          <SaveAct className="dk-ghost">Save contact</SaveAct>
        </div>
        <Contacts />
        <Folio />
      </div>
    </div>
  );
}

/* ================================================================ 5 SAFELIGHT */
export function Safelight() {
  const { data, book, folio } = usePhoto();
  return (
    <div className="tpl tpl-dk tpl-sl">
      <div className="pad stack center">
        <p className="sl__on" {...el('accentDetail')}><i aria-hidden />Safelight on · Darkroom</p>
        <div className="sl__line" aria-hidden />
        <div className="sl__prints">
          <span className="sl__paper a" aria-hidden><i className="sl__pin" /></span>
          <figure className="sl__print"><i className="sl__pin" aria-hidden /><Photo className="sl__img" /><span className="sl__tint" aria-hidden /></figure>
          <span className="sl__paper b" aria-hidden><i className="sl__pin" /></span>
        </div>
        <div><h1 className="sl__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title className="sl__role" /></div>
        <div className="full stack-sm">
          <Act href={book} className="dk-tray">Book a session</Act>
          <Act href={folio} className="dk-tray">See the prints</Act>
          <SaveAct className="dk-paper">Save contact</SaveAct>
        </div>
        <Contacts />
        <div className="full"><Folio /></div>
      </div>
    </div>
  );
}

/* ================================================================ 6 CARBON PRO */
export function CarbonPro() {
  const { data, book, folio } = usePhoto();
  const { actions } = useCard();
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  return (
    <div className="tpl tpl-dk dk-carbon tpl-cp">
      <span className="cp__stripe a" aria-hidden {...el('accentDetail')} /><span className="cp__stripe b" aria-hidden {...el('accentDetail')} />
      <header className="cp__hero" {...el('heroBand')}><Photo className="cp__img" /><span className="cp__shade" aria-hidden />{data.business && <span className="cp__tag">{data.business}</span>}</header>
      <div className="pad stack cp__body">
        <div><h1 className="cp__name" {...el('name')}>{first}{rest.length > 0 && <><br />{rest.join(' ')}</>}</h1><Title className="dk-role" /></div>
        {book && <a href={book} {...ext(book)} className="cp__row">Book a shoot<i className="cp__sw" aria-hidden /></a>}
        {folio && <a href={folio} {...ext(folio)} className="cp__row">Portfolio<i className="cp__sw" aria-hidden /></a>}
        <button type="button" onClick={actions.save} className="cp__row">Save contact<i className="cp__sw" aria-hidden /></button>
        <Contacts />
        <Folio />
      </div>
    </div>
  );
}

/* ================================================================ 7 MODE DIAL */
export function ModeDial() {
  const { data, book, folio } = usePhoto();
  const { actions } = useCard();
  const call = useContactActions().find((a) => a.key === 'call' || a.key === 'wa');
  return (
    <div className="tpl tpl-dk tpl-md">
      <div className="pad stack center">
        <div className="md__dial">
          <span className="md__pointer" aria-hidden {...el('accentDetail')} />
          <span className="md__knurl" aria-hidden /><span className="md__cap" aria-hidden />
          <svg className="md__marks" viewBox="0 0 296 296" aria-hidden><g><text x="148" y="50" className="on">M</text><text x="237" y="90">A</text><text x="262" y="156">S</text><text x="237" y="222">P</text><text x="59" y="90">C1</text><text x="34" y="156">C2</text><text x="59" y="222">AUTO</text></g></svg>
          <Photo className="md__img" />
          <span className="md__glint" aria-hidden />
        </div>
        <div><h1 className="md__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title className="dk-role" /></div>
        <div className="md__keys full">
          {book && <a href={book} {...ext(book)} className="md__key"><b {...el('accentDetail')}>M</b><span>Book a session</span></a>}
          {folio && <a href={folio} {...ext(folio)} className="md__key"><b {...el('accentDetail')}>A</b><span>Portfolio</span></a>}
          <button type="button" onClick={actions.save} className="md__key"><b {...el('accentDetail')}>S</b><span>Save contact</span></button>
          {call && <a href={call.href} {...ext(call.href)} className="md__key"><b {...el('accentDetail')}>P</b><span>{call.key === 'wa' ? 'Message me' : 'Call me'}</span></a>}
        </div>
        <Contacts />
        <div className="full"><Folio /></div>
      </div>
    </div>
  );
}

/* ================================================================ 8 PIANO BLACK */
export function PianoBlack() {
  const { data, book, folio } = usePhoto();
  return (
    <div className="tpl tpl-dk tpl-pb">
      <div className="pad stack center">
        {data.business && <p className="pb__studio" {...el('caption')}>{data.business}</p>}
        <div className="pb__mirror">
          <Photo className="pb__img" />
          <div className="pb__reflect" aria-hidden>{data.photoUrl && <img src={data.photoUrl} alt="" />}<span /></div>
        </div>
        <span className="pb__line" aria-hidden {...el('accentDetail')} />
        <div><h1 className="pb__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title className="dk-role" /></div>
        <div className="full stack-sm">
          <Act href={book} className="dk-lacquer">Book a session</Act>
          <Act href={folio} className="dk-lacquer">View portfolio</Act>
          <SaveAct className="dk-lacquer">Save contact</SaveAct>
        </div>
        <Contacts />
        <div className="full"><Folio /></div>
      </div>
    </div>
  );
}

/* ================================================================ 9 FILM STRIP */
export function FilmStrip() {
  const { data, book, folio } = usePhoto();
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  const shots = data.gallery.slice(0, 2);
  return (
    <div className="tpl tpl-dk tpl-fs">
      <div className="fs__strip" aria-hidden={false}>
        {shots[0] ? <img className="fs__frame side" src={shots[0]} alt="" /> : <span className="fs__frame side neg">{data.photoUrl && <img src={data.photoUrl} alt="" />}</span>}
        <span className="fs__frame main" {...el('accentDetail')}><Photo className="fs__img" /></span>
        {shots[1] ? <img className="fs__frame side" src={shots[1]} alt="" /> : <span className="fs__frame side bw">{data.photoUrl && <img src={data.photoUrl} alt="" />}</span>}
        <span className="fs__edge a" aria-hidden>400 · 23A</span>
        <span className="fs__edge b" aria-hidden>24 · 24A</span>
      </div>
      <div className="pad stack">
        <div><h1 className="fs__name" {...el('name')}>{first}{rest.length > 0 && <><br /><span {...el('accentDetail')}>{rest.join(' ')}</span></>}</h1><Title className="fs__role" /></div>
        <div className="stack-sm">
          <Act href={book} className="dk-leader red">Book a session <small>01</small></Act>
          <Act href={folio} className="dk-leader">View the roll <small>02</small></Act>
          <SaveAct className="dk-leader">Save contact <small>03</small></SaveAct>
        </div>
        <Contacts className="fs__contacts" />
        <Folio />
      </div>
    </div>
  );
}

/* ================================================================ 10 STUDIO SOFTBOX */
export function Softbox() {
  const { data, book, folio } = usePhoto();
  return (
    <div className="tpl tpl-dk tpl-dksb">
      <span className="sb__light" aria-hidden /><span className="sb__glow" aria-hidden /><span className="sb__stand" aria-hidden />
      <div className="sb__set" {...el('accentDetail')}><Photo className="sb__img" /><span className="sb__sheen" aria-hidden /></div>
      <span className="sb__floor" aria-hidden {...el('accentDetail')} />
      <div className="pad stack sb__body">
        <div>
          {data.business && <p className="sb__kick" {...el('caption')}>Studio · {data.business}</p>}
          <h1 className="sb__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <Title className="dk-role" />
        </div>
        <Act href={book} className="dk-red">Book studio time</Act>
        <div className="dk-grid2">
          <Act href={folio} className="dk-lit">Portfolio</Act>
          <SaveAct className="dk-lit">Save contact</SaveAct>
        </div>
        <Contacts />
        <Folio />
      </div>
    </div>
  );
}
