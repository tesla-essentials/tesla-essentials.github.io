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
| Guides | Empty | `/guides/` directory is completely empty. PLAN.md explicitly calls for buying guides (e.g. Model 3 Essentials, Model Y Essentials). Growing gap. |
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
- [x] Seeded `/guides/` directory with README and structure.
- [ ] Create actual buying guide content (high value, currently the biggest gap vs PLAN.md).

### Phase 4 — Long-term
- [x] Clear decision recorded on voting system (see Phase 1).
- [ ] Evaluate performance budget and Lighthouse scores on the live domain.

## Notes for This Project

- Design philosophy is intentionally different ("Quiet Showroom Minimalism" vs Brutalism). Improvements should respect the lighter, more premium aesthetic.
- Stronger legal/FTC language is already in place — good.
- Model-year fragmentation (New vs Previous 3/Y) makes the product organization more complex than the single-vehicle cyberoffroading site.

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