import { useId } from 'react';
/* =================================================================
   The Glam Collection: clean, minimal designs for beauty influencers
   and direct sellers (Farmasi-style "shop my picks" and "join my team").
   The Website field is the shop link and the Booking link is the
   join-my-team link when the card's niche is Beauty Consultants.
   ================================================================= */
import { ArrowUpRight, Share2, ShoppingBag, Sparkles } from 'lucide-react';
import { Btn, Highlights, Logo, Photo, QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, useContactActions } from './blocks';
import { webHref } from '../lib/links';

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});

/** The two big calls to action. Beauty consultants get shop and join wording; anyone else gets website and booking. */
function useGlam() {
  const { data } = useCard();
  const seller = data.niche === 'consultant';
  const shop = data.website ? { href: webHref(data.website), label: seller ? 'Shop my picks' : 'Visit my website' } : null;
  const join = data.bookingUrl ? { href: webHref(data.bookingUrl), label: seller ? 'Join my team' : 'Book now' } : null;
  const contacts = useContactActions().filter((a) => a.key !== 'book' && a.key !== 'web');
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  return { data, shop, join, contacts, first, last: rest.join(' ') };
}

function Ctas({ layout = 'stack' }: { layout?: 'stack' | 'pair' }) {
  const { shop, join } = useGlam();
  return (
    <div className={`gl-ctas gl-ctas--${layout}`}>
      {shop && <Btn variant="primary" block href={shop.href} icon={<ShoppingBag size={18} />}>{shop.label}</Btn>}
      {join && <Btn block href={join.href} icon={<Sparkles size={18} />}>{join.label}</Btn>}
      {layout === 'stack' && <SaveBtn variant={shop || join ? 'secondary' : 'primary'} />}
    </div>
  );
}

function ContactRow({ variant = 'text' }: { variant?: 'text' | 'circles' | 'tiles' }) {
  const { contacts } = useGlam();
  if (!contacts.length) return null;
  return (
    <nav className={`gl-contacts gl-contacts--${variant}`} aria-label="Contact">
      {contacts.map((a) => (
        <a key={a.key} href={a.href} {...ext(a.href)} aria-label={variant === 'circles' ? a.label : undefined} {...el(variant === 'text' ? 'links' : 'cardBg')}>
          {variant !== 'text' && <span {...el('icons')}>{a.icon}</span>}
          {variant !== 'circles' && <span {...el(variant === 'text' ? 'links' : 'body')}>{a.label}</span>}
        </a>
      ))}
    </nav>
  );
}

function Tail() {
  return (
    <>
      <SocialLinks variant="pills" title="" />
      <div className="row gl-tail"><ShareBtn /><QrBtn /></div>
    </>
  );
}

/** A big text row link with an arrow (Leaf, Signature-style lists). */
function RowLinks() {
  const { shop, join } = useGlam();
  const { actions } = useCard();
  return (
    <div className="gl-rows" {...el('dividers')}>
      {shop && <a href={shop.href} {...ext(shop.href)}><span {...el('name')}>{shop.label}</span><span {...el('accentDetail')}><ArrowUpRight size={22} /></span></a>}
      {join && <a href={join.href} {...ext(join.href)}><span {...el('name')}>{join.label}</span><span {...el('accentDetail')}><ArrowUpRight size={22} /></span></a>}
      <button type="button" onClick={actions.save}><span {...el('name')}>Save my contact</span><span {...el('accentDetail')}><ArrowUpRight size={22} /></span></button>
    </div>
  );
}

