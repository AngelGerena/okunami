/* =================================================================
   The Wellness Collection: 5 fresh white, lime and forest-green designs
   for wellness and network-marketing sellers (patches, supplements,
   skin care), first made for a couple who sell a wellness line.
   Fresh Leaf (a round photo on a glowing lime disk), Forest Band (a
   deep green header on a big curve and a round photo with a lime ring),
   The Pack (bold green shapes like product packaging over a photo
   window), Executive (a serif name beside a small round photo, lime
   rule) and Lime Glass (soft lime light with frosted glass panels).
   Website = shop or catalog link and Booking = join link, the same as
   the other seller niches. With WhatsApp, an Order on WhatsApp button
   is added. Every design shares the Author collection's body and its
   booking pop-up in its "free consultation" wording (sig24).
   Colors come from the element variables (--c-*), so every palette
   the editor makes stays readable. Prefixes: wl-, wlf__, wlb__, wlp__,
   wlx__, wlg__.
   ================================================================= */
import type { ReactNode } from 'react';
import { ShoppingBag, Users } from 'lucide-react';
import { BrandGlyph, el } from './blocks';
import { webHref, waHref } from '../lib/links';
import { Body, useAuthor, type Au } from './sig24';

function Shell({ cls, a, children }: { cls: string; a: Au; children: ReactNode }) {
  return <div className={`tpl tpl-au tpl-wl ${cls}${a.still ? ' is-still' : ''}`}>{children}</div>;
}

/** The logo when there is one, otherwise the business name set as a wordmark. */
export function Mark({ a, cls = '' }: { a: Au; cls?: string }) {
  if (a.data.logoUrl) return <img className={`wl-logo ${cls}`} src={a.data.logoUrl} alt={a.brand || a.name} />;
  if (!a.brand) return null;
  return <p className={`wl-word ${cls}`} {...el('name')}>{a.brand}</p>;
}

export function Pic({ a, cls }: { a: Au; cls: string }) {
  if (!a.data.photoUrl) return <span className={`${cls} au-nophoto`} aria-hidden {...el('heroBand')} />;
  return <img className={cls} src={a.data.photoUrl} alt={a.name} />;
}

/** Name, role and business line. */
function Id({ a, cls = '' }: { a: Au; cls?: string }) {
  return (
    <div className={`wl-id ${cls}`}>
      <h1 className="wl-name" {...el('name')}>{a.name}</h1>
      {a.role && <p className="wl-role" {...el('caption')}>{a.role}</p>}
    </div>
  );
}

/** Order on WhatsApp, Shop and Join, as big candy buttons above the product list. */
export function Sell({ a }: { a: Au }) {
  const { data } = a;
  const rows: { key: string; label: string; href: string; icon: ReactNode; kind: string }[] = [];
  if (data.website) rows.push({ key: 'shop', label: 'Shop my catalog', href: webHref(data.website), icon: <ShoppingBag size={19} strokeWidth={2} aria-hidden />, kind: 'is-shop' });
  if (data.whatsapp) rows.push({ key: 'order', label: 'Order on WhatsApp', href: waHref(data.whatsapp, `Hi ${a.first}, I saw your catalog and I'd like to place an order.`), icon: <BrandGlyph network="whatsapp" size={19} />, kind: 'is-order' });
  if (data.bookingUrl) rows.push({ key: 'join', label: 'Join my team', href: webHref(data.bookingUrl), icon: <Users size={19} strokeWidth={2} aria-hidden />, kind: 'is-join' });
  if (!rows.length) return null;
  return (
    <nav className="wl-sell" aria-label="Shop and join">
      {rows.map((r) => (
        <a key={r.key} className={`wl-btn ${r.kind}`} href={r.href} target="_blank" rel="noopener" onClick={() => a.play('primary')}
          {...el(r.kind === 'is-join' ? 'accentDetail' : 'btnPrimaryBg')}>
          {r.icon}<span>{r.label}</span>
        </a>
      ))}
    </nav>
  );
}

