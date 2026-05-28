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
Sections are organized by vehicle generation rather than pure category:
- New Model Y (Juniper refresh)
- New Model 3
- Previous Model Y
- Previous Model 3
- Model S (growing)
- Universal (works across models)

This matches how buyers actually shop ("What fits my car?").

### Product Cards
Every product uses Schema.org markup (`itemscope itemtype="https://schema.org/Product"`).

Affiliate links must include:
`rel="nofollow sponsored noopener noreferrer"`

### Images
- Keep originals.
- Use the `scripts/optimize-images.sh` script for new/replacement photos.
- Prefer WebP + JPEG fallbacks with `srcset` when possible.

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