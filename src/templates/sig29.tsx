/* =================================================================
   The Daylight Collection: 9 light designs for photographers, creative
   founders and web designers, first made for Angel Gerena (Finesse Media).
   Daylight Lens (photo inside a lens barrel), Grease Pencil (a contact
   sheet with your frame circled), Newsstand (you on a magazine cover),
   Sunset Glass (frosted panels over a warm sunset), Poster Grid (Swiss
   poster type), Gallery Wall (framed, matted portrait and a placard),
   Browser Window (the card inside a browser, roles typing out), Candy
   Gloss (cherry and gold gloss buttons) and Live View (a camera screen
   that locks focus on you, then a sheet slides up), plus Instant Wall
   (instant prints taped to a white wall), Postage Stamp (your portrait as
   a stamp on an airmail envelope), Color Tiles (an app-style tile grid with
   every way to reach you on one screen) and Horizon Curve (a warm color
   band sweeping into a big smooth curve over a round photo).
   Body and booking pop-up come from the Author collection (sig24, kind
   'creative'). Colors are element variables (--c-*), so any palette the
   editor makes stays readable.
   Prefixes: dl-, dll__, dls__, dlc__, dlg__, dlw__, dlm__, dlb__, dly__, dlv__, dli__, dlp__, dlt__, dlh__.
   ================================================================= */
import { useEffect, useState, type ReactNode } from 'react';
import { el } from './blocks';
import { prettyUrl } from '../lib/links';
import { Body, useAuthor, type Au } from './sig24';
import { Mark, Pic } from './sig27';

function Shell({ cls, a, children }: { cls: string; a: Au; children: ReactNode }) {
  return <div className={`tpl tpl-au tpl-dl ${cls}${a.still ? ' is-still' : ''}`}>{children}</div>;
}
function Name({ a, cls = '' }: { a: Au; cls?: string }) {
  return <h1 className={`dl-name ${cls}`} {...el('name')}>{a.name}</h1>;
}
function Role({ a, cls = '' }: { a: Au; cls?: string }) {
  return a.role ? <p className={`dl-role ${cls}`} {...el('caption')}>{a.role}</p> : null;
}
function Dl({ cls, a, hero }: { cls: string; a: Au; hero: ReactNode }) {
  return (
    <Shell cls={cls} a={a}>
      <header className="dl-hero">{hero}</header>
      {a.motto && <p className="au-motto dl-motto" {...el('name')}>{a.motto}</p>}
      <Body a={a} kind="creative" topicsTitle="What I do" />
    </Shell>
  );
}
/** Up to n highlight titles, for cover lines and numbered lists. */
const lines = (a: Au, n: number) => a.data.highlights.slice(0, n).map((h) => h.title).filter(Boolean);
/** A gallery photo, falling back to the portrait. */
const shot = (a: Au, i: number) => a.data.gallery[i] || a.data.photoUrl;

/* ================================================================ 1 DAYLIGHT LENS */
export function DlLens() {
  const a = useAuthor();
  const rim = `${(a.brand || a.name).toUpperCase()} · 24 35 50 70 85 105 MM · F/2.8 · `;
  return <Dl cls="tpl-dll" a={a} hero={<>
    <div className="dll__top"><Mark a={a} cls="dll__mark" />{a.data.kicker && <span className="dll__tag" {...el('iconBg')}><i {...el('accentDetail')} /><b {...el('caption')}>{a.data.kicker}</b></span>}</div>
    <div className="dll__lens">
      <svg className="dll__ring" viewBox="0 0 300 300" aria-hidden>
        <defs><path id="dllPath" d="M150,150 m-132,0 a132,132 0 1,1 264,0 a132,132 0 1,1 -264,0" /></defs>
        <circle cx="150" cy="150" r="146" className="dll__o" {...el('name')} />
        <circle cx="150" cy="150" r="120" className="dll__i" />
        <text><textPath href="#dllPath" textLength="820" lengthAdjust="spacing">{rim}</textPath></text>
      </svg>
      <div className="dll__photo"><Pic a={a} cls="dll__img" /></div>
    </div>
    <Name a={a} />
    <Role a={a} />
    <p className="dll__exif" {...el('accentDetail')}>85mm · f/2.8 · 1/200 · ISO 100</p>
  </>} />;
}

