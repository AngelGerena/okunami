/* =================================================================
   The Agent Collection: premium designs for realtors and other
   relationship-driven professionals. Nine looks: Gallery Noir,
   Coastal Estate, The Edit, Monogram Crest, Swiss Grid, Merlot and
   Gold, Linen Signature, Roofline and Agent Profile.
   Every color comes from the element variables (--c-*), so each part
   stays recolorable in the editor.
   ================================================================= */
import { ArrowUpRight, CalendarDays, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { Btn, Logo, Photo, QrBtn, SaveBtn, ShareBtn, SocialLinks, el, useCard } from './blocks';
import { addressLine, formatPhone, mapsHref, prettyUrl, telHref, webHref } from '../lib/links';

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});

interface Act { key: string; label: string; href: string; icon: ReactNode; sub?: string }

/** Names, initials and the contact actions every agent design uses (call, text, email, book, website, office). */
function useAgent() {
  const { data, actions } = useCard();
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  const last = rest.join(' ');
  const initials = ((first[0] || '') + (rest.length ? rest[rest.length - 1][0] : '')).toUpperCase();
  const tel = data.phone ? telHref(data.phone) : '';
  const call: Act | null = tel ? { key: 'call', label: 'Call', href: tel, icon: <Phone size={19} />, sub: formatPhone(data.phone) } : null;
  const text: Act | null = tel ? { key: 'text', label: 'Text', href: 'sms:' + tel.slice(4), icon: <MessageCircle size={19} /> } : null;
  const mail: Act | null = data.email ? { key: 'email', label: 'Email', href: `mailto:${data.email}`, icon: <Mail size={19} />, sub: data.email } : null;
  const book: Act | null = data.bookingUrl ? { key: 'book', label: 'Book a showing', href: webHref(data.bookingUrl), icon: <CalendarDays size={19} />, sub: 'Pick a day and time' } : null;
  const web: Act | null = data.website ? { key: 'web', label: 'Search homes', href: webHref(data.website), icon: <Globe size={19} />, sub: prettyUrl(data.website) } : null;
  const office: Act | null = data.hasLocation && addressLine(data.address) ? { key: 'map', label: 'Visit the office', href: mapsHref(data.address), icon: <MapPin size={19} />, sub: addressLine(data.address) } : null;
  const trio = [call, text, mail].filter(Boolean) as Act[];
  const place = [data.address.city, data.address.region].filter(Boolean).join(', ');
  const role = [data.credentials, data.jobTitle].filter(Boolean).join(' · ');
  return { data, actions, first, last, initials, call, text, mail, book, web, office, trio, place, role };
}

/** A row of square or round contact tiles (call, text, email). */
function Trio({ cls }: { cls: string }) {
  const { trio } = useAgent();
  if (!trio.length) return null;
  return (
    <nav className={cls} aria-label="Contact">
      {trio.map((a) => <a key={a.key} href={a.href} {...el('cardBg')}><span {...el('icons')}>{a.icon}</span><span {...el('body')}>{a.label}</span></a>)}
    </nav>
  );
}

function Tail() {
  return (
    <>
      <SocialLinks variant="pills" title="" />
      <div className="row ag-tail"><ShareBtn /><QrBtn /></div>
    </>
  );
}

