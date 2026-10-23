/* =================================================================
   The Farmasi Collection: 9 direct-seller designs.
   Her line (Beauty Consultants): Rouge Edit, Blush Atelier, Noir Lash,
   Botanical. His line (Men's Grooming): Black Label, Barber Club,
   Copper Forge, Cedar and Smoke, Volt Sport.
   Website = shop link and Booking = join link for both seller niches.
   Highlights drive each design's signature block (table of contents,
   hashtags, scent notes, chair menu, spec sheet, routine split).
   Every class uses a prefix nothing else in the app uses:
   fmx-, fmr__, fmb__, fmn__, fmo__, fml__, fmc__, fmf__, fmw__, fmv__.
   ================================================================= */
import type { ReactNode } from 'react';
import { ArrowUpRight, ShoppingBag, Sparkles } from 'lucide-react';
import { HIcon, Logo, Photo, QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, useContactActions } from './blocks';
import { webHref } from '../lib/links';

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});
export const SELLER_NICHES = new Set(['consultant', 'grooming']);

function useFm() {
  const { data, actions } = useCard();
  const seller = SELLER_NICHES.has(data.niche);
  const his = data.niche === 'grooming';
  const shop = data.website ? {
    href: webHref(data.website),
    label: seller ? (his ? 'Shop my picks' : 'Shop my store') : 'Visit my website',
    sub: seller ? (his ? 'Grooming and fragrance, shipped to you' : 'Makeup, skincare and more, shipped to you') : 'See everything I do',
  } : null;
  const join = data.bookingUrl ? {
    href: webHref(data.bookingUrl),
    label: seller ? (his ? 'Build with me' : 'Join my team') : 'Book now',
    sub: seller ? (his ? 'Meet the team and how to start' : 'I will walk you through it, step by step') : 'Choose a time online',
  } : null;
  const contacts = useContactActions().filter((a) => a.key !== 'book' && a.key !== 'web');
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  const initials = (data.fullName || 'Your Name').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return { data, actions, shop, join, contacts, first, last: rest.join(' '), initials, his };
}

