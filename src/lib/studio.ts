/* OKUNAMI Studio: done-for-you custom cards, built from settings instead of new code.

   How a custom card gets made
   1. The client pays. A brand brief is created for them automatically (fc_studio_briefs) and they get an email link.
   2. They fill the brief at okunami.pro/studio/brief/<token>: logo, photos, colors, vibe, main button, content.
   3. In Admin > Studio, Angel opens the brief and presses "Build the first draft". briefToCard() below turns the
      answers into a card on the 'studio' design: their content, colors from their logo, and the preset for the vibe.
   4. Angel polishes it in the editor (the Studio step changes hero, pattern, divider, motion and section order),
      sends the preview, makes one round of changes, then moves the card to the client's account.

   Keep this file free of React so the edge functions and scripts can share the shapes. */
import type { ButtonSpec, Card, CardData, FontSpec, Highlight, SocialLink, StudioConfig, StudioMainKind, StudioSection } from './types';
import { themeFromSeeds } from './theme';
import { hexToHsl, hslToHex, normalizeHex } from './color';

/* ---------------------------------------------------------------- the brief */
export type VibeId = 'clean' | 'bold' | 'luxury' | 'warm' | 'playful' | 'classic' | 'tech' | 'natural' | 'faith';
export type BriefSlot = 'logo' | 'photo' | 'work' | 'team' | 'font';

export interface BriefFile { slot: BriefSlot; path: string; url: string; name: string; }

export interface BriefAnswers {
  fullName: string; business: string; jobTitle: string; tagline: string;
  phone: string; whatsapp: string; email: string; website: string; booking: string;
  address: string; hours: string;
  services: string;          // one per line, "Name - short detail"
  socials: Record<'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'x', string>;
  noLogo: boolean;
  colorsHow: 'logo' | 'mine' | 'pick';
  colors: string[];          // up to 3 hex codes, brand first
  vibes: VibeId[];           // up to 2
  mainKind: StudioMainKind;
  mainUrl: string;
  likes: string;             // cards, sites or accounts they like
  mustHave: string;
  avoid: string;
  team: string;              // team design: one person per line
}

export const emptyAnswers = (): BriefAnswers => ({
  fullName: '', business: '', jobTitle: '', tagline: '', phone: '', whatsapp: '', email: '', website: '', booking: '',
  address: '', hours: '', services: '',
  socials: { instagram: '', facebook: '', tiktok: '', youtube: '', linkedin: '', x: '' },
  noLogo: false, colorsHow: 'logo', colors: [], vibes: [], mainKind: 'call', mainUrl: '',
  likes: '', mustHave: '', avoid: '', team: '',
});

export interface Brief {
  id: string; token: string; kind: 'card' | 'team';
  status: 'waiting' | 'submitted' | 'building' | 'preview' | 'delivered';
  name: string | null; email: string | null; phone: string | null; business: string | null; lang: 'en' | 'es';
  answers: BriefAnswers; files: BriefFile[];
  created_at: string; submitted_at: string | null; emailed_at: string | null; card_id: string | null; note: string | null;
  reseller?: string | null;
}

/* ---------------------------------------------------------------- vibes */
export interface Vibe {
  id: VibeId; name: string; hint: string;
  config: Omit<StudioConfig, 'sections' | 'main'>;
  fonts: FontSpec; button: ButtonSpec; cornerScale: number; modeDefault: 'light' | 'dark';
  /** Used when the client has no colors and no logo. */
  seeds: { brand: string; accent: string };
}

