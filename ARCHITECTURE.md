# Tesla-Essentials.com — Architecture (2026)

This document describes the current structure and conventions for the project.

## Overview

Tesla-Essentials.com is a single-page affiliate content site focused on essential accessories for Tesla vehicles, with primary emphasis on Model 3 and Model Y, plus growing coverage for Model S, X, and Cybertruck.

**Design Philosophy**: "Marquee" — futuristic art-deco (July 2026 redesign). Warm
onyx ground, champagne-gold signage accents, Tesla red reserved strictly for CTAs.
Dark-only. Glow is earned: only labels, brand moments, and interactive states glow;
body surfaces stay flat with gold-tinted hairline borders. Signature element is the
hero sunburst — champagne hairline rays fanning up from the horizon (pure CSS
`repeating-conic-gradient`), echoed by `——◆——` deco rules.

Type: Big Shoulders Display (condensed, uppercase headlines) · Manrope (body) ·
JetBrains Mono (labels, eyebrows, chips).

## Site Structure

```
/
├── index.html                 # The main experience (single filterable grid)
├── css/style.css              # "Marquee" design system
├── js/main.js                 # Vanilla JS: filter engine, reveals, toolbar
├── images/
│   ├── hero/                  # (og:image only — hero is now pure graphic)
│   └── products/<slug>/       # Product photos (kept reasonably optimized)
├── scripts/
│   └── optimize-images.sh     # Helper for new photos
├── 404.html
├── sitemap.xml
├── robots.txt
├── CNAME
└── tasks/                     # Internal project tracking + product research
```

## Key Conventions

### Product Organization — one grid, filtered
As of July 2026 there are **no per-model sections**. All products live in a single
`#collection` grid. Each card is deduplicated: a product that fits multiple
vehicles appears once, carrying every vehicle it fits.

The catalog is aggressively deduplicated — **11 cards** (from 42 sectioned
originals). Any products that are the same purchase decision are one card.

Two card shapes exist:
- **Single-CTA** — one "View on Amazon" button + `fit-chip`s stating years/trims
  (only the universal single-SKU items: jack pads).
- **Multi-option (picker)** — a `product-card__ctas` group holding 2+ Amazon
  links. JS collapses the group into ONE gold **"Select your model"** button that
  opens the shared `#fit-modal` `<dialog>`; the inline links stay in the DOM as a
  no-JS / crawler fallback (hidden via `.has-picker`). The group's
  `data-picker` attribute is `"fit"` (choose the version for your car — mats,
  sunshades, screen protectors, organizers, door liners, under-seat storage,
  plate mounts) or `"kit"` (a multi-part setup where you buy each piece — the
  trigger reads "See the N-piece kit" — the glove-box USB kit and the Sentry
  storage kit). Each option link carries `data-fits` (so the modal narrows to the
  active vehicle filter) and an optional `data-note` (secondary line: trim detail
  or the part's role in a kit). The affiliate disclosure lives only in the footer
  — never repeat it in the modal.

Merge whenever products answer the same question. Fitment differences (screen
size, camera/trim-specific plate mounts) live as separate *options inside one
card's modal*, not as separate cards — the modal's per-option notes prevent
mis-buys.

Filtering is driven by data attributes on each `.product-card`:

- `data-fits` — space-separated vehicle tokens:
  `y26` (Model Y 2026+ Juniper) · `y20` (Model Y 2020–25) ·
  `m324` (Model 3 2024+ Highland) · `m317` (Model 3 2017–23) ·
  `s` (Model S) · `ct` (Cybertruck). Universal gear lists all six.
- `data-cat` — one category token:
  `mats` · `shade` · `screen` · `storage` · `plate` · `tech` · `maint`

The sticky toolbar offers vehicle buttons (single-select), category buttons
(single-select), and a debounced text search over the card's text content. The
three combine with AND. A results count (`aria-live`) and an empty state with a
reset button are included.

**Deep links**: the active vehicle view is reflected in the URL hash
(`#y-2026`, `#y-2020`, `#m3-2024`, `#m3-2017`, `#model-s`, `#cybertruck`).
Legacy anchors from the old sectioned layout (`#new-model-y`, `#previous-model-3`,
`#universal`, …) still resolve — JS maps them to the equivalent filter, so old
inbound links keep working. JSON-LD ItemList uses the new hashes.

### Product Cards
Plain semantic HTML — **no Schema.org Product microdata**. (Removed June 2026:
Google requires `offers`/`review`/`aggregateRating` for Product markup, and we
can't supply stable prices for rotating Amazon listings, so the markup only
generated Search Console errors.)

Every card includes one `fit-chip` per vehicle it fits, with trim/year qualifiers
inside the chip text (e.g. "Model Y 2026+ Standard"). Exact fitment at the decision
point is the site's core value proposition. The `data-fits` tokens must agree with
the visible chips.

Affiliate links must include:
`rel="nofollow sponsored noopener noreferrer"`

"Pairs with" cross-links connect products meant to be bought together (cards have
`id`s; `:target` styling highlights the destination card).

### Images
- Keep originals (`photo.jpg`).
- Run `scripts/optimize-images.sh` on every new/replacement photo — it emits
  `photo-1600.webp` + `photo-1600.jpg`.
- Cards use `<picture>` with a WebP `<source>` and the `-1600.jpg` as the
  `<img>` fallback, plus `width`/`height` and `loading="lazy"`.

### Design System
Defined in `css/style.css` using CSS custom properties (`--onyx`, `--lacquer`,
`--gold`, `--red`, text ramp `--ivory/--linen/--ash/--mute`, edges).
- Dark-only (no light mode) — `theme-color` is `#0d0c0a`
- Small geometric radii (3–4px), hairline borders, deco corner details
- Champagne gold = structure/signage/active states; red = CTA action only
- `prefers-reduced-motion` disables reveals, hover transforms, and glow pulses
- Focus: gold `:focus-visible` outlines everywhere; CTA uses a layered ring

## Adding New Content

See `CLAUDE.md` → "Adding Products" and the image workflow section.
Product candidates researched and verified in July 2026 live in
`tasks/product-research.md` (next-10 shortlist + verified fitment corrections).

## Future / Planned

- Add verified products from `tasks/product-research.md` (charging category first)
- Expansion of Model S, Model X, and more Cybertruck overlap
- Long-form guides currently on hold (initial versions removed)

## Reference

Many patterns and hard lessons were developed on the sister sites
(cyberoffroading.com — neon/brutalist; rivian-essentials — the filter-system
reference). Check those repos' `ARCHITECTURE.md` and `tasks/lessons.md` when relevant.
