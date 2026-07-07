# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Tesla-Essentials.com — A curated affiliate site for essential accessories across the Tesla lineup (primarily Model 3 and Model Y, with coverage for S, X, and Cybertruck). Single-page static site with a "Marquee" futuristic art-deco aesthetic (July 2026 redesign): warm onyx, champagne-gold signage, Tesla red for CTAs only, dark-only.

**Sister sites**: cyberoffroading.com (brutalist neon; Cybertruck) and rivian-essentials (the filter-system reference). Adapt patterns to this site's deco language — don't copy 1:1.

## Architecture

- **Single-page site** with ONE filterable product grid (`#collection`) — no per-model sections. Cards carry `data-fits` (vehicle tokens) + `data-cat` (category token); the sticky toolbar filters by vehicle, category, and text search. See ARCHITECTURE.md for tokens and deep-link hashes.
- **No build step**: Pure HTML/CSS/JS. Edit directly.
- **Hosting**: GitHub Pages + Cloudflare.

## Key Files

- `index.html` — Main experience. One deduplicated, filterable product grid.
- `css/style.css` — "Marquee" design system: Big Shoulders Display + Manrope + JetBrains Mono.
- `js/main.js` — Vanilla JS: filter engine, reveals, sticky toolbar, deep links.
- `ARCHITECTURE.md` — Structure, filter tokens, conventions.
- `tasks/todo.md` — Current prioritized improvement backlog.
- `tasks/lessons.md` — Project-specific lessons and rules.
- `tasks/product-research.md` — Verified accessory candidates to add next (July 2026).

## Design System Notes

- Dark-only. Champagne gold (`--gold`) = signage/structure/active; red (`--red`) = CTA action only. "Glow is earned."
- Small geometric radii (3–4px) + gold-tinted hairline borders; deco rules (`——◆——`) and the hero sunburst are the signature motifs.
- Product cards are plain semantic HTML with per-vehicle `fit-chip`s (no Product microdata).

## Adding Products

1. Add ONE `<article class="product-card">` to the `#collection` grid — even if it fits several vehicles (no Schema.org Product microdata — see ARCHITECTURE.md for why it was removed).
2. Set `data-fits` (space-separated: `y26 y20 m324 m317 s ct`) and `data-cat` (`mats|shade|screen|storage|plate|tech|maint`).
3. **Multiple purchase links** (per-model SKUs OR multi-part kits): ONE card with a `product-card__ctas-label` + `product-card__ctas` group holding the links. Set `data-picker="fit"` (choose-your-version) or `data-picker="kit"` (buy-each-part) on the group. Each `<a>` needs `data-fits` (which vehicles it applies to — drives modal narrowing) and an optional `data-note` (trim detail / part role). JS turns the group into one "Select your model" button (kit groups read "See the N-piece kit") opening `#fit-modal`; keep the inline links as fallback. Affiliate disclosure stays in the footer only — do not repeat it in the modal. Card `data-fits` = union of every option's `data-fits`. **Merge aggressively**: if two products answer the same buying question, they're options in one card's modal, not two cards. Even size/trim/camera-specific variants belong as separate *options* (the modal note prevents mis-buys), not separate cards.
   **Single-SKU products**: one full-width `cta-button` ("View on Amazon") plus visible `fit-chip`s that agree with `data-fits`.
4. Add photo to `images/products/<category-slug>/photo.jpg`, then run `./scripts/optimize-images.sh` on it.
5. Reference images via `<picture>`: WebP `<source srcset="...photo-1600.webp">` + `<img src="...photo-1600.jpg" width="400" height="300" loading="lazy">`.
6. Use `rel="nofollow sponsored noopener noreferrer"` on all affiliate links (every button in a multi-SKU group).
7. Update the static count in the toolbar (`#count`) and the collection intro if you add/remove cards (JS recomputes on filter, but the initial HTML value should match).
8. Bump the `?v=` cache-buster on style.css/main.js if you touched them.

## Current Priorities (July 2026)

See `tasks/todo.md` for the living backlog. Major themes:
- Add verified products from `tasks/product-research.md` (charging category first)
- Commit + deploy the redesign; Lighthouse pass on the live domain
- Guides strategy still on hold

## Useful Commands

```bash
# Local preview
python3 -m http.server 8000
# or
npx serve
```

## Image Optimization Workflow

We have a helper script at `scripts/optimize-images.sh` to keep image sizes reasonable as the catalog grows.

**Recommended usage**:
```bash
./scripts/optimize-images.sh images/products/some-category/new-photo.jpg
```

It will generate:
- `new-photo-1600.webp` (primary)
- `new-photo-1600.jpg` (fallback)

Then update the `<img>` tag in the product card to use `srcset`.

Always keep the original full-resolution file.

## Reference

Many hard lessons (image bloat, focus styles, documentation debt, voting system) were learned on cyberoffroading.com. Check that repo's `tasks/lessons.md` and `ARCHITECTURE.md` when relevant.