/** Save plus up to three quick contact tiles. */
function Quick({ className = '' }: { className?: string }) {
  const { contacts } = useFm();
  const q = contacts.slice(0, 3);
  return (
    <div className={`fmx-quick ${className}`}>
      <SaveBtn label="Save contact" />
      {q.length > 0 && (
        <nav className={`fmx-tiles n${q.length}`} aria-label="Contact">
          {q.map((a) => (
            <a key={a.key} href={a.href} {...ext(a.href)} {...el('cardBg')}>
              <span {...el('icons')}>{a.icon}</span><span {...el('body')}>{a.label}</span>
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

/** Shop and join as big link rows. `mark` renders the left marker for row i. */
function Rows({ mark, className = '' }: { mark?: (i: number) => ReactNode; className?: string }) {
  const { shop, join } = useFm();
  const items = [shop && { ...shop, ic: <ShoppingBag size={18} /> }, join && { ...join, ic: <Sparkles size={18} /> }].filter(Boolean) as { href: string; label: string; sub: string; ic: ReactNode }[];
  if (!items.length) return null;
  return (
    <div className={`fmx-rows ${className}`}>
      {items.map((it, i) => (
        <a key={it.label} href={it.href} {...ext(it.href)} className="fmx-row" {...el('cardBg')}>
          <span className="fmx-row__mk" {...el('accentDetail')}>{mark ? mark(i) : it.ic}</span>
          <span className="fmx-row__tx"><b {...el('body')}>{it.label}</b><small {...el('caption')}>{it.sub}</small></span>
          <span className="fmx-row__ar" {...el('accentDetail')}><ArrowUpRight size={18} /></span>
        </a>
      ))}
    </div>
  );
}

function Tail() {
  return (
    <>
      <SocialLinks variant="icons" title="" />
      <div className="row fmx-tail"><ShareBtn /><QrBtn /></div>
    </>
  );
}

function Tagline({ className = '' }: { className?: string }) {
  const { data } = useCard();
  return data.tagline ? <p className={`fmx-tag ${className}`} {...el('caption')}>{data.tagline}</p> : null;
}

/* ================================================================ HER 1 ROUGE EDIT */
export function RougeEdit() {
  const { data, first, last } = useFm();
  const hl = data.highlights.slice(0, 4);
  return (
    <div className="tpl tpl-fmx tpl-fmr">
      <header className="fmr__cover" {...el('heroBand')}>
        <Photo className="fmr__img" />
        <span className="fmr__shade" aria-hidden />
        <span className="fmr__word" aria-hidden>{first}</span>
        <span className="fmr__frame" aria-hidden {...el('accentDetail')} />
        <div className="fmr__mast" aria-hidden><span>{data.business || 'The Edit'}</span><span>N.º 01</span></div>
      </header>
      <div className="pad stack center">
        <Logo className="fmx-logo" />
        <div>
          <h1 className="fmr__name" {...el('name')}><i>{first}</i>{last && <span {...el('accentDetail')}>{last}</span>}</h1>
          <Title className="fmx-role" />
        </div>
        {data.tagline && <blockquote className="fmr__quote" {...el('dividers')}><span {...el('accentDetail')}>{data.tagline}</span></blockquote>}
        <div className="full"><Quick /></div>
        {hl.length > 0 && (
          <section className="fmr__toc full">
            <h2 className="fmx-eyebrow" {...el('caption')}>{data.highlightsTitle || 'In this issue'}</h2>
            <ol>{hl.map((h, i) => (
              <li key={h.id} {...el('dividers')}><span className="fmr__pg" {...el('accentDetail')}>p. {String(4 + i * 6).padStart(2, '0')}</span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>
            ))}</ol>
          </section>
        )}
        <div className="full"><Rows /></div>
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ HER 2 BLUSH ATELIER */
export function BlushAtelier() {
  const { data, first, last } = useFm();
  return (
    <div className="tpl tpl-fmx tpl-fmb">
      <header className="fmb__cover">
        <span className="fmb__halo" aria-hidden {...el('accentDetail')} />
        <div className="fmb__oval" {...el('cardBg')}><Photo className="fmb__img" /></div>
        <span className="fmb__seal" aria-hidden {...el('btnPrimaryBg')}>with love</span>
      </header>
      <div className="pad stack center">
        <Logo className="fmx-logo" />
        <div>
          <h1 className="fmb__name" {...el('name')}><span className="fmb__first" {...el('accentDetail')}>{first}</span>{last && <span className="fmb__last">{last}</span>}</h1>
          <Title className="fmx-role" />
        </div>
        <Tagline />
        <div className="fmb__dots" aria-hidden><i /><i /><i /><i /></div>
        <div className="full"><Quick /></div>
        <div className="full"><Rows /></div>
        {data.highlights.length > 0 && (
          <section className="full fmb__list">
            <h2 className="fmx-eyebrow" {...el('caption')}>{data.highlightsTitle}</h2>
            {data.highlights.slice(0, 4).map((h) => (
              <div key={h.id} className="fmb__li" {...el('cardBg')}>
                <span className="fmb__ic" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} size={17} /></span></span>
                <span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span>
              </div>
            ))}
          </section>
        )}
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ HER 3 NOIR LASH */
export function NoirLash() {
  const { data, first, last } = useFm();
  const picked = data.highlights.slice(0, 3).map((h) => h.title.split(' ')[0]);
  const words = picked.length === 3 && picked.every((w) => w.length <= 6) ? picked : ['Lash', 'Lip', 'Look'];
  const tape = [data.business, data.tagline, ...data.highlights.map((h) => h.title)].filter(Boolean).join('  ·  ') || 'Lashes  ·  Lips  ·  Looks';
  return (
    <div className="tpl tpl-fmx tpl-fmn">
      <header className="fmn__cover" {...el('heroBand')}>
        <div className="fmn__shot"><Photo className="fmn__img" /></div>
        <div className="fmn__words" aria-hidden>{words.map((w, i) => <span key={i} className={`w${i}`} {...(i === 0 ? el('accentDetail') : {})}>{w}</span>)}</div>
        <div className="fmn__tape" aria-hidden {...el('btnPrimaryBg')}><div><span>{tape}  ·  </span><span>{tape}  ·  </span></div></div>
      </header>
      <div className="pad stack">
        <div className="fmx-idrow">
          <div>
            <h1 className="fmn__name" {...el('name')}>{first}{last && <><br /><span {...el('accentDetail')}>{last}</span></>}</h1>
            <Title className="fmx-role" />
          </div>
          <Logo className="fmx-logo" />
        </div>
        {data.highlights.length > 0 && (
          <div className="fmn__tags">{data.highlights.map((h) => <span key={h.id} {...el('accentDetail')}>#{h.title.replace(/\s+/g, '')}</span>)}</div>
        )}
        <Quick />
        <Rows />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ HER 4 BOTANICAL */
const Sprig = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 120 90" aria-hidden><path className="s" d="M6 84C40 60 70 40 114 8" /><path d="M40 62c-4-14 4-26 18-28-2 14-6 24-18 28z" /><path d="M66 44c-2-14 8-24 22-24-4 14-10 22-22 24z" /><path d="M40 62c12 4 24 0 30-10-12-2-22 2-30 10z" /></svg>
);
export function Botanical() {
  const { data, first, last } = useFm();
  return (
    <div className="tpl tpl-fmx tpl-fmo">
      <header className="fmo__cover" {...el('cardBg')}>
        <div className="fmo__win" {...el('heroBand')}><Photo className="fmo__img" /></div>
        <Sprig className="fmo__sprig a" /><Sprig className="fmo__sprig b" />
        {data.business && <span className="fmo__stamp">{data.business}</span>}
      </header>
      <div className="pad stack">
        <div className="fmx-idrow">
          <div>
            <h1 className="fmo__name" {...el('name')}>{first}{last && <> <i {...el('accentDetail')}>{last}</i></>}</h1>
            <Title className="fmx-role" />
          </div>
          <Logo className="fmx-logo" />
        </div>
        <Quick />
        {data.tagline && (
          <section className="fmo__label" {...el('dividers')}>
            <h2 {...el('name')}>Ingredients</h2>
            <p {...el('body')}>{data.tagline}</p>
            {(data.hours || data.address.city) && <small {...el('caption')}>{[data.address.city, data.hours].filter(Boolean).join(' · ')}</small>}
          </section>
        )}
        <Rows mark={(i) => <span className="fmo__tile" {...el('iconBg')}>{i === 0 ? <ShoppingBag size={17} /> : <Sparkles size={17} />}</span>} />
        {data.highlights.length > 0 && (
          <section className="fmo__hl">
            <h2 className="fmx-eyebrow" {...el('caption')}>{data.highlightsTitle}</h2>
            {data.highlights.slice(0, 4).map((h) => (
              <div key={h.id} {...el('dividers')}><span className="fmo__tile" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} size={17} /></span></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></div>
            ))}
          </section>
        )}
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ HIS 1 BLACK LABEL */
export function BlackLabel() {
  const { data, first, last, initials } = useFm();
  const notes = data.highlights.slice(0, 3);
  return (
    <div className="tpl tpl-fmx tpl-fml">
      <header className="fml__cover" {...el('heroBand')}>
        <Photo className="fml__img" />
        <span className="fml__shade" aria-hidden />
        <span className="fml__c tl" aria-hidden {...el('accentDetail')} /><span className="fml__c tr" aria-hidden {...el('accentDetail')} />
        <span className="fml__c bl" aria-hidden {...el('accentDetail')} /><span className="fml__c br" aria-hidden {...el('accentDetail')} />
        <span className="fml__crest" aria-hidden {...el('accentDetail')}>{initials}</span>
        <span className="fml__badge" {...el('accentDetail')}>{data.business || 'Black Label'}</span>
      </header>
      <div className="pad stack center">
        <Logo className="fmx-logo" />
        <div>
          <h1 className="fml__name" {...el('name')}>{first}{last && <span {...el('accentDetail')}>{last}</span>}</h1>
          <Title className="fmx-role" />
        </div>
        <Tagline />
        {notes.length > 0 && (
          <div className={`fml__notes n${notes.length} full`} {...el('dividers')}>
            {notes.map((h) => <div key={h.id} {...el('dividers')}><b {...el('accentDetail')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></div>)}
          </div>
        )}
        <div className="full"><Quick /></div>
        <div className="full"><Rows className="fml__rows" /></div>
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ HIS 2 BARBER CLUB */
export function BarberClub() {
  const { data, first, last } = useFm();
  return (
    <div className="tpl tpl-fmx tpl-fmc">
      <header className="fmc__cover">
        <span className="fmc__pole" aria-hidden />
        <div className="fmc__badge" {...el('heroBand')}><Photo className="fmc__img" /></div>
        <span className="fmc__ribbon" {...el('btnPrimaryBg')}>{data.business || 'Grooming Club'}</span>
      </header>
      <div className="pad stack center">
        <Logo className="fmx-logo" />
        <div>
          <h1 className="fmc__name" {...el('name')}>{first}{last && <> <span {...el('accentDetail')}>{last}</span></>}</h1>
          <Title className="fmx-role" />
        </div>
        <Tagline className="fmc__tag" />
        <div className="full"><Quick /></div>
        {data.highlights.length > 0 && (
          <section className="fmc__board full" {...el('heroBand')}>
            <h2>{data.highlightsTitle || 'The chair menu'}</h2>
            {data.highlights.slice(0, 5).map((h) => <p key={h.id}><span>{h.title}</span><i aria-hidden /><span>{h.subtitle}</span></p>)}
          </section>
        )}
        <div className="full"><Rows className="fmc__stubs" /></div>
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ HIS 3 COPPER FORGE */
export function CopperForge() {
  const { data, first, last } = useFm();
  const spec = [...data.highlights.slice(0, 4).map((h) => [h.title, h.subtitle]), ...(data.address.city ? [['Area', [data.address.city, data.address.region].filter(Boolean).join(', ')]] : [])];
  return (
    <div className="tpl tpl-fmx tpl-fmf">
      <header className="fmf__cover" {...el('heroBand')}>
        <Photo className="fmf__img" />
        <span className="fmf__grid" aria-hidden />
        <span className="fmf__stamp" aria-hidden {...el('accentDetail')}>{(data.business || 'Spec sheet').toUpperCase()} / REV.A</span>
        <span className="fmf__dim" aria-hidden {...el('accentDetail')} />
      </header>
      <div className="pad stack">
        <div className="fmx-idrow">
          <div>
            <h1 className="fmf__name" {...el('name')}>{first}{last && <><br /><span {...el('accentDetail')}>{last}</span></>}</h1>
            <Title className="fmx-role fmf__mono" />
          </div>
          <Logo className="fmx-logo" />
        </div>
        <Quick className="fmf__quick" />
        {spec.length > 0 && (
          <dl className="fmf__spec" {...el('dividers')}>
            {spec.map(([k, v]) => <div key={k} {...el('dividers')}><dt {...el('caption')}>{k}</dt><dd {...el('body')}>{v}</dd></div>)}
          </dl>
        )}
        <Rows mark={(i) => <span className="fmf__code">A-0{i + 1}</span>} />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ HIS 4 CEDAR AND SMOKE */
export function CedarSmoke() {
  const { data, first, last, initials } = useFm();
  const tiers = data.highlights.slice(0, 3);
  return (
    <div className="tpl tpl-fmx tpl-fmw">
      <header className="fmw__cover" {...el('heroBand')}>
        <div className="fmw__win"><Photo className="fmw__img" /></div>
        <svg className="fmw__smoke" viewBox="0 0 390 440" preserveAspectRatio="none" aria-hidden><path d="M40 440C60 380 20 340 50 290s0-90 30-140" /><path d="M350 440c-20-60 20-100-10-150s10-90-20-140" /><path d="M330 300c-10-30 14-50 0-80" /></svg>
        <span className="fmw__mono" aria-hidden>{initials.split('').join(' · ')}</span>
      </header>
      <div className="pad stack">
        <div className="fmx-idrow">
          <div>
            <h1 className="fmw__name" {...el('name')}>{first}{last && <> <span {...el('accentDetail')}>{last}</span></>}</h1>
            <Title className="fmx-role" />
          </div>
          <Logo className="fmx-logo" />
        </div>
        <Tagline />
        <Quick />
        {tiers.length > 0 && (
          <section className="fmw__pyr">
            <h2 {...el('name')}>{data.highlightsTitle}</h2>
            {tiers.map((h, i) => <div key={h.id} className={`t${i}`} {...el('heroBand')}><b>{h.title}</b><span>{h.subtitle}</span></div>)}
          </section>
        )}
        <Rows mark={(i) => <span className="fmw__ring" {...el('iconBg')}>{i === 0 ? <ShoppingBag size={17} /> : <Sparkles size={17} />}</span>} />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ HIS 5 VOLT SPORT */
export function VoltSport() {
  const { data, first, last } = useFm();
  const split = data.highlights.slice(0, 2);
  return (
    <div className="tpl tpl-fmx tpl-fmv">
      <header className="fmv__cover" {...el('accentDetail')}>
        <span className="fmv__speed" aria-hidden />
        <span className="fmv__go" aria-hidden>GO</span>
        <div className="fmv__shot" {...el('heroBand')}><Photo className="fmv__img" /></div>
        {data.business && <span className="fmv__tag" {...el('heroBand')}>{data.business}</span>}
      </header>
      <div className="pad stack">
        <div className="fmx-idrow">
          <div>
            <h1 className="fmv__name" {...el('name')}>{first}{last && <><br /><span className="fmv__hi">{last}</span></>}</h1>
            <Title className="fmx-role" />
          </div>
          <Logo className="fmx-logo" />
        </div>
        <Tagline />
        <Quick className="fmv__quick" />
        {split.length > 0 && (
          <div className={`fmv__split n${split.length}`}>
            {split.map((h, i) => <div key={h.id} className={i === 0 ? 'dark' : ''} {...el(i === 0 ? 'heroBand' : 'cardBg')}><b>{h.title}</b><span>{h.subtitle}</span></div>)}
          </div>
        )}
        <Rows mark={(i) => <span className="fmv__sq">{i === 0 ? <ShoppingBag size={17} /> : <Sparkles size={17} />}</span>} />
        <Tail />
      </div>
    </div>
  );
}