export const VIBES: Vibe[] = [
  { id: 'clean', name: 'Clean and modern', hint: 'Simple, sharp, lots of white space',
    config: { hero: 'split', motif: 'dots', divider: 'slant', motion: 'calm', services: 'rows', gallery: 'grid' },
    fonts: { display: 'Bricolage Grotesque', body: 'Hanken Grotesk' }, button: { shape: 'rounded', size: 'regular', style: 'solid', texture: 'none' },
    cornerScale: 1, modeDefault: 'light', seeds: { brand: '#1F3A5F', accent: '#E07A3F' } },
  { id: 'bold', name: 'Bold and loud', hint: 'Big type, strong color, high energy',
    config: { hero: 'bleed', motif: 'stripes', divider: 'slant', motion: 'lively', services: 'numbered', gallery: 'strip' },
    fonts: { display: 'Oswald', body: 'Source Sans 3' }, button: { shape: 'square', size: 'large', style: 'solid', texture: 'none' },
    cornerScale: 0.4, modeDefault: 'dark', seeds: { brand: '#C8102E', accent: '#FFC845' } },
  { id: 'luxury', name: 'Luxury', hint: 'Elegant, refined, a little gold',
    config: { hero: 'arch', motif: 'sparkle', divider: 'curve', motion: 'calm', services: 'numbered', gallery: 'masonry' },
    fonts: { display: 'Cormorant Garamond', body: 'Manrope' }, button: { shape: 'pill', size: 'regular', style: 'outline', texture: 'satin' },
    cornerScale: 1.2, modeDefault: 'light', seeds: { brand: '#2B2320', accent: '#B8945A' } },
  { id: 'warm', name: 'Warm and friendly', hint: 'Welcoming, soft, easy to talk to',
    config: { hero: 'ring', motif: 'waves', divider: 'curve', motion: 'calm', services: 'tiles', gallery: 'grid' },
    fonts: { display: 'Fraunces', body: 'Figtree' }, button: { shape: 'pill', size: 'regular', style: 'soft', texture: 'none' },
    cornerScale: 1.2, modeDefault: 'light', seeds: { brand: '#8A4B2A', accent: '#E9A23B' } },
  { id: 'playful', name: 'Fun and playful', hint: 'Bright, bouncy, full of personality',
    config: { hero: 'ring', motif: 'dots', divider: 'swoop', motion: 'lively', services: 'chips', gallery: 'strip' },
    fonts: { display: 'Unbounded', body: 'Outfit' }, button: { shape: 'pill', size: 'large', style: 'raised', texture: 'none' },
    cornerScale: 1.4, modeDefault: 'light', seeds: { brand: '#6C3BD1', accent: '#FF5FA2' } },
  { id: 'classic', name: 'Classic and trusted', hint: 'Professional, steady, no surprises',
    config: { hero: 'band', motif: 'none', divider: 'none', motion: 'still', services: 'rows', gallery: 'grid' },
    fonts: { display: 'DM Serif Display', body: 'Work Sans' }, button: { shape: 'rounded', size: 'regular', style: 'solid', texture: 'none' },
    cornerScale: 0.8, modeDefault: 'light', seeds: { brand: '#14365D', accent: '#B58B3B' } },
  { id: 'tech', name: 'Techy', hint: 'Sharp lines, glow, a modern grid',
    config: { hero: 'split', motif: 'grid', divider: 'slant', motion: 'lively', services: 'tiles', gallery: 'strip' },
    fonts: { display: 'Space Grotesk', body: 'IBM Plex Sans' }, button: { shape: 'chamfer', size: 'regular', style: 'glass', texture: 'none' },
    cornerScale: 0.6, modeDefault: 'dark', seeds: { brand: '#1B2A4A', accent: '#5CE1E6' } },
  { id: 'natural', name: 'Natural and calm', hint: 'Earthy, soft texture, unhurried',
    config: { hero: 'arch', motif: 'grain', divider: 'curve', motion: 'calm', services: 'rows', gallery: 'masonry' },
    fonts: { display: 'Lora', body: 'Nunito Sans' }, button: { shape: 'leaf', size: 'regular', style: 'soft', texture: 'linen' },
    cornerScale: 1.1, modeDefault: 'light', seeds: { brand: '#3F5A45', accent: '#C98B5B' } },
  { id: 'faith', name: 'Faith and worship', hint: 'Light, hopeful, reverent',
    config: { hero: 'band', motif: 'rays', divider: 'curve', motion: 'calm', services: 'rows', gallery: 'grid' },
    fonts: { display: 'Marcellus', body: 'Mulish' }, button: { shape: 'pill', size: 'regular', style: 'solid', texture: 'none' },
    cornerScale: 1, modeDefault: 'light', seeds: { brand: '#2E2A5A', accent: '#D4A84B' } },
];
export const VIBE_BY_ID = Object.fromEntries(VIBES.map((v) => [v.id, v])) as Record<VibeId, Vibe>;

export const DEFAULT_SECTIONS: StudioSection[] = ['services', 'gallery', 'hours', 'location', 'social', 'contact'];
export const DEFAULT_STUDIO: StudioConfig = { ...VIBE_BY_ID.clean.config, sections: DEFAULT_SECTIONS };

/** Always returns a complete config, so old or hand-edited cards never break the design. */
export function studioOf(data: CardData): StudioConfig {
  const s = data.studio;
  if (!s) return DEFAULT_STUDIO;
  return { ...DEFAULT_STUDIO, ...s, sections: Array.isArray(s.sections) ? s.sections : DEFAULT_SECTIONS };
}