/* ================================================================ 2 GREASE PENCIL (contact sheet) */
export function DlSheet() {
  const a = useAuthor();
  const has = (i: number) => !!a.data.gallery[i];
  return <Dl cls="tpl-dls" a={a} hero={<>
    <div className="dls__film" {...el('name')}>
      <span className="dls__holes" aria-hidden />
      <div className="dls__frames">
        <figure className="dls__f">{has(0) ? <img src={shot(a, 0)} alt="" /> : <span className="au-nophoto" />}<figcaption>12A</figcaption></figure>
        <figure className="dls__f is-pick"><Pic a={a} cls="dls__img" /><figcaption>13</figcaption>
          <svg className="dls__circle" viewBox="0 0 200 240" aria-hidden><path d="M100 8C42 6 10 60 12 122s40 112 92 110 86-50 84-118S150 4 84 14" {...el('accentDetail')} /></svg>
          <span className="dls__note" {...el('accentDetail')}>this one!</span></figure>
        <figure className="dls__f">{has(1) ? <img src={shot(a, 1)} alt="" /> : <span className="au-nophoto" />}<figcaption>13A</figcaption></figure>
      </div>
      <span className="dls__holes" aria-hidden />
    </div>
    <Name a={a} cls="dls__name" />
    <Role a={a} />
    {a.brand && <p className="dls__brand" {...el('caption')}>{a.brand}</p>}
  </>} />;
}

/* ================================================================ 3 NEWSSTAND (magazine cover) */
export function DlCover() {
  const a = useAuthor();
  const mast = (a.brand || a.first).split(/\s+/)[0].toUpperCase();
  const cover = lines(a, 3);
  return <Dl cls="tpl-dlc" a={a} hero={<>
    <div className="dlc__cover">
      <p className="dlc__mast" {...el('btnPrimaryBg')}>{mast}</p>
      <div className="dlc__photo"><Pic a={a} cls="dlc__img" />
        {a.data.kicker && <p className="dlc__ed" {...el('name')}>{a.data.kicker}</p>}
        <div className="dlc__lines">
          <b>{a.data.highlightsTitle || 'The Founder Issue'}</b>
          {cover.map((t) => <span key={t} {...el('btnPrimaryBg')}>{t}</span>)}
        </div>
      </div>
    </div>
    <Name a={a} cls="dlc__name" />
    <Role a={a} />
  </>} />;
}

/* ================================================================ 4 SUNSET GLASS */
export function DlGlass() {
  const a = useAuthor();
  return <Dl cls="tpl-dlg" a={a} hero={<>
    <span className="dlg__blob b1" aria-hidden /><span className="dlg__blob b2" aria-hidden />
    <div className="dlg__card">
      <div className="dlg__photo"><Pic a={a} cls="dlg__img" /></div>
      <div className="dlg__id"><Name a={a} /><Role a={a} />{a.brand && <p className="dlg__brand">{a.brand}</p>}</div>
    </div>
  </>} />;
}

/* ================================================================ 5 POSTER GRID (Swiss) */
export function DlSwiss() {
  const a = useAuthor();
  const list = lines(a, 4);
  const where = [a.data.address.city, a.data.address.region].filter(Boolean).join(', ');
  return <Dl cls="tpl-dlw" a={a} hero={<>
    <div className="dlw__top" {...el('dividers')}><span>{a.brand || a.role}</span><span>{where}</span></div>
    <h1 className="dl-name dlw__name" {...el('name')}>{a.first}<br />{a.last}</h1>
    <div className="dlw__grid" {...el('dividers')}>
      <div className="dlw__photo" {...el('accentDetail')}><Pic a={a} cls="dlw__img" /></div>
      {list.length > 0 && <ol className="dlw__list">{list.map((t, i) => <li key={t} className={i === list.length - 1 ? 'is-last' : ''}><small>{i + 1}</small><span>{t}</span></li>)}</ol>}
    </div>
    <Role a={a} />
  </>} />;
}

