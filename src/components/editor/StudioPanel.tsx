/* The Studio step: every setting of the OKUNAMI Studio design in one place.
   Shown only when the card is on the 'studio' design. Changes save like any other edit. */
import { ArrowDown, ArrowUp, Eye, EyeOff } from 'lucide-react';
import type { StudioConfig, StudioSection } from '../../lib/types';
import { DEFAULT_SECTIONS, MAIN_KINDS, VIBES, studioOf } from '../../lib/studio';
import { useT } from '../../lib/i18n';
import { Field, Section, type PanelProps } from './Fields';

const HEROES: { v: StudioConfig['hero']; l: string; d: string }[] = [
  { v: 'ring', l: 'Ring', d: 'Round photo with a color ring' },
  { v: 'bleed', l: 'Full photo', d: 'Photo fills the top, name over it' },
  { v: 'split', l: 'Split', d: 'Name on the left, photo on the right' },
  { v: 'band', l: 'Logo band', d: 'Logo leads, photo overlaps' },
  { v: 'arch', l: 'Arch', d: 'Arched portrait' },
];
const MOTIFS: { v: StudioConfig['motif']; l: string }[] = [
  { v: 'none', l: 'None' }, { v: 'dots', l: 'Dots' }, { v: 'grid', l: 'Grid' }, { v: 'stripes', l: 'Stripes' },
  { v: 'rays', l: 'Rays' }, { v: 'waves', l: 'Soft glow' }, { v: 'sparkle', l: 'Sparkle' }, { v: 'grain', l: 'Grain' },
];
const DIVIDERS: { v: StudioConfig['divider']; l: string }[] = [{ v: 'curve', l: 'Curve' }, { v: 'slant', l: 'Slant' }, { v: 'swoop', l: 'Swoop' }, { v: 'none', l: 'None' }];
const MOTIONS: { v: StudioConfig['motion']; l: string }[] = [{ v: 'calm', l: 'Calm' }, { v: 'lively', l: 'Lively' }, { v: 'still', l: 'Still' }];
const SERVICES: { v: StudioConfig['services']; l: string }[] = [{ v: 'tiles', l: 'Tiles' }, { v: 'rows', l: 'Rows' }, { v: 'chips', l: 'Chips' }, { v: 'numbered', l: 'Numbered' }];
const GALLERIES: { v: StudioConfig['gallery']; l: string }[] = [{ v: 'grid', l: 'Grid' }, { v: 'strip', l: 'Swipe strip' }, { v: 'masonry', l: 'Masonry' }];
const SECTION_NAME: Record<StudioSection, string> = { services: 'Services', gallery: 'Photos', hours: 'Hours', location: 'Location', social: 'Social media', contact: 'Contact list' };

function Options<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string; d?: string }[]; onChange: (v: T) => void; label: string }) {
  const { t } = useT();
  return (
    <div className="stu-grid" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} type="button" className="stu-opt" aria-pressed={value === o.v} onClick={() => onChange(o.v)}>
          <b>{t(o.l)}</b>{o.d && <small>{t(o.d)}</small>}
        </button>
      ))}
    </div>
  );
}

export default function StudioPanel({ card, set }: PanelProps) {
  const { t } = useT();
  if (card.template !== 'studio') return <p className="note">{t("The Studio step works on the Studio Custom design.")}</p>;
  const cfg = studioOf(card.data);
  const put = (patch: Partial<StudioConfig>) => set((c) => ({ ...c, data: { ...c.data, studio: { ...studioOf(c.data), ...patch } } }));
  const main = cfg.main ?? { kind: 'call' as const, label: 'Call me', url: '' };
  const hidden = DEFAULT_SECTIONS.filter((s) => !cfg.sections.includes(s));
  const move = (i: number, d: -1 | 1) => {
    const next = [...cfg.sections]; const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]]; put({ sections: next });
  };

  return (
    <>
      <Section title={t("Start from a vibe")} hint={t("Sets the hero, pattern, divider, motion, fonts and buttons in one tap. Your colors and content stay.")}>
        <div className="stu-grid">
          {VIBES.map((v) => (
            <button key={v.id} type="button" className="stu-opt" onClick={() => set((c) => ({
              ...c,
              data: { ...c.data, studio: { ...v.config, sections: studioOf(c.data).sections, main: studioOf(c.data).main } },
              theme: { ...c.theme, fonts: { ...c.theme.fonts, display: v.fonts.display, body: v.fonts.body }, button: v.button, cornerScale: v.cornerScale },
            }))}>
              <b>{t(v.name)}</b><small>{t(v.hint)}</small>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("Hero")}><Options label={t("Hero")} value={cfg.hero} options={HEROES} onChange={(hero) => put({ hero })} /></Section>
      <Section title={t("Pattern")}><Options label={t("Pattern")} value={cfg.motif} options={MOTIFS} onChange={(motif) => put({ motif })} /></Section>
      <Section title={t("Divider")} hint={t("The shape where the top section meets the page.")}><Options label={t("Divider")} value={cfg.divider} options={DIVIDERS} onChange={(divider) => put({ divider })} /></Section>
      <Section title={t("Motion")}><Options label={t("Motion")} value={cfg.motion} options={MOTIONS} onChange={(motion) => put({ motion })} /></Section>

      <Section title={t("Main button")} hint={t("The one action that makes this client money.")}>
        <div className="stu-grid">
          {MAIN_KINDS.map((m) => (
            <button key={m.id} type="button" className="stu-opt" aria-pressed={main.kind === m.id} onClick={() => put({ main: { kind: m.id, label: m.label, url: main.url } })}><b>{t(m.label)}</b></button>
          ))}
        </div>
        <Field label={t("Button text")} value={main.label} maxLength={40} onChange={(label) => put({ main: { ...main, label } })} />
        {MAIN_KINDS.find((m) => m.id === main.kind)?.needsUrl && (
          <Field label={t("Button link")} placeholder="https://" inputMode="url" value={main.url} onChange={(url) => put({ main: { ...main, url } })} />
        )}
      </Section>

      <Section title={t("Sections")} hint={t("Change the order, or hide what this client does not need.")}>
        <ul className="stu-order">
          {cfg.sections.map((s, i) => (
            <li key={s}>
              <span>{t(SECTION_NAME[s])}</span>
              <button type="button" className="icon-btn" aria-label={t("Move up")} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
              <button type="button" className="icon-btn" aria-label={t("Move down")} disabled={i === cfg.sections.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
              <button type="button" className="icon-btn" aria-label={t("Hide")} onClick={() => put({ sections: cfg.sections.filter((x) => x !== s) })}><EyeOff size={16} /></button>
            </li>
          ))}
          {hidden.map((s) => (
            <li key={s} className="off">
              <span>{t(SECTION_NAME[s])}</span>
              <button type="button" className="icon-btn" aria-label={t("Show")} onClick={() => put({ sections: [...cfg.sections, s] })}><Eye size={16} /></button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("Services style")}><Options label={t("Services style")} value={cfg.services} options={SERVICES} onChange={(services) => put({ services })} /></Section>
      <Section title={t("Photos style")}><Options label={t("Photos style")} value={cfg.gallery} options={GALLERIES} onChange={(gallery) => put({ gallery })} /></Section>
    </>
  );
}
