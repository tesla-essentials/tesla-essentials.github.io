# Tesla-Essentials.com — Lessons Learned

This file captures recurring patterns and rules discovered while working on the project. Review at the start of any significant work.

---

## 2026-05 — Initial Analysis (Switching from cyberoffroading.com)

**The same author can repeat documentation hygiene problems across projects.**  
Even with a detailed PLAN.md and good intentions, the root CLAUDE.md became claude-mem noise, and dozens of individual CLAUDE.md files appeared in product image folders.

**Rule**: When starting (or taking over) any new static site project, immediately:
1. Replace the root CLAUDE.md with actual project guidance.
2. Add `**/*CLAUDE.md` and `.claude/` to `.gitignore` (or at minimum document the noise).
3. Create `tasks/todo.md` + `tasks/lessons.md` on day one to establish tracking habits early.

**Image bloat is much easier to prevent than to fix.**  
This project currently has excellent image discipline (~3.6 MB total). The sister site reached 112 MB before it became painful. Establishing the optimization script and workflow *now* (while it's easy) is far higher leverage than waiting.

**Rule**: Introduce the `scripts/optimize-images.sh` pattern proactively on any image-heavy static site, even when current sizes look reasonable.

**Design system differences matter for improvement porting.**  
This site deliberately uses a softer, light-mode-first aesthetic with rounded corners and generous whitespace. Many of the hard angular `clip-path` patterns and brutalist focus treatment from the other site will need adaptation rather than direct copying.

**Rule**: When porting improvements between the two sites, always re-evaluate them against the local design language instead of assuming 1:1 reuse.

---

## 2026-06 — Production Polish Review

**A documented workflow that was never executed is a silent gap.**
CLAUDE.md described the WebP/srcset image workflow for weeks, but zero WebP files
existed and zero `<img>` tags used it. Audits should verify documented workflows
were actually run, not just that the script exists.

**Rule**: When a doc says "we do X", grep for evidence X has ever been done.

**`cwebp -resize W 0` upscales smaller sources** — it has no shrink-only mode,
unlike ImageMagick's `"Wx>"` geometry. The optimizer script silently upscaled
1100px photos to 1600px WebP. Use magick for both outputs.

**Schema.org Product markup without `offers` is worse than no markup.**
Google requires offers/review/aggregateRating; affiliate sites with rotating
Amazon prices can't honestly supply them. Plain HTML beats invalid structured data.

**Subagent findings need verification before acting.** One review agent reported a
"stuck active nav pill" bug, but reading `main.js` showed `setActive()` clears all
pills before bailing — no bug. Verify each agent claim against the code before fixing.

## 2026-07 — "Marquee" Redesign + Filter Grid

**Browser scroll restoration overrides load-time `scrollTo`.**
A deep-link handler that scrolls via `setTimeout(fn, 0)` at script-eval time loses
to the browser's scroll restoration on reload. Run programmatic on-load scrolls
after the `load` event (plus a small delay), or they silently do nothing.

**Preview-harness metrics can be artifacts.** The headless preview reported
`window.innerHeight === 0` before any resize, which breaks IntersectionObserver
reveals and makes scroll assertions meaningless. After an explicit viewport
resize the values were real. Distrust a "bug" that only reproduces before the
harness has set a viewport.

**When merging duplicate cards into one multi-vehicle card, the copy must be
de-model-ed.** Merged cards inherited reviews like "Fits the new Model Y…" that
contradicted the second vehicle chip. Fitment lives in chips + `data-fits`;
review copy stays model-neutral.

**Guessed API shapes for third-party sites are usually wrong — probe the real
thing before shipping parsers.** The cannonball board's first version guessed
`/api/trackers/...` (404s), `__NEXT_DATA__` (fsddb is Rails, not Next), and
mapped `total_miles` to route length (on fsddb it's miles *driven*; the route
length is `public_route.planned_total_miles`). When the dev sandbox can't reach
the site, a throwaway `workflow_dispatch`/push-triggered GitHub Actions job that
curls the page and prints headers + body is a reliable way to see the truth —
runners have open egress. Delete the workflow after use.

**CORS mirrors are a spectrum, not a commodity.** fsddb.com serves no
`Access-Control-Allow-Origin` at all; corsproxy.io's free tier rejects
production origins (only localhost works — it passed local tests and would have
failed in prod); allorigins works but caches ~5 min (cache-bust with a
throwaway param) and, like codetabs, intermittently 522s when the upstream is
under load. Chain at least two mirrors and keep a hardcoded fallback.

## Future Entries

(Add new lessons here as work progresses on this repo)

---

*This file exists to make future work on tesla-essentials.com faster and less error-prone than the first project.*