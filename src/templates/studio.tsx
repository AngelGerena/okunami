/* OKUNAMI Studio: one design that becomes a custom card through settings (data.studio).
   Hero shape, background pattern, section divider, motion and section order all come from StudioConfig,
   and colors, fonts and buttons from the normal theme, so a new client is setup instead of new code. */
import type { ReactNode } from 'react';
import { CalendarDays, Globe, Heart, MapPin, MessageCircle, Phone, ShoppingBag, FileText } from 'lucide-react';
import type { StudioConfig, StudioDivider, StudioSection } from '../lib/types';
import { studioOf } from '../lib/studio';
import { mapsHref, telHref, waHref, webHref } from '../lib/links';
import {
  Btn, Business, ContactList, Crisis, Dock, Footer, Gallery, Highlights, Hours, LocationCard, Logo, Name, Photo,
  QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard,
} from './blocks';

const MAIN_ICON: Record<NonNullable<StudioConfig['main']>['kind'], ReactNode> = {
  call: <Phone size={19} />, whatsapp: <MessageCircle size={19} />, book: <CalendarDays size={19} />, order: <ShoppingBag size={19} />,
  quote: <FileText size={19} />, website: <Globe size={19} />, directions: <MapPin size={19} />, give: <Heart size={19} />,
};

/** The one big button. Falls back to calling when the chosen action has nothing to open. */
function useMain(cfg: StudioConfig): { label: string; href: string; icon: ReactNode } | null {
  const { data } = useCard();
  const m = cfg.main;
  const quoteMsg = `Hi${data.business ? ` ${data.business}` : ''}, I'd like a free quote.`;
  const pick = (kind: NonNullable<StudioConfig['main']>['kind']): string => {
    switch (kind) {
      case 'call': return telHref(data.phone);
      case 'whatsapp': return waHref(data.whatsapp || data.phone, 'Hi, I found your card and have a question.');
      case 'quote': return m?.url ? webHref(m.url) : (data.whatsapp ? waHref(data.whatsapp, quoteMsg) : data.email ? `mailto:${data.email}?subject=${encodeURIComponent('Free quote')}` : telHref(data.phone));
      case 'directions': return data.hasLocation ? mapsHref(data.address) : '';
      case 'book': return webHref(m?.url || data.bookingUrl);
      case 'website': return webHref(m?.url || data.website);
      default: return webHref(m?.url ?? '');
    }
  };
  if (m) {
    const href = pick(m.kind);
    if (href) return { label: m.label, href, icon: MAIN_ICON[m.kind] };
  }
  if (data.bookingUrl) return { label: 'Book an appointment', href: webHref(data.bookingUrl), icon: MAIN_ICON.book };
  if (data.phone) return { label: 'Call me', href: telHref(data.phone), icon: MAIN_ICON.call };
  return null;
}

/** Big smooth full-width shapes, painted in the page color so the hero flows into the body. */
function Divider({ kind }: { kind: StudioDivider }) {
  if (kind === 'none') return null;
  const d = kind === 'curve' ? 'M0 64 C 120 4, 280 4, 400 64 L400 72 L0 72 Z'
    : kind === 'slant' ? 'M0 72 L400 8 L400 72 Z'
    : 'M0 40 C 90 70, 170 70, 250 38 S 360 0, 400 22 L400 72 L0 72 Z';
  return (
    <svg className="st__div" viewBox="0 0 400 72" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="var(--c-pageBg)" />
    </svg>
  );
}

function Hero({ cfg }: { cfg: StudioConfig }) {
  const { data } = useCard();
  const kicker = data.kicker ? <p className="fc-kicker st__kick" {...el('accentDetail')}>{data.kicker}</p> : null;
  const identity = (
    <div className="st__id">
      {kicker}
      <Name className="st__name" />
      <Title className="st__title" />
      {cfg.hero !== 'band' && <Business className="st__biz" />}
      {data.tagline && <p className="fc-sub st__tag" {...el('caption')}>{data.tagline}</p>}
    </div>
  );
  switch (cfg.hero) {
    case 'bleed':
      return (
        <header className="st__hero st__hero--bleed" {...el('heroBand')}>
          <Photo className="st__bleedImg" />
          <div className="st__shade" />
          <div className="st__over"><Logo className="st__logo st__logo--sm" />{identity}</div>
          <Divider kind={cfg.divider} />
        </header>
      );
    case 'split':
      return (
        <>
          <header className="st__hero st__hero--split" {...el('heroBand')}>
            <div className="st__splitTxt"><Logo className="st__logo st__logo--sm" />{identity}</div>
            <div className="st__splitPh" {...el('cardBg')}><Photo className="st__img" /></div>
            <Divider kind={cfg.divider} />
          </header>
        </>
      );
    case 'band':
      return (
        <>
          <header className="st__hero st__hero--band" {...el('heroBand')}>
            {data.logoUrl ? <Logo className="st__logo st__logo--lg" /> : <span className="st__bandBiz">{data.business || data.fullName}</span>}
            {data.logoUrl && data.business && <span className="st__bandBiz st__bandBiz--sm">{data.business}</span>}
            <Divider kind={cfg.divider} />
          </header>
          <div className="st__overlap"><div className="st__ring" {...el('accentDetail')}><Photo className="st__img" /></div></div>
          <div className="pad st__below">{identity}</div>
        </>
      );
    case 'arch':
      return (
        <>
          <header className="st__hero st__hero--arch" {...el('heroBand')}>
            <Logo className="st__logo st__logo--sm" />
            <div className="st__arch" {...el('cardBg')}><Photo className="st__img" /></div>
            <Divider kind={cfg.divider} />
          </header>
          <div className="pad st__below">{identity}</div>
        </>
      );
    default:   // ring
      return (
        <>
          <header className="st__hero st__hero--ring" {...el('heroBand')}>
            <Logo className="st__logo st__logo--sm" />
            <div className="st__ring" {...el('accentDetail')}><Photo className="st__img" /></div>
            <Divider kind={cfg.divider} />
          </header>
          <div className="pad st__below">{identity}</div>
        </>
      );
  }
}

function Section({ id, cfg }: { id: StudioSection; cfg: StudioConfig }) {
  switch (id) {
    case 'services': return <Highlights variant={cfg.services} />;
    case 'gallery': return <Gallery variant={cfg.gallery} title="Our work" />;
    case 'hours': return <Hours />;
    case 'location': return <LocationCard variant="map" />;
    case 'social': return <SocialLinks variant="icons" title="Follow along" />;
    case 'contact': return <ContactList />;
    default: return null;
  }
}

export function Studio() {
  const { data, still } = useCard();
  const cfg = studioOf(data);
  const main = useMain(cfg);
  const motion = still ? 'still' : cfg.motion;
  return (
    <div className={`tpl tpl-studio st--${cfg.hero} st--motif-${cfg.motif} st--motion-${motion}`}>
      <Hero cfg={cfg} />
      <div className="pad stack st__body">
        <div className="stack-sm full st__acts">
          {main && <Btn variant="primary" block href={main.href} icon={main.icon} className="st__main">{main.label}</Btn>}
          <SaveBtn variant={main ? 'secondary' : 'primary'} />
          <div className="row"><ShareBtn className="grow" /><QrBtn className="grow" /></div>
        </div>
        {cfg.sections.map((id) => <div key={id} className="full st__sec"><Section id={id} cfg={cfg} /></div>)}
        <div className="full"><Crisis /></div>
        <Footer />
      </div>
      <Dock />
    </div>
  );
}
