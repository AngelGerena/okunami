import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, X } from 'lucide-react';
import CardRenderer from '../components/CardRenderer';
import { sampleCard } from '../lib/seed';
import { demoCardFor } from '../lib/niches';
import { TEMPLATES } from '../templates';
import Brand from '../components/Brand';

/** A real, fully interactive sample card. It is the labelled "Open demo" target for every design preview on the
    landing page, so keyboard and screen-reader users get the actual card, not an inert picture of it.
    Sample links, phone numbers and addresses are fictional, so leaving the page through them is disabled. */
export default function DemoCard() {
  const { template = '' } = useParams();
  const base = useMemo(() => sampleCard(), []);
  const layout = TEMPLATES.find((t) => t.id === template);
  const [note, setNote] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* Close = step back to the landing page when that is where the visitor came from, so no new history entry is
     stacked (the phone's back button then leaves the site instead of reopening earlier demos). A demo opened
     straight from a shared link has nothing to go back to, so it replaces itself with the landing page. */
  const cameFromLanding = (location.state as { from?: string } | null)?.from === 'landing';
  const close = useCallback(() => {
    if (cameFromLanding) navigate(-1);
    else navigate('/', { replace: true });
  }, [cameFromLanding, navigate]);

  // Open every demo at the top: the landing page's scroll position must not carry over into the demo.
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [template]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  // Every layout gets sample content from a niche it suits, so a barbershop demo never shows an interior designer.
  const demo = useMemo(() => (layout ? demoCardFor(base, layout.id) : null), [layout, base]);
  const card = demo?.card ?? null;
  const hit = demo?.niche ? { niche: demo.niche, design: demo.design } : null;
  const name = demo?.design?.name ?? layout?.name ?? 'Design';

  useEffect(() => { document.title = `${name} demo | OKUNAMI`; return () => { document.title = 'OKUNAMI'; }; }, [name]);
  useEffect(() => { if (!note) return; const t = setTimeout(() => setNote(null), 3500); return () => clearTimeout(t); }, [note]);

  if (!card) {
    return (
      <div className="demo">
        <header className="demo__bar"><Brand tone="dark" /><button type="button" className="demo__close" onClick={close} aria-label="Close demo"><X size={22} aria-hidden /></button></header>
        <main className="demo__missing"><h1>That design was not found</h1><button type="button" className="btn btn--gold" onClick={close}>Back to all designs</button></main>
      </div>
    );
  }

  // Sample content only: block navigation to fictional addresses, keep every in-card control working.
  const guard = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute('href') ?? '';
    if (/^(https?:|tel:|mailto:|sms:|geo:|maps:)/i.test(href) && !a.hasAttribute('download')) {
      e.preventDefault();
      setNote('This is a sample card, so its links, numbers and addresses are not real.');
    }
  };

  return (
    <div className="demo">
      <header className="demo__bar">
        <button type="button" className="demo__back" onClick={close}><ArrowLeft size={16} aria-hidden /> All designs</button>
        <p className="demo__label"><b>{name}</b> demo{hit ? <> for {hit.niche.name.toLowerCase()}</> : null}. Everything on the card works. The business is fictional.</p>
        <Link to="/signup" className="btn btn--gold btn--sm demo__use"><Sparkles size={15} aria-hidden /> Use this design</Link>
        <button type="button" className="demo__close" onClick={close} aria-label="Close demo" title="Close demo"><X size={22} aria-hidden /></button>
      </header>
      <main className="demo__stage" onClickCapture={guard}>
        <div className="demo__phone"><div className="demo__screen"><CardRenderer card={card} mode={demo?.mode ?? 'light'} sound={false} /></div></div>
      </main>
      {note && <p className="demo__note" role="status">{note}</p>}
    </div>
  );
}
