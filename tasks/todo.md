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

## 2026-07-07 — Full Redesign + Filterability + Product Coverage Push

Goal (user-set): (1) full redesign — minimal, graphic-design polish like rivian-essentials, with a "futuristic art-deco" take on cyberoffroading's retro-futuristic neon theory; (2) multi-agent product coverage review + accessory research; (3) cross-vehicle filter/search replacing per-vehicle sections where possible (reference rivian-essentials), with multi-vehicle chips on cards.

### Plan
- [x] Research: map current site, rivian-essentials filter/design system, cyberoffroading neon theory (3 parallel agents)
- [x] Define "Futuristic Art-Deco" design direction ("Marquee") — documented in ARCHITECTURE.md
- [x] Restructure index.html: single filterable product grid; 42 sectioned cards deduped to 33 with `data-fits`/`data-cat`; per-vehicle fit chips
- [x] Filter toolbar: vehicle buttons + category buttons + debounced text search (AND-combined); empty state + reset; live count; URL hash sync with legacy-anchor mapping
- [x] Full CSS redesign on new tokens (dark-only — see Review for rationale)
- [x] Multi-agent coverage review + accessory research → tasks/product-research.md
- [x] Verify in browser (hero/grid/footer screenshots, mobile 375px no-overflow probe, console + network clean, all six vehicle filter counts validated)
- [x] Update ARCHITECTURE.md/CLAUDE.md docs, record lessons

### Review (2026-07-07)
- **Design**: "Marquee" futuristic art-deco — warm onyx `#0d0c0a`, champagne gold `#d8b35c` signage, red CTAs only. Signature: CSS conic-gradient sunburst hero + `——◆——` deco rules. Big Shoulders Display / Manrope / JetBrains Mono.
- **Decision — dark-only**: the previous light-first mode was dropped. Art-deco neon theory requires a dark ground, and rivian-essentials (the quality bar) is dark-only. Revisit only if analytics show a problem.
- **Filtering**: single-select vehicle + single-select category + search. Multi-select vehicles was considered and skipped — owners have one car; cross-model products already surface via multi-token `data-fits`.
- **Dedupe map**: same-SKU cards merged (screen protectors, organizers, armrests, M3 sunshade, under-seat storage): 42 → 33 cards, zero products lost. Old section anchors (`#new-model-y` etc.) still deep-link correctly via JS mapping.
- **Research**: 30-agent workflow — 45 candidates, 19 verified (3 rejected in adversarial verification). Next-10 shortlist in tasks/product-research.md; charging category is the biggest gap.
- **Second merge pass (same day, user-directed)**: per-model SKU families collapsed to one card with a button per model (mats 4→1, sunshades 4→1, door liners 3→1, organizer 2→1, armrest 2→1, TesFram 2→1): 22 cards.
- **Third merge pass + picker modal (same day, user-directed)**: full "combine ANY overlap" pass → **11 cards** (from 42 originals). Screen protectors 4→1, all license-plate mounts incl. 1975 premium 6→1, under-seat storage 2→1, tech pairs → 2 "kit" cards. Every multi-link card now collapses (via JS) into a single gold **"Choose your fit"** button opening a shared `<dialog>` picker; inline links kept as no-JS/crawler fallback. Modal narrows options to the active vehicle filter; `data-picker="kit"` reframes for buy-both bundles. Verified: 11 cards, per-vehicle counts (Y26/Y20 11, M3-24 10, M3-17 9, S 5, CT 4), modal populate + narrowing + kit framing, mobile 375px no-overflow, console clean, all option links keep `nofollow sponsored`.
- **Not done / follow-ups**: commit + deploy; add researched products (needs amzn.to links + photos); Lighthouse on live domain; Model S sunshade still uses raw amazon.com tag link; the `.product-card__pair*` CSS is now dead (pairs-with pattern removed) — safe to prune later.

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