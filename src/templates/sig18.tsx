/* =================================================================
   The Bling Collection: 8 designs for jewelry and accessory sellers
   (party-plan and direct-sale consultants).
   Velvet Noir, Blush Satin, Ruby Gloss, Champagne Toast, Amethyst
   After Dark, Leopard Luxe, Pearl Strand, Vanity Lights.
   Website = shop link and Booking = join-my-team link.
   The first highlight is the live party banner; the next three show
   as shop-by-category chips.
   Every class uses a prefix nothing else in the app uses:
   jwx-, jvn__, jbs__, jrg__, jct__, jam__, jlp__, jps__, jvl__.
   ================================================================= */
import { useEffect, type ReactNode } from 'react';
import { ShoppingBag, Users } from 'lucide-react';
import { Btn, HIcon, Logo, Photo, QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, useContactActions } from './blocks';
import { webHref } from '../lib/links';

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});

function useJw() {
  const { data } = useCard();
  const name = data.fullName || 'Your Name';
  const [first, ...rest] = name.split(' ');
  const contacts = useContactActions().filter((a) => a.key !== 'book' && a.key !== 'web');
  return {
    data, first, last: rest.join(' '), contacts,
    shop: data.website ? webHref(data.website) : null,
    join: data.bookingUrl ? webHref(data.bookingUrl) : null,
    live: data.highlights[0] ?? null,
    cats: data.highlights.slice(1, 4),
  };
}

/** Everything under the hero: party banner, shop, quick contact, join, save, socials, share. */
function Body() {
  const { shop, join, contacts, live, cats } = useJw();
  const q = contacts.slice(0, 3);
  return (
    <div className="pad stack jwx-body">
      {live && (
        <div className="jwx-live" {...el('cardBg')}>
          <span className="jwx-live__dot" aria-hidden {...el('accentDetail')} />
          <span className="jwx-live__tx"><b {...el('body')}>{live.title}</b>{live.subtitle && <small {...el('caption')}>{live.subtitle}</small>}</span>
        </div>
      )}
      {shop
        ? <Btn variant="primary" block className="jwx-shop" href={shop} icon={<ShoppingBag size={19} />}>Shop my boutique</Btn>
        : <SaveBtn />}
      {q.length > 0 && (
        <nav className={`jwx-tiles n${q.length}`} aria-label="Contact">
          {q.map((a) => (
            <a key={a.key} href={a.href} {...ext(a.href)} {...el('cardBg')}>
              <span {...el('icons')}>{a.icon}</span><span {...el('body')}>{a.label}</span>
            </a>
          ))}
        </nav>
      )}
      {shop && (
        <div className={`jwx-duo${join ? '' : ' one'}`}>
          {join && <Btn block href={join} icon={<Users size={18} />}>Join my team</Btn>}
          <SaveBtn variant="secondary" />
        </div>
      )}
      {!shop && join && <Btn block href={join} icon={<Users size={18} />}>Join my team</Btn>}
      {cats.length > 0 && (
        <ul className="jwx-cats" aria-label="Shop by category">
          {cats.map((h) => (
            <li key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={16} /></span><span><b {...el('body')}>{h.title}</b>{h.subtitle && <small {...el('caption')}>{h.subtitle}</small>}</span></li>
          ))}
        </ul>
      )}
      <SocialLinks variant="icons" title="" />
      <div className="row jwx-tail"><ShareBtn /><QrBtn /></div>
    </div>
  );
}

function Tagline({ className }: { className: string }) {
  const { data } = useCard();
  return data.tagline ? <p className={className} {...el('accentDetail')}>{data.tagline}</p> : null;
}

/** Big smooth full-width curve that carries the hero into the page. */
function Curve({ className = '' }: { className?: string }) {
  return (
    <svg className={`jwx-curve ${className}`} viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden>
      <path d="M0 48 C120 0 280 0 400 48 Z" />
    </svg>
  );
}