/* ================================================================ BLUSH HALO */
export function Halo() {
  const { first, last } = useGlam();
  return (
    <div className="tpl tpl-gh">
      <div className="pad stack center">
        <Logo className="gh__logo" />
        <div className="gh__ring" {...el('cardBg')}><Photo className="gh__img" /></div>
        <div>
          <h1 className="gh__name" {...el('name')}>{first} {last && <i {...el('accentDetail')}>{last}</i>}</h1>
          <Title className="gl-role" />
        </div>
        <div className="full"><Ctas /></div>
        <ContactRow variant="circles" />
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ THE LEAF */
export function Leaf() {
  const { first, last } = useGlam();
  return (
    <div className="tpl tpl-glf">
      <svg className="glf__leaf" viewBox="0 0 400 600" aria-hidden><path d="M320 20 C 120 60, 40 260, 80 560 C 160 380, 300 300, 380 120 C 400 70, 370 25, 320 20 Z" /></svg>
      <div className="pad stack">
        <Logo className="glf__logo" />
        <div className="glf__frame" {...el('iconBg')}><Photo className="glf__img" /></div>
        <div>
          <h1 className="glf__name" {...el('name')}>{first}{last && <><br /><span {...el('accentDetail')}>{last}</span></>}</h1>
          <Title className="gl-role" />
        </div>
        <RowLinks />
        <ContactRow variant="tiles" />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ COVER SPLIT */
export function CoverSplit() {
  const { data, first, last } = useGlam();
  return (
    <div className="tpl tpl-gcs">
      <header className="gcs__hero" {...el('heroBand')}>
        <Photo className="gcs__img" />
        {data.logoUrl && <span className="gcs__logo"><Logo /></span>}
      </header>
      <div className="pad stack gcs__body">
        <div>
          <h1 className="gcs__name" {...el('name')}>{first}{last && <><br /><i {...el('accentDetail')}>{last}</i></>}</h1>
          <Title className="gl-role" />
        </div>
        <Ctas layout="pair" />
        <SaveBtn variant="secondary" />
        <ContactRow />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ VELVET PLUM */
export function Plum() {
  const { data } = useGlam();
  return (
    <div className="tpl tpl-gp">
      <header className="gp__hero" {...el('heroBand')}>
        <Photo className="gp__img" />
        {data.logoUrl && <span className="gp__logo"><Logo /></span>}
        <svg className="gp__curve" viewBox="0 0 390 90" preserveAspectRatio="none" aria-hidden><path d="M0 40 C 120 100, 270 0, 390 50 L 390 90 L 0 90 Z" /></svg>
      </header>
      <div className="pad stack center gp__body">
        <div>
          <h1 className="gp__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <Title className="gl-role" />
        </div>
        <div className="full"><Ctas /></div>
        <ContactRow />
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ NEON PULSE */
export function NeonPulse() {
  const { data } = useGlam();
  return (
    <div className="tpl tpl-gn">
      <div className="pad stack center">
        <Logo className="gn__logo" />
        <div className="gn__ring" {...el('accentDetail')}><Photo className="gn__img" /></div>
        <div>
          <h1 className="gn__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <Title className="gl-role" />
        </div>
        <div className="full"><Ctas /></div>
        <ContactRow />
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ ROSE GLASS */
export function RoseGlass() {
  const { data } = useGlam();
  return (
    <div className="tpl tpl-gg">
      <span className="gg__orb a" aria-hidden /><span className="gg__orb b" aria-hidden />
      <div className="pad stack center">
        <Logo className="gg__logo" />
        <div className="gg__ring"><Photo className="gg__img" /></div>
        <div>
          <h1 className="gg__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <Title className="gl-role" />
        </div>
        <section className="gg__panel full" {...el('cardBg')}>
          <Ctas />
          <ContactRow variant="tiles" />
        </section>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
        <div className="row gl-tail"><ShareBtn /><QrBtn /></div>
      </div>
    </div>
  );
}

/* ================================================================ SWATCH BAR */
export function SwatchBar() {
  const { data, shop, join } = useGlam();
  const { actions } = useCard();
  const rows: { key: string; label: string; href?: string; onClick?: () => void }[] = [];
  if (shop) rows.push({ key: 'shop', label: shop.label, href: shop.href });
  if (join) rows.push({ key: 'join', label: join.label, href: join.href });
  rows.push({ key: 'save', label: 'Save contact', onClick: actions.save });
  return (
    <div className="tpl tpl-gs">
      <div className="gs__bar" aria-hidden><i /><i /><i /><i /><i /><i /></div>
      <div className="pad stack">
        <div className="gs__top"><Logo className="gs__logo" /><span className="gs__lbl" {...el('caption')}>Shade card</span></div>
        <div className="gs__frame" {...el('iconBg')}><Photo className="gs__img" /></div>
        <div>
          <h1 className="gs__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <Title className="gl-role" />
        </div>
        <div className="gs__shades">
          {rows.map((r, i) => {
            const inner = <><span>{r.label}</span><small>Shade {String(i + 1).padStart(2, '0')}</small></>;
            return r.href
              ? <a key={r.key} className={`gs__shade s${i}`} href={r.href} {...ext(r.href)}>{inner}</a>
              : <button key={r.key} type="button" className={`gs__shade s${i}`} onClick={r.onClick}>{inner}</button>;
          })}
        </div>
        <ContactRow />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ RUNWAY */
export function Runway() {
  const { data } = useGlam();
  return (
    <div className="tpl tpl-gr">
      <div className="gr__stage">
        <Photo className="gr__img" />
        <span className="gr__shade" {...el('pageBg')} />
        {data.logoUrl && <span className="gr__logo"><Logo /></span>}
        <h1 className="gr__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
      </div>
      <div className="pad stack gr__body">
        <Title className="gl-role" />
        <Ctas layout="pair" />
        <SaveBtn variant="secondary" />
        <ContactRow />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ SILK CURVE */
export function SilkCurve() {
  const { data, first, last } = useGlam();
  return (
    <div className="tpl tpl-gsc">
      <header className="gsc__hero" {...el('heroBand')}>
        <Photo className="gsc__img" />
        {data.logoUrl && <span className="gsc__logo"><Logo /></span>}
        <svg className="gsc__curve" viewBox="0 0 390 120" preserveAspectRatio="none" aria-hidden>
          <path className="fill" d="M0 60 C 100 0, 230 130, 390 40 L 390 120 L 0 120 Z" />
          <path className="line" d="M0 60 C 100 0, 230 130, 390 40" {...el('accentDetail')} />
        </svg>
      </header>
      <div className="pad stack gsc__body">
        <div>
          <h1 className="gsc__name" {...el('name')}>{first} {last && <i {...el('accentDetail')}>{last}</i>}</h1>
          <Title className="gl-role" />
        </div>
        <Ctas layout="pair" />
        <SaveBtn variant="secondary" />
        <ContactRow />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ BOLD BLOCK */
export function BoldBlock() {
  const { data, first, last } = useGlam();
  return (
    <div className="tpl tpl-gb">
      <div className="pad stack">
        <div className="gb__top"><Logo className="gb__logo" />{data.business && <span className="gb__chip" {...el('accentDetail')}>{data.business}</span>}</div>
        <div className="gb__hero">
          <div className="gb__frame" {...el('iconBg')}><Photo className="gb__img" /></div>
          <h1 className="gb__name" {...el('name')}>{first}{last && <><br /><span {...el('accentDetail')}>{last}</span></>}</h1>
        </div>
        <Title className="gl-role" />
        <Ctas layout="pair" />
        <SaveBtn variant="secondary" />
        <ContactRow />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ SUNSET BLOOM */
export function Sunset() {
  const { first, last } = useGlam();
  return (
    <div className="tpl tpl-gsb">
      <div className="gsb__sky" {...el('heroBand')}><Logo className="gsb__logo" /></div>
      <div className="gsb__sheet" {...el('pageBg')}>
        <div className="gsb__ring"><Photo className="gsb__img" /></div>
        <div className="pad stack center">
          <div>
            <h1 className="gsb__name" {...el('name')}>{first} {last && <i {...el('accentDetail')}>{last}</i>}</h1>
            <Title className="gl-role" />
          </div>
          <div className="full"><Ctas /></div>
          <ContactRow />
          <div className="full"><Tail /></div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ GLAM RAIL
   The Side Rail layout, made for beauty sellers: shop and join sit in the rail beside call and WhatsApp. */
type RailShape = 'leafcorner' | 'bleed' | 'circle' | 'arch' | 'oval' | 'mark' | 'blob';

/* The beauty-brand leaf mark, traced from the two-petal logo. Her photo fills the right petal; the left petal is solid accent. */
const MARK_RIGHT = 'M488 695C448 691 430 683 428 671C426 661 430 655 461 624C511 573 555 513 582 460C610 405 614 397 642 361C672 321 698 298 738 278C748 273 759 267 763 265C778 256 790 251 810 244C837 235 843 231 843 222C843 206 809 197 770 203C741 208 729 206 723 196C719 188 722 180 740 157C755 138 760 133 775 121C783 115 794 106 798 101C835 68 881 46 941 31C977 22 1042 21 1054 29C1065 36 1065 47 1054 64C1049 70 1046 75 1024 101C1016 111 999 137 992 148C987 159 982 170 974 193C970 204 965 220 962 228C959 235 954 248 952 256C950 263 945 276 942 285C938 294 927 326 916 358C903 400 895 420 891 430C887 438 881 451 878 458C864 489 842 526 823 549C818 555 811 564 807 569C792 589 786 594 756 616C724 641 720 643 680 662C652 675 634 680 584 688C573 690 560 692 554 693C543 695 499 697 488 695Z';
const MARK_LEFT = 'M68 655C34 651 24 632 44 613C49 607 72 588 95 571C108 560 128 540 139 527C144 521 153 509 160 501C192 461 214 418 241 339C267 262 282 232 329 169C359 129 375 116 416 90C473 56 517 40 585 26C596 24 668 23 683 25C715 29 717 46 688 70C672 84 656 100 645 113C640 119 631 131 625 139C594 176 583 193 571 220C567 229 559 244 555 252C539 280 525 311 516 335C512 348 505 365 500 375C496 384 485 411 476 434C452 493 447 504 430 524C394 569 396 567 361 593C328 618 322 621 294 633C271 642 248 649 223 654C213 656 82 657 68 655Z';
function MarkPortrait() {
  const { data } = useCard();
  const id = 'grlmark' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg className="grl__mark" viewBox="200 10 880 700" role="img" aria-label={data.fullName || 'Portrait'}>
      <defs><clipPath id={id}><path d={MARK_RIGHT} /></clipPath></defs>
      <path d={MARK_LEFT} className="grl__markleft" {...el('accentDetail')} />
      <path d={MARK_RIGHT} className="grl__markbg" {...el('iconBg')} />
      {data.photoUrl && <image href={data.photoUrl} x="430" y="110" width="640" height="600" preserveAspectRatio="xMidYMin slice" clipPath={`url(#${id})`} />}
    </svg>
  );
}

function GlamRail({ shape = 'leafcorner' }: { shape?: RailShape }) {
  const { data, actions } = useCard();
  const { shop, join, contacts, first, last } = useGlam();
  const rail = [
    ...(shop ? [{ key: 'shop', label: 'Shop', href: shop.href, icon: <ShoppingBag size={22} /> }] : []),
    ...(join ? [{ key: 'join', label: 'Join', href: join.href, icon: <Sparkles size={22} /> }] : []),
    ...contacts.filter((a) => a.key === 'call' || a.key === 'wa' || a.key === 'email').map((a) => ({ key: a.key, label: a.key === 'wa' ? 'WhatsApp' : a.label, href: a.href, icon: a.icon })),
  ].slice(0, 5);
  return (
    <div className="tpl tpl-rail tpl-grl">
      <nav className="rail__bar grl__bar" aria-label="Quick actions" {...el('heroBand')}>
        <Logo className="rail__logo grl__logo" />
        {rail.map((a) => <a key={a.key} href={a.href} {...ext(a.href)}>{a.icon}<span>{a.label}</span></a>)}
        <button type="button" onClick={actions.share}><Share2 size={22} /><span>Share</span></button>
        <span className="rail__vert">{data.business || data.fullName}</span>
      </nav>
      <div className="rail__main stack grl__main">
        {shape === 'mark'
          ? <div className="grl__frame grl--mark"><MarkPortrait /></div>
          : <div className={`grl__frame grl--${shape}`} {...el('iconBg')}><Photo className="grl__img" />{shape === 'bleed' && <span className="grl__fade" {...el('pageBg')} />}</div>}
        <div>
          <h1 className="grl__name" {...el('name')}>{first}{last && <><br /><span {...el('accentDetail')}>{last}</span></>}</h1>
          <Title className="gl-role" />
        </div>
        {data.tagline && <p className="grl__tag" {...el('body')}>{data.tagline}</p>}
        <Ctas />
        <QrBtn />
        <Highlights variant="plain" />
        <SocialLinks variant="text" title="Follow me" />
      </div>
    </div>
  );
}

export const GlamRailLeaf = () => <GlamRail shape="leafcorner" />;
export const GlamRailBleed = () => <GlamRail shape="bleed" />;
export const GlamRailCircle = () => <GlamRail shape="circle" />;
export const GlamRailArch = () => <GlamRail shape="arch" />;
export const GlamRailOval = () => <GlamRail shape="oval" />;
export const GlamRailMark = () => <GlamRail shape="mark" />;
export const GlamRailBlob = () => <GlamRail shape="blob" />;
