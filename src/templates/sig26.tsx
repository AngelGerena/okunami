/* =================================================================
   The Spa Collection: ten logo-led looks for massage therapists and
   day spas, first made for Dali. Linen and Oil, Hot Stone, Eucalyptus
   Branch, Marble and Brass, Onyx and Gold, Blush Glow, Bordeaux Silk,
   Washi, Recovery Issue and Hinoki Wood. Each hero is a material
   (linen, basalt, marble, silk, cedar) with the owner's logo or
   monogram; the page below follows the element variables (--c-*) so
   owners can recolor. Shared pieces come from sig20 (rx- classes).
   Prefixes: tpl-sp, sp-, sp1__ to sp10__.
   ================================================================= */
import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { el, useCard } from './blocks';
import { Keys, Lbl, Main, Shell, Tail, useRx } from './sig20';

const SPA_FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Bodoni+Moda:ital,wght@0,500;0,700;1,500&family=Shippori+Mincho:wght@500;700&family=Jost:wght@400;500;600&family=Italiana&family=Marcellus&family=Pinyon+Script&family=DM+Serif+Display:ital@0;1&display=swap';
function useSpaFonts() {
  useEffect(() => {
    if (document.querySelector(`link[data-fc-font="${SPA_FONTS}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = SPA_FONTS; l.dataset.fcFont = SPA_FONTS;
    document.head.appendChild(l);
  }, []);
}

/** The owner's logo when they have one, otherwise the first letter of the business or name. */
function Mark({ className }: { className: string }) {
  const { data } = useCard();
  const letter = ((data.business || data.fullName || 'S').trim()[0] || 'S').toUpperCase();
  return (
    <div className={className} aria-hidden={!data.logoUrl}>
      {data.logoUrl ? <img className="sp-logo" src={data.logoUrl} alt={data.business ? `${data.business} logo` : 'Logo'} /> : <span>{letter}</span>}
    </div>
  );
}

/** Kicker, name, role, license line and tagline, in that order. */
function Id({ kicker = true, name, after }: { kicker?: boolean; name?: ReactNode; after?: ReactNode }) {
  const { data } = useRx();
  return (
    <>
      {kicker && data.business && <p className="sp-kick">{data.business}</p>}
      {name ?? <h1 className="sp-name" {...el('name')}>{data.fullName || 'Your Name'}</h1>}
      {data.jobTitle && <p className="sp-role">{data.jobTitle}</p>}
      {data.credentials && <p className="sp-lic">{data.credentials}</p>}
      {after}
      {data.tagline && <p className="sp-tag">{data.tagline}</p>}
    </>
  );
}

const CURVES = {
  dome: 'M0 60V34Q200 -6 400 34V60Z',
  bowl: 'M0 60V6Q200 70 400 6V60Z',
  slant: 'M0 60V46L400 6V60Z',
  slantr: 'M0 60V6L400 46V60Z',
  swell: 'M0 60V38C130 0 270 72 400 18V60Z',
  wave: 'M0 60V30C100 0 300 60 400 26V60Z',
};
const Curve = ({ d }: { d: keyof typeof CURVES }) => (
  <svg className="sp-curve" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden><path d={CURVES[d]} /></svg>
);

/** Book, contact keys, the treatment menu, then Save, Share and QR. */
function Body({ cls }: { cls: string }) {
  const { data, services, book, contact } = useRx();
  return (
    <div className={`rx-pad sp-body ${cls}`}>
      <Main label="Book a session" href={book} />
      <Keys list={contact} />
      {services.length > 0 && (
        <section className="sp-menu">
          <Lbl>{data.highlightsTitle || 'Treatments'}</Lbl>
          <ul>{services.map((s) => <li key={s.id}><b>{s.title}</b>{s.subtitle && <small>{s.subtitle}</small>}</li>)}</ul>
        </section>
      )}
      {data.hours && <section className="sp-menu sp-hours"><Lbl>Hours</Lbl><p>{data.hours}</p></section>}
      <Tail />
    </div>
  );
}

function Look({ n, curve, hero }: { n: number; curve: keyof typeof CURVES; hero: ReactNode }) {
  useSpaFonts();
  return (
    <Shell cls={`tpl-sp tpl-sp${n}`}>
      <header className={`sp-hero sp${n}__hero`}>{hero}</header>
      <Curve d={curve} />
      <Body cls={`sp${n}__body`} />
    </Shell>
  );
}

/* 1 LINEN AND OIL: ivory linen and a fine double-ring monogram */
export function SpaLinen() {
  return <Look n={1} curve="dome" hero={<><div className="sp-tex" aria-hidden /><Mark className="sp-ring" /><Id /></>} />;
}

/* 2 HOT STONE: warm basalt, stacked stones and rising steam */
export function SpaHotStone() {
  return <Look n={2} curve="swell" hero={<><svg className="sp2__stones" viewBox="0 0 260 230" aria-hidden>
<defs>
<radialGradient id="st1" cx="38%" cy="30%" r="75%"><stop offset="0" stopColor="#6b625a"/><stop offset=".55" stopColor="#3a3430"/><stop offset="1" stopColor="#1b1816"/></radialGradient>
<radialGradient id="st2" cx="40%" cy="28%" r="75%"><stop offset="0" stopColor="#7a7068"/><stop offset=".6" stopColor="#433c37"/><stop offset="1" stopColor="#201c19"/></radialGradient>
<linearGradient id="stg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e3c595"/><stop offset="1" stopColor="#a7834f"/></linearGradient>
</defs>
<g className="sp2__steam" fill="none" stroke="#c9a77c" strokeWidth="2" strokeLinecap="round" opacity=".55">
<path d="M104 52c-10-14 10-22 0-38"/><path d="M130 46c-10-14 10-22 0-38"/><path d="M156 52c-10-14 10-22 0-38"/></g>
<ellipse cx="130" cy="206" rx="112" ry="20" fill="#000" opacity=".35"/>
<ellipse cx="130" cy="178" rx="108" ry="36" fill="url(#st1)"/>
<ellipse cx="128" cy="132" rx="82" ry="28" fill="url(#st2)"/>
<ellipse cx="132" cy="95" rx="54" ry="20" fill="url(#st1)"/>
<path d="M88 92q44-16 86 0" fill="none" stroke="url(#stg)" strokeWidth="2" opacity=".8"/>
</svg><Id /></>} />;
}

/* 3 <svg className="sp3__euca" viewBox="0 0 400 270" aria-hidden><path d="M20 250 Q190 150 380 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><g fill="currentColor" fillOpacity=".22" stroke="currentColor" strokeWidth="1.3"><ellipse cx="40.1" cy="213.2" rx="16.3" ry="13.4" transform="rotate(-31 40.1 213.2)"/><ellipse cx="62.1" cy="249.9" rx="16.3" ry="13.4" transform="rotate(-31 62.1 249.9)"/><ellipse cx="71.7" cy="194.9" rx="15.6" ry="12.8" transform="rotate(-31 71.7 194.9)"/><ellipse cx="93.3" cy="230.4" rx="15.6" ry="12.8" transform="rotate(-31 93.3 230.4)"/><ellipse cx="103.6" cy="176.0" rx="14.9" ry="12.2" transform="rotate(-32 103.6 176.0)"/><ellipse cx="124.8" cy="210.4" rx="14.9" ry="12.2" transform="rotate(-32 124.8 210.4)"/><ellipse cx="135.9" cy="156.7" rx="14.2" ry="11.6" transform="rotate(-32 135.9 156.7)"/><ellipse cx="156.7" cy="189.9" rx="14.2" ry="11.6" transform="rotate(-32 156.7 189.9)"/><ellipse cx="168.5" cy="136.8" rx="13.5" ry="11.1" transform="rotate(-32 168.5 136.8)"/><ellipse cx="188.9" cy="168.9" rx="13.5" ry="11.1" transform="rotate(-32 188.9 168.9)"/><ellipse cx="201.5" cy="116.5" rx="12.8" ry="10.5" transform="rotate(-33 201.5 116.5)"/><ellipse cx="221.4" cy="147.5" rx="12.8" ry="10.5" transform="rotate(-33 221.4 147.5)"/><ellipse cx="234.7" cy="95.7" rx="12.1" ry="9.9" transform="rotate(-33 234.7 95.7)"/><ellipse cx="254.2" cy="125.5" rx="12.1" ry="9.9" transform="rotate(-33 254.2 125.5)"/><ellipse cx="268.4" cy="74.3" rx="11.4" ry="9.3" transform="rotate(-33 268.4 74.3)"/><ellipse cx="287.3" cy="103.0" rx="11.4" ry="9.3" transform="rotate(-33 287.3 103.0)"/><ellipse cx="302.3" cy="52.5" rx="10.7" ry="8.8" transform="rotate(-34 302.3 52.5)"/><ellipse cx="320.8" cy="80.1" rx="10.7" ry="8.8" transform="rotate(-34 320.8 80.1)"/><ellipse cx="336.7" cy="30.1" rx="10.0" ry="8.2" transform="rotate(-34 336.7 30.1)"/><ellipse cx="354.6" cy="56.6" rx="10.0" ry="8.2" transform="rotate(-34 354.6 56.6)"/></g></svg>LYPTUS BRANCH: sage and cream with a drawn branch */
export function SpaEucalyptus() {
  return <Look n={3} curve="bowl" hero={<><svg className="sp3__euca" viewBox="0 0 400 270" aria-hidden><path d="M20 250 Q190 150 380 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><g fill="currentColor" fillOpacity=".22" stroke="currentColor" strokeWidth="1.3"><ellipse cx="40.1" cy="213.2" rx="16.3" ry="13.4" transform="rotate(-31 40.1 213.2)"/><ellipse cx="62.1" cy="249.9" rx="16.3" ry="13.4" transform="rotate(-31 62.1 249.9)"/><ellipse cx="71.7" cy="194.9" rx="15.6" ry="12.8" transform="rotate(-31 71.7 194.9)"/><ellipse cx="93.3" cy="230.4" rx="15.6" ry="12.8" transform="rotate(-31 93.3 230.4)"/><ellipse cx="103.6" cy="176.0" rx="14.9" ry="12.2" transform="rotate(-32 103.6 176.0)"/><ellipse cx="124.8" cy="210.4" rx="14.9" ry="12.2" transform="rotate(-32 124.8 210.4)"/><ellipse cx="135.9" cy="156.7" rx="14.2" ry="11.6" transform="rotate(-32 135.9 156.7)"/><ellipse cx="156.7" cy="189.9" rx="14.2" ry="11.6" transform="rotate(-32 156.7 189.9)"/><ellipse cx="168.5" cy="136.8" rx="13.5" ry="11.1" transform="rotate(-32 168.5 136.8)"/><ellipse cx="188.9" cy="168.9" rx="13.5" ry="11.1" transform="rotate(-32 188.9 168.9)"/><ellipse cx="201.5" cy="116.5" rx="12.8" ry="10.5" transform="rotate(-33 201.5 116.5)"/><ellipse cx="221.4" cy="147.5" rx="12.8" ry="10.5" transform="rotate(-33 221.4 147.5)"/><ellipse cx="234.7" cy="95.7" rx="12.1" ry="9.9" transform="rotate(-33 234.7 95.7)"/><ellipse cx="254.2" cy="125.5" rx="12.1" ry="9.9" transform="rotate(-33 254.2 125.5)"/><ellipse cx="268.4" cy="74.3" rx="11.4" ry="9.3" transform="rotate(-33 268.4 74.3)"/><ellipse cx="287.3" cy="103.0" rx="11.4" ry="9.3" transform="rotate(-33 287.3 103.0)"/><ellipse cx="302.3" cy="52.5" rx="10.7" ry="8.8" transform="rotate(-34 302.3 52.5)"/><ellipse cx="320.8" cy="80.1" rx="10.7" ry="8.8" transform="rotate(-34 320.8 80.1)"/><ellipse cx="336.7" cy="30.1" rx="10.0" ry="8.2" transform="rotate(-34 336.7 30.1)"/><ellipse cx="354.6" cy="56.6" rx="10.0" ry="8.2" transform="rotate(-34 354.6 56.6)"/></g></svg><Mark className="sp-ring" /><Id kicker={false} /></>} />;
}

/* 4 MARBLE AND BRASS: white marble veining and a brass medallion */
export function SpaMarble() {
  return <Look n={4} curve="dome" hero={<><div className="sp-tex" aria-hidden /><Mark className="sp4__medal" /><Id after={<span className="sp-rule" aria-hidden />} /></>} />;
}

/* 5 ONYX AND GOLD: black, gold foil and a fine double frame */
export function SpaOnyx() {
  return <Look n={5} curve="dome" hero={<><div className="sp5__frame" aria-hidden /><Mark className="sp5__mark" /><Id after={<span className="sp-rule" aria-hidden />} /></>} />;
}

/* 6 BLUSH GLOW: blush and rose with a glossy oil-drop orb */
export function SpaBlush() {
  return <Look n={6} curve="wave" hero={<><Mark className="sp6__orb" /><Id /></>} />;
}

/* 7 BORDEAUX SILK: deep wine silk and a champagne-foil monogram */
export function SpaBordeaux() {
  return <Look n={7} curve="swell" hero={<><div className="sp-tex" aria-hidden /><Mark className="sp7__lozenge" /><Id after={<span className="sp7__orn" aria-hidden><i /><b /><i /></span>} /></>} />;
}

/* 8 WASHI: zen paper, an ink brush circle and a red seal */
export function SpaWashi() {
  const { data } = useCard();
  return <Look n={8} curve="slantr" hero={<>{data.jobTitle && <p className="sp8__vert" aria-hidden>{data.jobTitle}</p>}<div className="sp8__ensow"><svg className="sp8__enso" viewBox="0 0 200 200" aria-hidden><path d="M150 40C122 14 70 16 44 48 16 82 26 140 70 162c40 20 92 6 110-36 10-24 6-48-6-66" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" opacity=".9"/><path d="M174 60c4 8 6 14 6 20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity=".6"/></svg><Mark className="sp8__seal" /></div><Id kicker={false} /></>} />;
}

/* 9 RECOVERY ISSUE: a wellness magazine cover with oversized type */
export function SpaRecovery() {
  const { data } = useCard();
  const first = (data.fullName || 'Your Name').trim().split(/\s+/)[0];
  const city = data.address?.city || '';
  return <Look n={9} curve="slant" hero={<>
    <div className="sp9__mast"><span>No. 01</span><span>{data.business || data.jobTitle}</span>{city && <span>{city}</span>}</div>
    <p className="sp9__giant" aria-hidden style={{ '--sp9-size': `min(${Math.min(128, Math.round(330 / (Math.max(first.length, 2) * 0.82)))}px, ${Math.min(30, Math.round(86 / (Math.max(first.length, 2) * 0.82)))}vw)` } as CSSProperties}>{first}</p>
    <p className="sp9__cover">The Recovery Issue</p>
    <Id kicker={false} />
  </>} />;
}

/* 10 HINOKI WOOD: warm cedar grain, like a Nordic sauna */
export function SpaHinoki() {
  return <Look n={10} curve="swell" hero={<><div className="sp-tex" aria-hidden /><Mark className="sp-ring" /><Id /></>} />;
}
