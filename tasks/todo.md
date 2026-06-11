# Tesla-Essentials.com — Improvement Tasks

**Repo**: `/Users/kevinchau/localdev/tesla-essentials`
**Domain**: tesla-essentials.com
**Reference**: cyberoffroading.com (same author, proven patterns)
**Date**: May 2026

## Current State Assessment

### Strengths (updated after 2026-05-28 pull)
- **Excellent image discipline** — Total images directory is only ~3.6 MB. Largest individual files ~230 KB. Much healthier starting point than cyberoffroading.
- Good modern typography and design system foundation ("Quiet Showroom Minimalism").
- Proper affiliate link attributes (`rel="nofollow sponsored"`) already in use.
- Model-by-model organization is maturing: New Model Y, New Model 3, Previous generations, and **Model S** section recently added.
- Active SEO work: sitemap.xml was added + expanded structured data in latest commits.
- Light, clean JavaScript (still only ~180 lines).
- Dark mode support already planned in CSS variables.
- Strong "not affiliated with Tesla" disclosure in the FTC banner.

### Gaps & Opportunities (fresh as of 2026-05-28)

| Area | Status | Notes |
|------|--------|-------|
| Documentation | Poor | Root CLAUDE.md is still mostly noise. 29 scattered claude-mem CLAUDE.md files remain across the repo. No ARCHITECTURE.md yet. |
| Project Tracking | In Progress | Basic `tasks/todo.md` + `lessons.md` created. Needs ongoing maintenance. |
| Image Workflow | Ad-hoc | Still no shared optimization script. **High priority** to introduce now while the image library is still small and manageable. |
| Accessibility | Unknown | No evidence of the hardened focus styles or focus trapping from the sister site. |
| Guides | Dropped | Guides removed entirely per user feedback. May revisit with a different format later.
| Voting / Social Proof | Not implemented | No product voting or click tracking system yet (unlike cyberoffroading). Decision needed. |
| Cache Busting | Manual | CSS still uses `?v=6`. Same maintenance friction. |
| SEO | Improving | sitemap.xml added recently, but currently only lists the homepage. Opportunity to expand it. |
| Design System Maturity | Good start | Refined aesthetic is in place, but lacks documentation and component guidelines. |

## Proposed Improvement Priorities

### Phase 0 — Hygiene & Foundation (High confidence, low risk)
- [x] Replaced root CLAUDE.md with useful project guidance.
- [x] Created `tasks/todo.md` + `tasks/lessons.md`.
- [ ] Improve .gitignore to fully suppress claude-mem noise (29 files still present as of May 28).
- [ ] Create `ARCHITECTURE.md` (or a lighter "How the site works" doc).

### Phase 1 — Process & Prevention
- [x] Created `scripts/optimize-images.sh`. Images are still in good shape — excellent time to establish the habit.
- [x] Documented image script usage in CLAUDE.md.
- [x] **Decision on voting/click tracking**: Not adding the full system at this time. The site is more catalog/model-focused than the engagement-driven cyberoffroading site. We will revisit if/when we have real usage data. Client-side patterns can be ported later if needed.