/* ================================================================ 1 GALLERY NOIR */
export function Noir() {
  const { data, role, place, book } = useAgent();
  return (
    <div className="tpl tpl-an">
      <div className="pad stack">
        <div className="an__top">{data.business && <span className="an__biz" {...el('title')}>{data.business}</span>}<Logo className="an__logo" /></div>
        <div className="an__frame" {...el('dividers')}>
          <span className="an__glow" {...el('accentDetail')} />
          <Photo className="an__img" />
          <span className="an__fade" {...el('pageBg')} />
        </div>
        <div className="an__id">
          <h1 className="an__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          {(role || place) && <p className="an__kick" {...el('accentDetail')}><i />{[role, place].filter(Boolean).join(' · ')}<i /></p>}
        </div>
        <SaveBtn />
        <Trio cls="an__trio" />
        {book && <a className="an__book" href={book.href} {...ext(book.href)} {...el('cardBg')}>
          <span {...el('accentDetail')}>{book.icon}</span>
          <span className="an__booktx"><b {...el('name')}>Book a private showing</b><small {...el('caption')}>{book.sub}</small></span>
          <span {...el('accentDetail')}><ArrowUpRight size={18} /></span>
        </a>}
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ 2 COASTAL ESTATE */
export function Coastal() {
  const { data, role, place, book, call, mail, office, web } = useAgent();
  const rows = [call && { ...call, label: 'Call or text' }, mail, web, office].filter(Boolean) as Act[];
  return (
    <div className="tpl tpl-ac">
      <header className="ac__hero" {...el('heroBand')}>
        <div className="ac__bar"><span className="ac__place">{place || data.business}</span><Logo className="ac__logo" /></div>
        <span className="ac__sun" {...el('accentDetail')} />
        <div className="ac__ring" {...el('pageBg')}><Photo className="ac__img" /></div>
        <svg className="ac__wave" viewBox="0 0 390 70" preserveAspectRatio="none" aria-hidden><path d="M0 34 C 70 10, 130 10, 195 32 S 320 58, 390 30 L 390 70 L 0 70 Z" {...el('pageBg')} /></svg>
      </header>
      <div className="pad stack center ac__body">
        <div>
          <h1 className="ac__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          {role && <p className="ac__role" {...el('links')}>{role}</p>}
          {data.business && <p className="ac__biz" {...el('title')}>{data.business}</p>}
        </div>
        <div className="ac__pair full">
          <SaveBtn />
          {book && <Btn href={book.href} icon={book.icon}>{book.label}</Btn>}
        </div>
        {rows.length > 0 && <nav className="ac__list full" aria-label="Contact" {...el('cardBg')}>
          {rows.map((a) => <a key={a.key} href={a.href} {...ext(a.href)} {...el('dividers')}>
            <span className="ac__ic" {...el('iconBg')}><span {...el('icons')}>{a.icon}</span></span>
            <span className="ac__tx"><b {...el('body')}>{a.label}</b>{a.sub && <small {...el('caption')}>{a.sub}</small>}</span>
          </a>)}
        </nav>}
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ 3 THE EDIT */
export function Edit() {
  const { data, first, last, book } = useAgent();
  const lines = data.highlights.slice(0, 3);
  return (
    <div className="tpl tpl-ae">
      <div className="ae__mast" style={{ ['--n' as string]: Math.max((last || first).length, 4) }} {...el('accentDetail')}>{(last || first).toUpperCase()}</div>
      <div className="ae__stage">
        <div className="ae__lines">
          {lines.map((h) => <div key={h.id}><b {...el('name')}>{h.title}</b>{h.subtitle && <small {...el('body')}>{h.subtitle}</small>}</div>)}
        </div>
        <div className="ae__photo" {...el('iconBg')}><Photo className="ae__img" /></div>
      </div>
      <div className="pad stack ae__foot">
        <div className="ae__byline" {...el('name')}>
          <div><h1 className="ae__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><p className="ae__role" {...el('title')}>{[data.credentials || data.jobTitle, data.business].filter(Boolean).join(' · ')}</p></div>
          <Logo className="ae__logo" />
        </div>
        <div className="ae__pair">
          <SaveBtn />
          {book && <Btn variant="secondary" href={book.href}>{book.label}</Btn>}
        </div>
        <Trio cls="ae__strip" />
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ 4 MONOGRAM CREST */
export function Crest() {
  const { data, initials, role, book, web } = useAgent();
  const rows = [book && { ...book, label: 'Book a private showing' }, web].filter(Boolean) as Act[];
  return (
    <div className="tpl tpl-acr">
      <span className="acr__border" {...el('dividers')} />
      <div className="pad stack center">
        <div className="acr__top"><Logo className="acr__logo" /></div>
        <div className="acr__crest" {...el('accentDetail')}>
          <div className="acr__inner" {...el('iconBg')}><Photo className="acr__img" /></div>
          <span className="acr__seal" {...el('pageBg')}><span className="acr__diamond" {...el('accentDetail')}><b>{initials}</b></span></span>
        </div>
        <div>
          <h1 className="acr__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          {role && <p className="acr__role" {...el('title')}>{role}</p>}
          {data.business && <p className="acr__biz" {...el('caption')}><i {...el('accentDetail')} />{data.business}<i {...el('accentDetail')} /></p>}
        </div>
        <div className="stack-sm full">
          <SaveBtn label="Save my contact" />
          <Trio cls="acr__trio" />
          {rows.map((a) => <a key={a.key} className="acr__row" href={a.href} {...ext(a.href)} {...el('cardBg')}><span {...el('name')}>{a.label}</span><span {...el('accentDetail')}><ArrowUpRight size={18} /></span></a>)}
        </div>
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ 5 SWISS GRID */
export function SwissGrid() {
  const { data, actions, first, last, place, role, book, call, text, mail } = useAgent();
  const nums = data.highlights.slice(0, 3);
  const rows = [book, call && { ...call, label: 'Call' }, text, mail].filter(Boolean) as Act[];
  return (
    <div className="tpl tpl-asg">
      <div className="pad stack">
        <div className="asg__meta" {...el('name')}><b>{role || data.business}</b><span {...el('title')}>{place}</span></div>
        <div className="asg__grid">
          <div className="asg__block" {...el('accentDetail')}><Photo className="asg__img" /></div>
          <div className="asg__nums">
            {nums.map((h, i) => <div key={h.id}><b {...el('name')}>{String(i + 1).padStart(2, '0')}</b><span {...el('body')}>{h.title}</span></div>)}
            <Logo className="asg__logo" />
          </div>
        </div>
        <div>
          <h1 className="asg__name" {...el('name')}>{first}{last && <><br />{last}</>}</h1>
          {data.business && <p className="asg__biz" {...el('body')}>{data.business}</p>}
        </div>
        <button type="button" className="asg__save" onClick={actions.save} {...el('btnPrimaryBg')}><span {...el('btnPrimaryText')}>Save contact</span><i {...el('accentDetail')} /></button>
        <ol className="asg__rows" {...el('dividers')}>
          {rows.map((a, i) => <li key={a.key}><a href={a.href} {...ext(a.href)}><small {...el('caption')}>{String(i + nums.length + 1).padStart(2, '0')}</small><span {...el('name')}>{a.label}</span><span {...el('name')}>{a.key === 'call' && a.sub ? a.sub : <ArrowUpRight size={18} />}</span></a></li>)}
        </ol>
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ 6 MERLOT AND GOLD */
export function Merlot() {
  const { data, actions, role, place, book } = useAgent();
  return (
    <div className="tpl tpl-am" {...el('heroBand')}>
      <span className="am__glow" {...el('accentDetail')} />
      <div className="pad stack center">
        <div className="am__top">{data.business && <span {...el('accentDetail')}>{data.business}</span>}<Logo className="am__logo" /></div>
        <div className="am__oval" {...el('accentDetail')}><div className="am__inner" {...el('pageBg')}><Photo className="am__img" /></div></div>
        <div>
          <h1 className="am__name" {...el('accentDetail')}>{data.fullName || 'Your Name'}</h1>
          {(role || place) && <p className="am__role" {...el('title')}>{[role, place].filter(Boolean).join(' · ')}</p>}
        </div>
        <div className="stack-sm full">
          <button type="button" className="am__save" onClick={actions.save} {...el('accentDetail')}>Save contact</button>
          {book && <a className="am__book" href={book.href} {...ext(book.href)} {...el('pageBg')}><span {...el('name')}>Book a private showing</span></a>}
          <Trio cls="am__trio" />
        </div>
        <div className="full"><Tail /></div>
      </div>
    </div>
  );
}

/* ================================================================ 7 LINEN SIGNATURE */
export function Linen() {
  const { data, first, role, book, call, mail } = useAgent();
  const rows = [book, call && { ...call, label: 'Call or text' }, mail].filter(Boolean) as Act[];
  return (
    <div className="tpl tpl-al">
      <div className="pad stack">
        <div className="al__top"><Logo className="al__logo" /></div>
        <div className="al__hero">
          <div className="al__arch" {...el('iconBg')}><Photo className="al__img" /></div>
          <span className="al__rule" {...el('dividers')} />
          {data.tagline && <p className="al__tag" {...el('caption')}>{data.tagline}</p>}
          <span className="al__sig" {...el('name')}>{first}</span>
        </div>
        <div>
          <h1 className="al__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <p className="al__role" {...el('title')}>{[role, data.business].filter(Boolean).join(' · ')}</p>
        </div>
        <SaveBtn />
        <nav className="al__rows" aria-label="Contact" {...el('dividers')}>
          {rows.map((a) => <a key={a.key} href={a.href} {...ext(a.href)}><span {...el('name')}>{a.label}</span><small {...el('caption')}>{a.key === 'book' ? <ArrowUpRight size={16} /> : a.sub}</small></a>)}
        </nav>
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ 8 ROOFLINE */
export function Roofline() {
  const { data, role, place, book, web } = useAgent();
  return (
    <div className="tpl tpl-ar">
      <header className="ar__hero" {...el('heroBand')}>
        <div className="ar__bar"><Logo className="ar__logo" /></div>
        <svg className="ar__roof" viewBox="0 0 390 330" aria-hidden><path d="M60 140 L195 18 L330 140 V330 M60 140 V330 M268 66 V36 H292 V88" /></svg>
        <div className="ar__window" {...el('accentDetail')}><Photo className="ar__img" /></div>
      </header>
      <div className="ar__sheet pad stack" {...el('pageBg')}>
        <div>
          <h1 className="ar__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <p className="ar__role" {...el('title')}>{[role, data.business, place].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="ar__pair">
          <SaveBtn />
          {book && <Btn href={book.href}>{book.label}</Btn>}
        </div>
        <Trio cls="ar__trio" />
        {web && <a className="ar__row" href={web.href} {...ext(web.href)} {...el('cardBg')}><span {...el('icons')}>{web.icon}</span><span className="grow" {...el('body')}>{web.label}</span><span {...el('icons')}><ArrowUpRight size={18} /></span></a>}
        <Tail />
      </div>
    </div>
  );
}

/* ================================================================ 9 AGENT PROFILE */
export function AgentProfile() {
  const { data, place, book, web, call } = useAgent();
  const specs = [
    place && { k: 'Market', v: place },
    data.highlights.length > 0 && { k: data.highlightsTitle || 'Specialties', v: data.highlights.map((h) => h.title).join(' · ') },
    data.hasLocation && data.address.street && { k: 'Office', v: data.address.street },
    call && { k: 'Direct', v: call.sub || '' },
  ].filter(Boolean) as { k: string; v: string }[];
  return (
    <div className="tpl tpl-ap">
      <div className="ap__sheet" {...el('cardBg')}>
        <div className="ap__head" {...el('dividers')}><Logo className="ap__logo" /><span {...el('caption')}>Agent profile</span></div>
        <div className="ap__band" {...el('iconBg')}>
          <Photo className="ap__img" />
          <div className="ap__tags">
            {data.credentials && <span className="ap__chip" {...el('heroBand')}>{data.credentials}</span>}
            {data.business && <span className="ap__biz" {...el('body')}>{data.business}</span>}
          </div>
        </div>
        <div className="ap__body stack">
          <div>
            <h1 className="ap__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
            {data.jobTitle && <p className="ap__role" {...el('title')}>{data.jobTitle}</p>}
          </div>
          {specs.length > 0 && <dl className="ap__specs" {...el('dividers')}>
            {specs.map((s) => <div key={s.k}><dt {...el('caption')}>{s.k}</dt><dd {...el('body')}>{s.v}</dd></div>)}
          </dl>}
          {web && <a className="ap__feat" href={web.href} {...ext(web.href)} {...el('dividers')}><span {...el('caption')}>Featured listings</span><b {...el('name')}>{web.sub}</b><span {...el('accentDetail')}><ArrowUpRight size={18} /></span></a>}
          <div className="ap__pair"><SaveBtn />{book && <Btn href={book.href}>{book.label}</Btn>}</div>
          <Trio cls="ap__trio" />
          <Tail />
        </div>
      </div>
    </div>
  );
}
