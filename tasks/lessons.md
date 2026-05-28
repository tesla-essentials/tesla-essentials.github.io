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

## Future Entries

(Add new lessons here as work progresses on this repo)

---

*This file exists to make future work on tesla-essentials.com faster and less error-prone than the first project.*