/* The script faces only come in one weight, so they get their own font link (no weight list) instead of
   the shared one, which asks every family for 400 to 700. */
const SCRIPT_FONTS = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Pinyon+Script&display=swap';
function useScriptFonts() {
  useEffect(() => {
    if (document.querySelector(`link[data-fc-font="${SCRIPT_FONTS}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = SCRIPT_FONTS; l.dataset.fcFont = SCRIPT_FONTS;
    document.head.appendChild(l);
  }, []);
}

function Shell({ id, hero, deco }: { id: string; hero: ReactNode; deco?: ReactNode }) {
  useScriptFonts();
  return (
    <div className={`tpl tpl-jwx tpl-${id}`}>
      {deco}
      {hero}
      <Body />
    </div>
  );
}

/* ================================================================ 1 VELVET NOIR */
export function VelvetNoir() {
  const { data } = useJw();
  return (
    <Shell id="jvn" hero={
      <header className="jvn__hero">
        <Logo className="jwx-logo" />
        <div className="jvn__ring" {...el('accentDetail')}><Photo className="jvn__img" /></div>
        <h1 className="jvn__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Tagline className="jvn__script" />
        <Title className="jwx-role" />
        <Curve className="jvn__curve" />
      </header>
    } />
  );
}

/* ================================================================ 2 BLUSH SATIN */
export function BlushSatin() {
  const { first, last } = useJw();
  return (
    <Shell id="jbs" deco={<span className="jbs__satin" aria-hidden />} hero={
      <header className="jbs__hero">
        <Logo className="jwx-logo" />
        <div className="jbs__arch" {...el('cardBg')}><Photo className="jbs__img" /></div>
        <h1 className="jbs__name" {...el('name')}><span className="jbs__first" {...el('accentDetail')}>{first}</span>{last && <span className="jbs__last">{last}</span>}</h1>
        <Title className="jwx-role" />
        <Tagline className="jbs__tag" />
      </header>
    } />
  );
}

/* ================================================================ 3 RUBY GLOSS */
export function RubyGloss() {
  const { first, last } = useJw();
  return (
    <Shell id="jrg" hero={
      <header className="jrg__hero" {...el('heroBand')}>
        <Photo className="jrg__img" />
        <span className="jrg__shade" aria-hidden />
        <Logo className="jwx-logo jrg__logo" />
        <div className="jrg__txt">
          <Tagline className="jrg__script" />
          <h1 className="jrg__name" {...el('name')}>{first}{last && <> {last}</>}</h1>
          <Title className="jwx-role jrg__role" />
        </div>
      </header>
    } />
  );
}

/* ================================================================ 4 CHAMPAGNE TOAST */
const BUBBLES = [[6, 9, 11, 0], [14, 6, 9, 3], [23, 13, 13, 7], [31, 7, 8, 1], [42, 10, 12, 5], [51, 5, 10, 9], [58, 14, 14, 2],
  [66, 8, 9, 6], [73, 11, 12, 4], [81, 6, 11, 8], [88, 12, 10, 1], [94, 7, 13, 6], [36, 9, 7, 10], [70, 5, 8, 11]];
export function ChampagneToast() {
  const { first, last } = useJw();
  return (
    <Shell id="jct" deco={
      <span className="jct__bubbles" aria-hidden>
        {BUBBLES.map(([x, s, dur, delay], i) => <i key={i} style={{ left: `${x}%`, width: s, height: s, animationDuration: `${dur}s`, animationDelay: `-${delay}s` }} {...el('accentDetail')} />)}
      </span>
    } hero={
      <header className="jct__hero">
        <Logo className="jwx-logo" />
        <div className="jct__oval" {...el('accentDetail')}><Photo className="jct__img" /></div>
        <h1 className="jct__name" {...el('name')}><span className="jct__first" {...el('accentDetail')}>{first}</span>{last && <span className="jct__last">{last}</span>}</h1>
        <Title className="jwx-role" />
        <Curve className="jct__curve" />
      </header>
    } />
  );
}

/* ================================================================ 5 AMETHYST AFTER DARK */
const SPARKS = [[8, 6, 0], [22, 18, 0.6], [86, 9, 1.2], [92, 30, 0.3], [12, 36, 1.8], [78, 44, 0.9], [30, 4, 1.5], [64, 14, 2.1], [50, 2, 0.4], [6, 52, 1.1], [94, 58, 1.7], [40, 22, 2.3]];
export function AmethystAfterDark() {
  const { data } = useJw();
  return (
    <Shell id="jam" deco={
      <span className="jam__sparks" aria-hidden>
        {SPARKS.map(([x, y, d], i) => <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${d}s` }} />)}
      </span>
    } hero={
      <header className="jam__hero">
        <Logo className="jwx-logo" />
        <div className="jam__gem" {...el('accentDetail')}><div className="jam__cut"><Photo className="jam__img" /></div></div>
        <h1 className="jam__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Tagline className="jam__script" />
        <Title className="jwx-role" />
      </header>
    } />
  );
}

