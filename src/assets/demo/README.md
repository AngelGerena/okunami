# Demo portraits

Each file here becomes the sample photo for one niche's demos and gallery previews.
Name the file after the niche id, for example:

- `barber.webp` for Barbershops
- `grooming.webp` for Men's Grooming (the men's Farmasi set needs a man's photo)
- `photo.webp` for Photo and Video
- `stage.webp` for DJs and Musicians

Any niche without a file keeps the shared `sample-portrait.jpg`. Starter layouts borrow a niche portrait through `LAYOUT_NICHE` in `src/lib/niches.ts`.
Use a head-and-shoulders portrait, face centered, 720x960 WebP (keeps the gallery fast), from a source you have the rights to use.
The niche ids are the `id` values in `src/lib/niches.ts`.