/* ---------------------------------------------------------------- the main button */
export const MAIN_KINDS: { id: StudioMainKind; label: string; needsUrl: boolean }[] = [
  { id: 'call', label: 'Call me', needsUrl: false },
  { id: 'whatsapp', label: 'Message on WhatsApp', needsUrl: false },
  { id: 'book', label: 'Book an appointment', needsUrl: true },
  { id: 'order', label: 'Order online', needsUrl: true },
  { id: 'quote', label: 'Get a free quote', needsUrl: false },
  { id: 'website', label: 'Visit my website', needsUrl: true },
  { id: 'directions', label: 'Get directions', needsUrl: false },
  { id: 'give', label: 'Give online', needsUrl: true },
];

/* ---------------------------------------------------------------- brief -> card */
const lines = (s: string) => s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
const shiftHue = (hex: string, deg: number) => { const h = hexToHsl(hex); return hslToHex({ h: (h.h + deg + 360) % 360, s: Math.max(h.s, 45), l: Math.min(Math.max(h.l, 40), 58) }); };

/** Brand first, accent second. Falls back to the vibe's own colors. */
export function seedsFromBrief(a: BriefAnswers, vibe: Vibe): { brand: string; accent: string } {
  const picked = a.colors.map((c) => normalizeHex(c)).filter(Boolean) as string[];
  if (!picked.length || a.colorsHow === 'pick') return vibe.seeds;
  return { brand: picked[0], accent: picked[1] ?? shiftHue(picked[0], 150) };
}

function servicesFrom(text: string): Highlight[] {
  return lines(text).slice(0, 8).map((l, i) => {
    const [title, ...rest] = l.split(/\s+[-:|]\s+/);
    return { id: `s${i}`, icon: 'star', title: title.slice(0, 60), subtitle: rest.join(' - ').slice(0, 90) };
  });
}

function socialsFrom(s: BriefAnswers['socials']): SocialLink[] {
  return (Object.keys(s) as (keyof BriefAnswers['socials'])[]).filter((k) => s[k].trim()).map((k, i) => ({ id: `so${i}`, network: k, value: s[k].trim() }));
}

/** Turns a submitted brief into a first draft on the Studio design. Angel polishes it in the editor. */
export function briefToCard(base: Card, brief: Pick<Brief, 'answers' | 'files' | 'name' | 'email' | 'phone' | 'business'>): Card {
  const a = { ...emptyAnswers(), ...brief.answers, socials: { ...emptyAnswers().socials, ...(brief.answers?.socials ?? {}) } };
  const vibe = VIBE_BY_ID[a.vibes[0]] ?? VIBE_BY_ID.clean;
  const second = a.vibes[1] ? VIBE_BY_ID[a.vibes[1]] : null;
  const file = (slot: BriefFile['slot']) => brief.files.filter((f) => f.slot === slot).map((f) => f.url);
  const data: CardData = {
    ...base.data,
    fullName: a.fullName || brief.name || base.data.fullName,
    business: a.business || brief.business || '',
    jobTitle: a.jobTitle,
    tagline: a.tagline,
    phone: a.phone || brief.phone || '',
    whatsapp: a.whatsapp,
    email: a.email || brief.email || '',
    website: a.website,
    bookingUrl: a.booking || (a.mainKind === 'book' ? a.mainUrl : ''),
    hasLocation: !!a.address.trim(),
    address: { ...base.data.address, street: a.address.trim() },
    hours: a.hours,
    highlightsTitle: 'What we offer',
    highlights: servicesFrom(a.services),
    socials: socialsFrom(a.socials),
    photoUrl: file('photo')[0] ?? base.data.photoUrl,
    logoUrl: a.noLogo ? '' : (file('logo')[0] ?? base.data.logoUrl),
    gallery: file('work').slice(0, 9),
    studio: {
      ...vibe.config,
      // a second vibe lends its pattern, so two picks feel like a blend
      motif: second && second.config.motif !== 'none' ? second.config.motif : vibe.config.motif,
      sections: DEFAULT_SECTIONS,
      main: { kind: a.mainKind, label: MAIN_KINDS.find((m) => m.id === a.mainKind)?.label ?? 'Contact me', url: a.mainUrl },
    },
  };
  const theme = themeFromSeeds(seedsFromBrief(a, vibe), { fonts: vibe.fonts, button: vibe.button, cornerScale: vibe.cornerScale, modeDefault: vibe.modeDefault, kit: a.colors });
  return { ...base, template: 'studio', data, theme: { ...theme, sound: base.theme.sound } };
}

/** The checklist Angel works through for every custom card. Shown in Admin > Studio. */
export const BUILD_STEPS = [
  'Brief is complete (logo or no-logo, photo, main button)',
  'Build the first draft from the brief',
  'Hero, pattern and divider match the vibe',
  'Colors pass contrast in light and dark',
  'Main button opens the right place',
  'Phone width: no sideways scroll, tight top spacing',
  'Send the preview link to the client',
  'One round of changes done',
  'Move the card to the client and publish',
];