/* ================================================================ 6 LEOPARD LUXE */
export function LeopardLuxe() {
  const { first, last } = useJw();
  return (
    <Shell id="jlp" deco={<span className="jlp__band" aria-hidden />} hero={
      <header className="jlp__hero">
        <Logo className="jwx-logo" />
        <div className="jlp__row">
          <div className="jlp__frame" {...el('cardBg')}><Photo className="jlp__img" /></div>
          <div className="jlp__who">
            <Tagline className="jlp__script" />
            <h1 className="jlp__name" {...el('name')}>{first}{last && <span>{last}</span>}</h1>
            <Title className="jwx-role" />
          </div>
        </div>
      </header>
    } />
  );
}

/* ================================================================ 7 PEARL STRAND */
const PEARLS = Array.from({ length: 17 }, (_, i) => {
  const t = i / 16;
  return { x: 20 + t * 360, y: 8 + Math.sin(t * Math.PI) * 50, r: 7 + Math.sin(t * Math.PI) * 3 };
});
export function PearlStrand() {
  const { data } = useJw();
  return (
    <Shell id="jps" hero={
      <header className="jps__hero">
        <Logo className="jwx-logo" />
        <svg className="jps__strand" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden>
          <defs><radialGradient id="jps-pearl" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#fff" /><stop offset=".55" stopColor="#F1E9EF" /><stop offset="1" stopColor="#CBBFCC" /></radialGradient></defs>
          {PEARLS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="url(#jps-pearl)" />)}
        </svg>
        <div className="jps__photo" {...el('cardBg')}><Photo className="jps__img" /></div>
        <h1 className="jps__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Tagline className="jps__script" />
        <Title className="jwx-role" />
      </header>
    } />
  );
}

/* ================================================================ 8 VANITY LIGHTS */
const BULBS: [number, number][] = [
  ...[0, 1, 2, 3].map((i) => [6 + i * 29.3, 2] as [number, number]),
  ...[0, 1, 2, 3].map((i) => [6 + i * 29.3, 98] as [number, number]),
  ...[1, 2, 3].map((j) => [2, 2 + j * 24] as [number, number]),
  ...[1, 2, 3].map((j) => [98, 2 + j * 24] as [number, number]),
];
export function VanityLights() {
  const { data } = useJw();
  return (
    <Shell id="jvl" hero={
      <header className="jvl__hero">
        <Logo className="jwx-logo" />
        <div className="jvl__mirror" {...el('heroBand')}>
          <Photo className="jvl__img" />
          {BULBS.map(([x, y], i) => <i key={i} className="jvl__bulb" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${(i * 0.21).toFixed(2)}s` }} aria-hidden />)}
        </div>
        <h1 className="jvl__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Tagline className="jvl__script" />
        <Title className="jwx-role" />
      </header>
    } />
  );
}