/* ================================================================ 6 GALLERY WALL */
export function DlGallery() {
  const a = useAuthor();
  const where = [a.data.address.city, a.data.address.region].filter(Boolean).join(', ');
  return <Dl cls="tpl-dlm" a={a} hero={<>
    <div className="dlm__wall">
      <span className="dlm__light" aria-hidden />
      <div className="dlm__frame" {...el('name')}><div className="dlm__mat"><div className="au-ratio r125"><Pic a={a} cls="dlm__img" /></div></div></div>
      <div className="dlm__placard">
        <Name a={a} />
        {a.role && <p className="dlm__it" {...el('body')}>{a.role}</p>}
        {a.brand && <p {...el('body')}>{a.brand}</p>}
        {where && <p className="dlm__small" {...el('caption')}>On view in {where}</p>}
      </div>
    </div>
  </>} />;
}

/* ================================================================ 7 BROWSER WINDOW */
function Typed({ words, still }: { words: string[]; still: boolean }) {
  const [text, setText] = useState(words[0] || '');
  useEffect(() => {
    if (still || words.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let w = 0, c = words[0].length, del = true, pause = 14;
    const id = setInterval(() => {
      if (pause > 0) { pause--; return; }
      if (del) { c--; if (c <= 0) { del = false; w = (w + 1) % words.length; } }
      else { c++; if (c >= words[w].length) { del = true; pause = 16; } }
      setText(words[w].slice(0, Math.max(c, 0)));
    }, 70);
    return () => clearInterval(id);
  }, [still, words.join('|')]);
  return <span className="dlb__typed">{text || ' '}</span>;
}
export function DlBrowser() {
  const a = useAuthor();
  const roles = (a.role || 'Creative').split(/\s*[·|,/]\s*/).filter(Boolean).map((r) => r.toLowerCase() + '.');
  const url = a.data.website ? prettyUrl(a.data.website) : (a.brand || a.first).toLowerCase().replace(/\s+/g, '') + '.com';
  return <Dl cls="tpl-dlb" a={a} hero={<>
    <div className="dlb__win" {...el('cardBg')}>
      <div className="dlb__chrome"><i /><i /><i /><span className="dlb__url">{url}</span></div>
      <div className="dlb__tabs" {...el('dividers')}><span className="is-on">Home</span><span>Work</span><span>Contact</span></div>
      <div className="dlb__hero">
        <div className="dlb__photo"><div className="au-ratio r125"><Pic a={a} cls="dlb__img" /></div></div>
        <div>
          <p className="dlb__hi" {...el('accentDetail')}>Hello, I'm</p>
          <Name a={a} />
          <p className="dlb__type" {...el('body')}><Typed words={roles} still={a.still} /><i className="dlb__caret" {...el('btnPrimaryBg')} /></p>
        </div>
      </div>
      <p className="dlb__status" {...el('dividers')}><i {...el('accentDetail')} /><span {...el('caption')}>{a.data.kicker || 'Open to new projects'}</span></p>
    </div>
  </>} />;
}

/* ================================================================ 8 CANDY GLOSS */
export function DlCandy() {
  const a = useAuthor();
  return <Dl cls="tpl-dly" a={a} hero={<>
    <div className="dly__head">
      <div className="dly__ring" {...el('btnPrimaryBg')}><div className="au-ratio" style={{ ['--ratio' as string]: '100%' }}><Pic a={a} cls="dly__img" /></div></div>
      {a.data.logoUrl && <img className="dly__logo" src={a.data.logoUrl} alt={a.brand || a.name} />}
    </div>
    <Name a={a} />
    <Role a={a} />
    {a.data.kicker && <p className="dly__badge" {...el('iconBg')}><span {...el('btnPrimaryBg')}>{a.data.kicker}</span></p>}
  </>} />;
}

/* ================================================================ 9 LIVE VIEW */
export function DlLive() {
  const a = useAuthor();
  return <Dl cls="tpl-dlv" a={a} hero={<>
    <div className="dlv__vf">
      <Pic a={a} cls="dlv__img" />
      <div className="dlv__hud"><span>AF-S</span><span>ISO 100</span><span>1/200</span><span>F2.8</span><span className="dlv__bat"><i /></span></div>
      <span className="dlv__c tl" /><span className="dlv__c tr" /><span className="dlv__c bl" /><span className="dlv__c br" />
      <span className="dlv__grid" aria-hidden /><span className="dlv__af" aria-hidden {...el('accentDetail')} />
      <p className="dlv__lock"><i {...el('accentDetail')} />Focus locked</p>
    </div>
    <div className="dlv__sheet">
      <Mark a={a} cls="dlv__mark" />
      <Name a={a} />
      <Role a={a} />
    </div>
  </>} />;
}

/* ================================================================ 10 INSTANT WALL */
export function DlPrints() {
  const a = useAuthor();
  const cap = lines(a, 2);
  return <Dl cls="tpl-dli" a={a} hero={<>
    <div className="dli__wall">
      <figure className="dli__p p1">{a.data.gallery[0] ? <img src={shot(a, 0)} alt="" /> : <span className="au-nophoto" />}{cap[0] && <figcaption>{cap[0]}</figcaption>}</figure>
      <figure className="dli__p p2"><span className="dli__tape" aria-hidden {...el('accentDetail')} /><Pic a={a} cls="dli__img" /><figcaption>{a.first}</figcaption></figure>
      <figure className="dli__p p3">{a.data.gallery[1] ? <img src={shot(a, 1)} alt="" /> : <span className="au-nophoto" />}{cap[1] && <figcaption>{cap[1]}</figcaption>}</figure>
    </div>
    <Name a={a} />
    <Role a={a} />
  </>} />;
}

/* ================================================================ 11 POSTAGE STAMP */
export function DlStamp() {
  const a = useAuthor();
  const town = (a.data.address.city || a.brand || a.first).toUpperCase();
  const ring = `${town} · ${town} · `;
  return <Dl cls="tpl-dlp" a={a} hero={<>
    <div className="dlp__env" {...el('cardBg')}>
      <div className="dlp__stamp"><div className="au-ratio r125"><Pic a={a} cls="dlp__img" /></div>{a.brand && <span {...el('btnPrimaryBg')}>{a.brand}</span>}</div>
      <svg className="dlp__mark" viewBox="0 0 220 160" aria-hidden {...el('accentDetail')}>
        <defs><path id="dlpPath" d="M80,80 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" /></defs>
        <circle cx="80" cy="80" r="70" /><circle cx="80" cy="80" r="46" />
        <text className="dlp__ring"><textPath href="#dlpPath" textLength="360" lengthAdjust="spacing">{ring}</textPath></text>
        <text x="80" y="86" className="dlp__c">{new Date().getFullYear()}</text>
        <path className="dlp__w" d="M152 60c10 8 20-8 30 0s20-8 30 0M152 80c10 8 20-8 30 0s20-8 30 0M152 100c10 8 20-8 30 0s20-8 30 0" />
      </svg>
      <div className="dlp__to" {...el('btnPrimaryBg')}>
        <small {...el('accentDetail')}>Par avion · Express</small>
        <Name a={a} />
        <Role a={a} />
      </div>
    </div>
  </>} />;
}

/* ================================================================ 12 COLOR TILES */
export function DlTiles() {
  const a = useAuthor();
  return <Dl cls="tpl-dlt" a={a} hero={<>
    <div className="dlt__grid">
      <div className="dlt__t is-photo"><Pic a={a} cls="dlt__img" /></div>
      <div className="dlt__t is-id" {...el('cardBg')}>
        {a.data.logoUrl && <img className="dlt__logo" src={a.data.logoUrl} alt={a.brand || a.name} />}
        <Name a={a} /><Role a={a} />
      </div>
      {a.contacts.map((c, i) => (
        <a key={c.key} className={`dlt__t is-c c${i + 1}`} href={c.href} {...(/^https?:/i.test(c.href) ? { target: '_blank', rel: 'noopener' } : {})}
          onClick={() => a.play('tap')} {...el(i === 0 ? 'btnPrimaryBg' : i === 1 ? 'accentDetail' : 'heroBand')}>{c.icon}<span>{c.label}</span></a>
      ))}
    </div>
  </>} />;
}

/* ================================================================ 13 HORIZON CURVE */
export function DlHorizon() {
  const a = useAuthor();
  return <Dl cls="tpl-dlh" a={a} hero={<>
    <div className="dlh__band" {...el('heroBand')}>
      <div className="dlh__top"><Mark a={a} cls="dlh__mark" />{a.data.kicker && <span className="dlh__tag">{a.data.kicker}</span>}</div>
    </div>
    <div className="dlh__photo" {...el('cardBg')}><div className="au-ratio" style={{ ['--ratio' as string]: '100%' }}><Pic a={a} cls="dlh__img" /></div></div>
    <Name a={a} />
    <Role a={a} />
  </>} />;
}
