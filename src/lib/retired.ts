/* ------------------------------------------------------------------
   Retired designs (Oct 2026 library cleanup).
   These are near-copies of a sibling design that does the same idea
   better, or misfits. They are hidden from every picker, the landing
   gallery and the design counts, but their layouts stay registered,
   so any card already using one keeps rendering exactly as before.
   Never delete a layout file just because it is listed here.
   ------------------------------------------------------------------ */
export const RETIRED = new Set<string>([
  // Glam Rail clones: Glam Rail stays
  'railbleed', 'railcircle', 'railarch', 'railoval', 'railmark', 'railblob', 'rail',
  // Worship clones: Santuario and Frecuencia stay (Frecuencia has a live customer)
  'celestial', 'constelacion', 'escenario', 'salmo', 'vitral',
  // Tech: Synthwave, Radar, Mission Control, Dossier, IDE, Trace and Mainframe stay
  'quantum', 'aurora', 'hologram', 'liquid', 'bioscan', 'accessgranted', 'warroom', 'coderain', 'enhance', 'vault', 'terminal',
  // Red photographer set: Viewfinder, Mode Dial, Film Strip, Safelight and Rangefinder stay
  'aperture', 'carbonpro', 'pianoblack', 'lensring', 'softbox',
  // Camera families: the strongest of each stays
  'zebras', 'peaking', 'slog', 'focuslock', 'seamless', 'mediumformat', 'digitalback', 'filmsim', 'hybridvf',
  'cinescreen', 'focusguide', 'punchin',
  // Beauty influencer
  'plum', 'silkcurve', 'sunset', 'neonpulse',
  // Salon and nails
  'goldleaf', 'blowout', 'shimmer', 'gloss',
  // Barbers
  'razor', 'clipper',
  // Other duplicates
  'vinyl', 'lotus', 'toolbelt', 'crest', 'radial',
  // Replaced by the Redo collection (Reel Live, Golden Hour, Vellum, Gloss Bar, Stillwater, Glow Edit)
  'creator', 'estate', 'monogram', 'tips', 'stones', 'roseglass',
  // Misfits
  'starfield', 'bamboo', 'cmdk',
]);

export const isRetired = (template: string) => RETIRED.has(template);

/** Shown first in the landing gallery: each has one idea people remember. */
export const FEATURED = [
  'goldring', 'chalkboard', 'passport', 'boarding', 'vanity', 'waveform',
  'orderticket', 'swatch', 'perfume', 'synthwave', 'casefile', 'hymnboard',
];