const Divider = ({ cls }: { cls: string }) => (
  <svg className={`wl-cut ${cls}`} viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden>
    <path d={cls === 'is-slant' ? 'M0 0H400V8L0 48Z' : 'M0 0H400V10C300 50 100 50 0 10Z'} />
  </svg>
);

const Leaf = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 120 120" aria-hidden>
    <path d="M24 100C22 54 50 22 104 16 100 70 70 98 24 100Z" fill="currentColor" opacity=".9" />
    <path d="M24 100C44 76 62 58 88 40" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55" />
  </svg>
);

function Wl({ cls, a, hero, divider }: { cls: string; a: Au; hero: ReactNode; divider?: ReactNode }) {
  return (
    <Shell cls={cls} a={a}>
      <header className="wl-hero">{hero}</header>
      {divider}
      {a.motto && <p className="au-motto wl-motto" {...el('name')}>{a.motto}</p>}
      <Body a={a} kind="wellness" topicsTitle="Products" before={<Sell a={a} />} />
    </Shell>
  );
}

/* ================================================================ 1 FRESH LEAF */
export function FreshLeaf() {
  const a = useAuthor();
  return <Wl cls="tpl-wlf" a={a} hero={<>
    <Mark a={a} cls="wlf__mark" />
    <div className="wlf__ring" {...el('accentDetail')}>
      <span className="wlf__glow" aria-hidden />
      <div className="wlf__photo"><Pic a={a} cls="wlf__img" /></div>
      <Leaf cls="wlf__leaf" />
    </div>
    <Id a={a} />
  </>} />;
}

/* ================================================================ 2 FOREST BAND */
export function ForestBand() {
  const a = useAuthor();
  return <Wl cls="tpl-wlb" a={a} hero={<>
    <div className="wlb__band" {...el('heroBand')}>
      <Mark a={a} cls="wlb__mark" />
      <Leaf cls="wlb__leaf" />
    </div>
    <div className="wlb__avatar" {...el('accentDetail')}><Pic a={a} cls="wlb__img" /></div>
    <Id a={a} />
  </>} />;
}

/* ================================================================ 3 THE PACK */
export function ThePack() {
  const a = useAuthor();
  return <Wl cls="tpl-wlp" a={a} hero={<>
    <span className="wlp__shape a" aria-hidden {...el('heroBand')} />
    <span className="wlp__shape b" aria-hidden {...el('heroBand')} />
    <span className="wlp__shape c" aria-hidden {...el('heroBand')} />
    <div className="wlp__window"><div className="au-ratio r105"><Pic a={a} cls="wlp__img" /></div></div>
    <div className="wlp__label">
      <Mark a={a} cls="wlp__mark" />
      <p className="wlp__tag" {...el('accentDetail')}>#{(a.data.kicker || 'wellness').replace(/^#/, '')}</p>
      <h1 className="wl-name wlp__name" {...el('name')}>{a.name}</h1>
    </div>
    {a.role && <p className="wlp__band" {...el('heroBand')}>{a.role}</p>}
  </>} />;
}

/* ================================================================ 4 EXECUTIVE */
export function Executive() {
  const a = useAuthor();
  return <Wl cls="tpl-wlx" a={a} hero={<>
    <Mark a={a} cls="wlx__mark" />
    <div className="wlx__row">
      <div className="wlx__avatar" {...el('accentDetail')}><Pic a={a} cls="wlx__img" /></div>
      <Id a={a} />
    </div>
    <span className="wlx__rule" aria-hidden {...el('accentDetail')} />
  </>} />;
}

/* ================================================================ 5 LIME GLASS */
export function LimeGlass() {
  const a = useAuthor();
  return <Wl cls="tpl-wlg" a={a} hero={<>
    <span className="wlg__blob b1" aria-hidden {...el('accentDetail')} />
    <span className="wlg__blob b2" aria-hidden {...el('heroBand')} />
    <Mark a={a} cls="wlg__mark" />
    <div className="wlg__frame"><div className="au-ratio r105"><Pic a={a} cls="wlg__img" /></div></div>
    <Id a={a} cls="wlg__glass" />
  </>} divider={<Divider cls="is-curve" />} />;
}
