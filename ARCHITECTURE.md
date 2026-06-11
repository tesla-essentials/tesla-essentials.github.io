# Tesla-Essentials.com — Architecture (2026)

This document describes the current structure and conventions for the project.

## Overview

Tesla-Essentials.com is a single-page affiliate content site focused on essential accessories for Tesla vehicles, with primary emphasis on Model 3 and Model Y, plus growing coverage for Model S, X, and Cybertruck.

**Design Philosophy**: "Quiet Showroom Minimalism" — clean, premium, restrained use of Tesla red, generous whitespace, soft rounding, and support for both light and dark modes.

## Site Structure

```
/
├── index.html                 # The main experience (model-organized sections)
├── css/style.css              # Design system (Manrope + JetBrains Mono)
├── js/main.js                 # Lightweight vanilla JS (reveals, nav, etc.)
├── images/
│   ├── hero/
│   └── products/<slug>/       # Product photos (kept reasonably optimized)
├── scripts/
│   └── optimize-images.sh     # Optional helper for new photos
├── guides/                    # (Currently removed / on hold)
├── 404.html
├── sitemap.xml
├── robots.txt
├── CNAME
└── tasks/                     # Internal project tracking
```

## Key Conventions

### Product Organization
Sections are organized by vehicle generation rather than pure category, with
year-anchored labels so owners don't need to decode "New" vs "Previous":
- Model Y (2026+) — Juniper refresh
- Model 3 (2024+) — Highland refresh
- Model Y (2020–25) — pre-Juniper
- Model 3 (2017–23) — pre-Highland
- Model S (growing)
- Universal (works across models)

This matches how buyers actually shop ("What fits my car?"). Section anchor IDs
(`#new-model-y`, etc.) are stable URLs and intentionally do NOT change with labels.

### Product Cards
Plain semantic HTML — **no Schema.org Product microdata**. (Removed June 2026:
Google requires `offers`/`review`/`aggregateRating` for Product markup, and we
can't supply stable prices for rotating Amazon listings, so the markup only
generated Search Console errors.)

Every card includes a `product-card__fits` chip stating exactly which years/trims
the product fits — this is the site's core value proposition at the decision point.

Affiliate links must include:
`rel="nofollow sponsored noopener noreferrer"`

### Images
- Keep originals (`photo.jpg`).
- Run `scripts/optimize-images.sh` on every new/replacement photo — it emits
  `photo-1600.webp` + `photo-1600.jpg`.
- Cards use `<picture>` with a WebP `<source>` and the `-1600.jpg` as the
  `<img>` fallback, plus `width`/`height` and `loading="lazy"`.

### Design System
Defined in `css/style.css` using CSS custom properties.
- Light mode primary
- Soft shadows and rounded corners (unlike the angular cyberoffroading site)
- Tesla red used very sparingly as accent

## Adding New Content

See `CLAUDE.md` → "Adding Products" and the image workflow section.

## Future / Planned

- Expansion of Model S, Model X, and more Cybertruck overlap
- Long-form guides currently on hold (initial versions removed)
- Potential addition of voting/click tracking (decision pending)

## Reference

Many patterns and hard lessons were developed on the sister site:  
https://github.com/tesla-essentials/cyberoffroading (private reference)

Check that repo's `ARCHITECTURE.md` and `tasks/lessons.md` when relevant.