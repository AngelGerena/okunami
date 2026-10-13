import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Card, Mode } from '../lib/types';
import { store, T } from '../lib/store';
import { useAuth } from '../lib/auth';
import { useT } from '../lib/i18n';
import { IS_DEMO, supabase } from '../lib/supabase';
import { APP_NAME } from '../lib/plans';
import { effectiveMode } from '../lib/theme';
import CardRenderer from '../components/CardRenderer';

export default function PublicCard() {
  const { slug } = useParams();
  const [card, setCard] = useState<Card | null | undefined>(undefined);
  const { session } = useAuth();
  const { t } = useT();
  const [isOwner, setIsOwner] = useState(false);
  const [sysDark, setSysDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => {
    store.publicCard(slug ?? '').then((c) => { setCard(c); if (c) store.track(c.id, 'view'); }).catch(() => setCard(null));
  }, [slug]);
  /* The owner sees an "Edit my card" button on their own public card. Visitors never do:
     it only appears when the signed-in account owns this exact card (checked against owner_id, so admins don't get it on other people's cards). */
  useEffect(() => {
    setIsOwner(false);
    if (IS_DEMO || !card || !session?.user) return;
    let alive = true;
    supabase.from(T.cards).select('id').eq('id', card.id).eq('owner_id', session.user.id).maybeSingle()
      .then(({ data }) => { if (alive) setIsOwner(!!data); });
    return () => { alive = false; };
  }, [card, session]);
  const track = useCallback((kind: string) => { if (card) store.track(card.id, kind); }, [card]);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const f = (e: MediaQueryListEvent) => setSysDark(e.matches);
    mq.addEventListener('change', f); return () => mq.removeEventListener('change', f);
  }, []);

  const wanted: Mode = !card ? 'light' : card.theme.modeDefault === 'auto' ? (sysDark ? 'dark' : 'light') : card.theme.modeDefault;
  const mode: Mode = card ? effectiveMode(card.template, wanted) : wanted;

  useEffect(() => {
    if (!card) return;
    document.title = [card.data.fullName, card.data.business].filter(Boolean).join(' | ');
    const bg = card.theme.overrides[mode].pageBg ?? card.theme.tokens[mode].bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    document.body.style.background = bg;
    return () => { document.body.style.background = ''; };
  }, [card, mode]);

  if (card === undefined) return <div className="pub-loading" aria-busy="true" />;
  if (card === null) return (
    <div className="center-msg">
      <h1>This card isn't available</h1>
      <p>The link may be mistyped, or the owner has taken it offline.</p>
      <Link className="btn btn--ink" to="/">Make your own card</Link>
    </div>);

  return (
    <div className="pub-wrap">
      <div className="pub-card"><CardRenderer card={card} mode={mode} track={track} /></div>
      {/* The footer chip doubles as the owner's way back in: for the owner only, a pencil sits beside "Made with OKUNAMI".
          Its "Edit" label shows for a few seconds after load, then tucks away so only the pencil remains. Visitors see the plain chip. */}
      {(card.badge !== false || isOwner) && (
        <div className={`made-with${isOwner ? ' made-with--owner' : ''}`}>
          {card.badge !== false && <a href="/">Made with {APP_NAME}</a>}
          {isOwner && (
            <Link to={`/app/cards/${card.id}`} className="made-with__edit" aria-label={t("Edit my card. Only you can see this button.")} title={t("Only you see this")}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              <span>{t("Edit my card")}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
