# Barton Creek — An Omni Resort & Spa

A cinematic, fully self-contained marketing site for the Omni Barton Creek Resort & Spa
(Austin, Texas), modeled on the immersive quality of high-end resort & residence sites.

**Live preview:** open `index.html` over any static file server.

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

No build step, no framework, no backend — every page is hand-tuned static HTML/CSS/JS
that can be dropped onto any host (Netlify, Vercel, S3, GitHub Pages, a cPanel folder).

---

## Pages

| Page | File | Highlights |
| --- | --- | --- |
| Home | `index.html` | Preloader, cinematic hero, stats, editorial features, marquee, pinned horizontal "day" panel, map teaser, residences duo, gallery strip, CTA |
| Explore the Map | `explore.html` | Hyper-real bird's-eye aerial of the actual estate — stitched from public USGS/NAIP imagery — with pan / zoom / pinch, 18 geolocated hotspots, detail drawer, filters, ambient soundscape |
| Golf | `golf.html` | Four championship courses with stat sheets, academy section |
| Wellness & Spa | `wellness.html` | Mokara Spa treatments, three pools, fitness |
| Culinary | `dining.html` | Nine dining venues in an editorial grid |
| Experiences | `experiences.html` | Category tiles, family section, weekly calendar accordion |
| The Residences | `residences.html` | Two collections, ownership steps, FAQ |
| The Resort | `about.html` | Story, interactive timeline, stewardship |
| Gallery | `gallery.html` | Filterable masonry + keyboard-navigable lightbox |
| Inquire | `contact.html` | Validated inquiry form with success state, FAQ |
| 404 | `404.html` | On-brand error page |

## Signature interactions

- **Preloader** with counting percentage and brand reveal (first visit per session)
- **Page-transition veil** — pine curtain with gold monogram between internal pages
- **Lenis** smooth scrolling + **GSAP/ScrollTrigger** choreography
- Masked line-by-line serif text reveals (custom splitter, no club plugins)
- Parallax imagery, clip-path image reveals, scroll-velocity-reactive marquee
- Pinned horizontal scroll section with progress bar
- Custom cursor with contextual labels (`View`, `Drag`) — desktop only
- **Interactive estate map**: a real aerial plate of the property (140 USGS/NAIP
  tiles stitched, color-graded, served locally), drag-to-pan, wheel/pinch zoom,
  constant-size pulsing pins geolocated from OpenStreetMap data, ease-to-pin
  drawer, category filters, designed cartographic overlay (serif labels, compass,
  true scale bar, parchment cartouche) and a real Lake Travis aerial inset
- **Ambient soundscape** synthesized live with WebAudio (wind, warm pad, distant
  songbirds) — zero audio files, toggleable, off by default
- Accordion FAQs, simulated form submission with validation + success states,
  filterable gallery with lightbox
- Full-screen menu with numbered serif links and hover image previews

## Design system

Defined in `assets/css/main.css` (single file, tokenized):

- **Color** — pine `#3c5a46` / deep pine `#2c4434` / ink `#1d2c23` on warm cream
  `#fbf6e9`, with limestone copper `#a8611a` and gold `#dcae72` accents
- **Type** — Cormorant Garamond (display serif, italic accents) + Jost
  (geometric sans for eyebrows, labels, buttons), loaded from Google Fonts
- **Texture** — animated film grain overlay, hairline rules, spaced-caps eyebrows

## Stack notes

- GSAP 3.12, ScrollTrigger and Lenis are **vendored** in `assets/js/vendor/`; the
  estate aerial plates live in `assets/img/` (public-domain USGS NAIP imagery) —
  the site works offline except for photography (Unsplash CDN, every URL verified
  live) and webfonts (Google Fonts, with system serif/sans fallbacks)
- Honors `prefers-reduced-motion`; content fully readable with JavaScript disabled
- No tracking, no cookies, no dependencies to install

## Customization

All copy lives in plain HTML. The map hotspots (names, copy, facts, positions,
images) are a single `SPOTS` array at the top of `assets/js/explore.js` —
positions are percentages of the aerial plate, verified against the real terrain.

---

*Concept shell for presentation purposes. Photography via Unsplash; aerial imagery
via USGS NAIP (public domain). Not affiliated with Omni Hotels & Resorts.*