### Phase 2 — Polish & Consistency
- [x] Added refined focus-visible styles (adapted to this project's `--accent` color and softer design).
- [x] Added `trapFocus()` helper function in JS (prepared for future modals/lightboxes).
- [ ] Full a11y audit (especially once more interactive features are added).

### Phase 3 — Content Gaps
- [x] Guides fully removed per user feedback (current format was not useful).
- [x] Removed top Amazon affiliate disclosure banner (footer version retained).
- [ ] Re-evaluate long-form content strategy in the future if desired.

### Phase 4 — Long-term
- [x] Clear decision recorded on voting system (see Phase 1).
- [ ] Evaluate performance budget and Lighthouse scores on the live domain.

## Notes for This Project

- Design philosophy is intentionally different ("Quiet Showroom Minimalism" vs Brutalism). Improvements should respect the lighter, more premium aesthetic.
- Stronger legal/FTC language is already in place — good.
- Model-year fragmentation (New vs Previous 3/Y) makes the product organization more complex than the single-vehicle cyberoffroading site.

---

## 2026-06-10 — Full Review + Production Polish Push

Three parallel review agents (code quality, SEO/infra, UX) audited the site; all
verified findings were fixed in one pass. Goal: polished production site that
can be found and makes money.

### Shipped
- [x] **Image pipeline executed** — WebP + JPEG `-1600` variants for all 28 photos + hero; all 40 cards and hero converted to `<picture>`. Hero LCP: 240 KB JPEG → 53 KB WebP. Fixed `cwebp -resize` upscaling bug in `optimize-images.sh` (now magick-only, shrink-only) + added dependency check.
- [x] **Per-card fitment chips** — every card now states the exact years/trims it fits (`product-card__fits`), the #1 conversion/return-rate lever in this niche.
- [x] **Year-anchored labels** — "New/Previous Model Y" → "Model Y (2026+)" / "Model Y (2020–25)" across nav, h2s, footer, JSON-LD. Self-documenting, ages gracefully.
- [x] **Hero model picker** — replaced the single "Browse by model" CTA (which dumped everyone into New Model Y) with 6 model/year pills.
- [x] **Removed invalid Product microdata** — no `offers` meant guaranteed Search Console errors and zero rich-result value with rotating Amazon prices.
- [x] **Real favicons** — favicon.ico (16/32/48) + apple-touch-icon.png (geometric "T" on Tesla red); were 404ing on every page load.
- [x] **404.html fixed** — undefined `--ink-secondary` → `--ink-soft`, Inter → Manrope fonts, added `?v=7` cache-buster.
- [x] **SEO meta** — og:image dimensions corrected (2400×1350), sitemap trimmed to root URL (fragments are ignored by crawlers), lastmod updated.
- [x] **A11y/contrast** — light-mode `--ink-mute` darkened to #707076 (≥4.5:1 AA), copyright bumped from `--ink-faint`, back-to-top now `visibility:hidden` when invisible (removed from tab order).
- [x] **1975 Creations CTA** — added `nofollow sponsored` to match other monetized links.
- [x] **Dead CSS removed** — `.ftc-banner` block + media-query refs, no-op dark-mode overrides, duplicate `:focus-visible` blocks consolidated.
- [x] **Renamed** `door-liner-prev-m3` → `door-liner-new-m3` (image shows a Highland; slug was a copy-paste trap).
- [x] **Scroll offset consistency** — JS click handler now matches CSS `scroll-padding-top` (+16px).
- [x] Docs updated: CLAUDE.md (Adding Products), ARCHITECTURE.md (cards, labels, image workflow).

### Remaining backlog (next sessions)
- [ ] **Commit + deploy** — all of the above is uncommitted; root CLAUDE.md was also never `git add`ed (it is NOT gitignored — the `!/CLAUDE.md` negation works).
- [ ] **Price bands / social proof on cards** — `.product-card__price` style exists; needs manually maintained approximate prices ("~$45") or rating snapshots. Highest-ROI card-content change left.
- [ ] Decide fate of orphaned `images/products/screen-15-anti/photo.jpg` — add a 15″ anti-glare card (needs an amzn.to link) or delete the asset.
- [ ] Normalize the one raw `amazon.com/dp/...?tag=` link (Model S sunshade) to `amzn.to` for consistency.
- [ ] Mobile nav scroll affordance — pills overflow with a fade mask; consider a chevron hint.
- [ ] Lighthouse run on the live domain after deploy; submit sitemap in Search Console.
- [ ] Re-evaluate long-form content strategy (guides removed; format TBD).

---

**Status**: Major "all of it" execution push completed on 2026-05-28.

Completed in this push:
- Aggressive claude-mem noise cleanup + .gitignore hardening
- Image optimization script introduced + documented
- Focus styles + focus trap helper ported/adapted
- ARCHITECTURE.md created
- sitemap.xml meaningfully expanded
- Guides directory seeded
- Clear decision recorded on voting/click tracking system

Remaining work is now mostly content creation (guides) and ongoing refinement rather than foundational gaps.