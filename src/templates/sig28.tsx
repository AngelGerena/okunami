/* =================================================================
   The Wellness Duo Collection: 4 designs for wellness and network-
   marketing sellers, first made for a couple who sell a wellness line
   together (a second set beside the Wellness Collection, sig27).
   Lounge (a gold-framed photo, serif name and a script ampersand),
   Duo (a deep green slanted header and a contact row with round
   WhatsApp, Call, Text and Email buttons), Gold Seal (a round photo in a
   slowly turning engraved ring, buttons stacked as a list) and Script
   Curve (a wide photo, a smooth accent curve and the name stacked big).
   Website = shop or catalog link and Booking = join link, the same as the
   other seller niches. Body and free-consultation pop-up come from the
   Author collection (sig24). Colors are element variables (--c-*), so
   every palette the editor makes stays readable.
   Prefixes: wd-, wdl__, wdd__, wds__, wdc__.
   ================================================================= */
import type { ReactNode } from 'react';
import { el } from './blocks';
import { formatPhone } from '../lib/links';
import { Body, useAuthor, type Au } from './sig24';
import { Mark, Pic, Sell } from './sig27';

function Shell({ cls, a, children }: { cls: string; a: Au; children: ReactNode }) {
  return <div className={`tpl tpl-au tpl-wl tpl-wd ${cls}${a.still ? ' is-still' : ''}`}>{children}</div>;
}

/** The name, with a joining "&" or "y" set in the accent (script in some designs). */
function Name({ a, cls = '' }: { a: Au; cls?: string }) {
  const m = a.name.match(/^(.+?)\s+(&|and|y)\s+(.+)$/i);
  return (
    <h1 className={`wl-name wd-name ${cls}`} {...el('name')}>
      {m ? <><span>{m[1]}</span> <em className="wd-amp" {...el('accentDetail')}>{m[2] === '&' ? '&' : m[2]}</em> <span>{m[3]}</span></> : a.name}
    </h1>
  );
}
function Role({ a }: { a: Au }) {
  return a.role ? <p className="wl-role wd-role" {...el('caption')}>{a.role}</p> : null;
}

function Wd({ cls, a, hero }: { cls: string; a: Au; hero: ReactNode }) {
  return (
    <Shell cls={cls} a={a}>
      <header className="wl-hero wd-hero">{hero}</header>
      {a.motto && <p className="au-motto wl-motto" {...el('name')}>{a.motto}</p>}
      <Body a={a} kind="wellness" topicsTitle="Products" before={<Sell a={a} />} />
    </Shell>
  );
}

/* ================================================================ 1 LOUNGE */
export function WdLounge() {
  const a = useAuthor();
  return <Wd cls="tpl-wdl" a={a} hero={<>
    <div className="wdl__frame" {...el('accentDetail')}><div className="au-ratio r105"><Pic a={a} cls="wdl__img" /></div></div>
    <Mark a={a} cls="wdl__mark" />
    <Name a={a} />
    <span className="wdl__rule" aria-hidden {...el('accentDetail')} />
    <Role a={a} />
  </>} />;
}

/* ================================================================ 2 DUO */
export function WdDuo() {
  const a = useAuthor();
  return <Wd cls="tpl-wdd" a={a} hero={<>
    <div className="wdd__band" {...el('heroBand')}>
      <div className="wdd__photo"><Pic a={a} cls="wdd__img" /></div>
      <div className="wdd__id">
        <Mark a={a} cls="wdd__mark" />
        <Name a={a} />
        <Role a={a} />
      </div>
    </div>
    {a.contacts.length > 0 && (
      <div className="wdd__row" {...el('cardBg')}>
        {a.data.photoUrl ? <img className="wdd__av" src={a.data.photoUrl} alt="" /> : <span className="wdd__av au-nophoto" aria-hidden />}
        <div className="wdd__who">
          <b {...el('name')}>{a.first}</b>
          {a.data.phone && <small {...el('caption')}>{formatPhone(a.data.phone)}</small>}
        </div>
        <nav className="wdd__acts" aria-label={`Contact ${a.first}`}>
          {a.contacts.map((c) => (
            <a key={c.key} className={`wdd__act is-${c.key}`} href={c.href} aria-label={c.label}
              {...(/^https?:/i.test(c.href) ? { target: '_blank', rel: 'noopener' } : {})} onClick={() => a.play('tap')} {...el('btnPrimaryBg')}>{c.icon}</a>
          ))}
        </nav>
      </div>
    )}
  </>} />;
}

/* ================================================================ 3 GOLD SEAL */
export function WdSeal() {
  const a = useAuthor();
  const words = (a.brand || a.data.kicker || 'Wellness').toUpperCase();
  const ring = `${words} · NATURAL WELLNESS · ${words} · `;
  return <Wd cls="tpl-wds" a={a} hero={<>
    <div className="wds__seal" {...el('accentDetail')}>
      <svg className="wds__ring" viewBox="0 0 300 300" aria-hidden>
        <defs><path id="wdsPath" d="M150,150 m-128,0 a128,128 0 1,1 256,0 a128,128 0 1,1 -256,0" /></defs>
        <circle cx="150" cy="150" r="146" className="wds__o" />
        <circle cx="150" cy="150" r="110" className="wds__i" />
        <text><textPath href="#wdsPath" textLength="800" lengthAdjust="spacing">{ring}</textPath></text>
      </svg>
      <div className="wds__photo"><Pic a={a} cls="wds__img" /></div>
    </div>
    <Mark a={a} cls="wds__mark" />
    <Name a={a} />
    <Role a={a} />
  </>} />;
}

/* ================================================================ 4 SCRIPT CURVE */
export function WdCurve() {
  const a = useAuthor();
  return <Wd cls="tpl-wdc" a={a} hero={<>
    <div className="wdc__photo"><div className="au-ratio r80"><Pic a={a} cls="wdc__img" /></div>
      <svg className="wdc__curve" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
        <path className="wdc__line" d="M0 60V44C120 4 280 4 400 44V60Z" {...el('accentDetail')} />
        <path className="wdc__fill" d="M0 60V52C120 12 280 12 400 52V60Z" />
      </svg>
    </div>
    <Mark a={a} cls="wdc__mark" />
    <Name a={a} cls="wdc__name" />
    <Role a={a} />
  </>} />;
}
