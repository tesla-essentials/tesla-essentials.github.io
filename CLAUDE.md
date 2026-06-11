# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Tesla-Essentials.com — A curated affiliate site for essential accessories across the Tesla lineup (primarily Model 3 and Model Y, with coverage for S, X, and Cybertruck). Single-page static site with a refined, premium "showroom minimalism" aesthetic.

**Key difference from sister site (cyberoffroading.com)**: Lighter, more mainstream Tesla aesthetic (white space, soft rounding, light + dark modes) rather than brutalist industrial design.

## Architecture

- **Single-page site** with model-generation organization (`#new-model-y`, `#new-model-3`, `#previous-model-y`, etc.).
- **No build step**: Pure HTML/CSS/JS. Edit directly.
- **Hosting**: GitHub Pages + Cloudflare.
- **Reference implementation**: `/Users/kevinchau/localdev/cyberoffroading/` (many patterns and lessons can be adapted).

## Key Files

- `index.html` — Main experience. Organized by vehicle generation.
- `css/style.css` — Design system using Manrope + JetBrains Mono, soft shadows, generous whitespace.
- `js/main.js` — Lightweight vanilla JS (reveals, sticky nav, etc.).
- `PLAN.md` — Original detailed site plan (historical reference).
- `tasks/todo.md` — Current prioritized improvement backlog.
- `tasks/lessons.md` — Project-specific lessons and rules.

## Design System Notes

- Light mode is primary; dark mode via `prefers-color-scheme`.
- Rounded corners (`--r-md: 12px`, etc.) instead of zero-radius clip-paths.
- Tesla red used sparingly as accent only.
- Product cards are plain semantic HTML with per-card fitment chips (no Product microdata).

## Adding Products

1. Add a new `<article class="product-card">` in the appropriate model section (no Schema.org Product microdata — see ARCHITECTURE.md for why it was removed).
2. Include the `product-card__fit` eyebrow, title, review, a `product-card__fits` chip (exact years/trims it fits), and the affiliate CTA.
3. Add photo to `images/products/<category-slug>/photo.jpg`, then run `./scripts/optimize-images.sh` on it.
4. Reference images via `<picture>`: WebP `<source srcset="...photo-1600.webp">` + `<img src="...photo-1600.jpg" width="400" height="300" loading="lazy">`.
5. Use `rel="nofollow sponsored noopener noreferrer"` on affiliate links.
6. Bump the `?v=` cache-buster on style.css/main.js if you touched them.

## Current Priorities (May 2026)

See `tasks/todo.md` for the living backlog. Major themes:
- Documentation hygiene
- Establishing image optimization workflow early
- Porting hard-learned accessibility patterns from the sister site
- Guides strategy is currently on hold (removed initial attempts)

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