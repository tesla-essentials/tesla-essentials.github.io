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
├── js/cannonball.js           # FSD Cannonball live-telemetry board (fsddb.com)
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

### FSD Cannonball telemetry board (`#fsd-cannonball`)

A non-commercial engagement section between the collection and the Cybertruck
promo. `js/cannonball.js` fetches the FSD Cannonball record-attempt data from
`fsddb.com/trackers/FSDCannonball` **client-side** and renders a projected total
run time: `projected = elapsed ÷ (miles completed ÷ route miles)`, where
**`elapsed` is the clock reading at the instant fsddb recorded those miles**
(`counter_updated_at`), not the live clock — pairing stale miles with a live
clock silently inflates the projection by `route ÷ miles` hours for every hour
of staleness (at 874 of 2,850 miles that was 3.3 h per hour, marching the board
toward "behind the record" and snapping back on each update). The race clock
and the "Elapsed" stat still tick live; only the pace ratio, avg mph and
confidence window use the paired reading, and the footnote states how old the
mile counters are. All durations
render in hours only (never days) so they compare at a glance against the "time
to beat" (the fastest zero-intervention FSD Cannonball — 49:55:57 by @BLKMDL3,
May 2026); the board shows the projected ± delta vs that record, going gold
only when ahead (glow is earned).

The projection carries a confidence percentage (`#tm-conf`): the uncertainty
window is `BAND_SHARE` (10%) of the **remaining** time only — the hours
already driven are fact — and confidence = 100% − (window ÷ projected total),
so it rises toward 100% as the run progresses and is hidden for final times.
The same window disciplines the record delta: when the margin to the record
is smaller than it, the label says "Too close to call" instead of picking a
side, and the ahead-glow is only earned when the projection clears the
window. Heuristic, not statistics — it exists so the hero number doesn't
overstate its own precision.

The fsddb internals were verified against the real site (July 2026). It's a
Rails app — no `__NEXT_DATA__`, no `/api/…` routes. The tracker page embeds a
complete `let snapshot = {…}` JSON blob and polls
`/trackers/fsdcannonball/snapshot?client=<token>` (the token rotates per race
and lives in the page's `data-snapshot-url`; without it the endpoint answers
`{"error": "This tracker page is stale…"}`). Field semantics that matter:
`public_route.planned_total_miles` is the route length and
`public_route.progress_miles` the miles completed — `total_miles` /
`self_driving_miles` are miles *driven so far*, never the route length. There
is no interventions counter; `manual_miles` is the honesty metric (the board's
"Manual miles" stat). `race.time_to_beat_seconds` / `race.final_seconds` /
`race.beat_record` drive the record math, and the live value overrides the
hardcoded record constant. fsddb serves **no CORS headers**, so cross-origin
reads go through `api.allorigins.win` (corsproxy.io blocks production origins
on its free tier — don't re-add it). During the July 2026 race both public
mirrors (allorigins, codetabs) sat on 520/522 errors for hours, so the site
runs its own relay: `.github/workflows/cannonball-relay.yml` fires on a 5-min
cron and each run *loops for ~55 minutes*, polling fsddb every ~45 s and
force-pushing a pruned snapshot (~2 KB — no route polyline, no live_location)
to the single-commit `cannonball-data` branch whenever the counters actually
change; the browser reads it from raw.githubusercontent.com — which, unlike
fsddb, serves CORS headers. **Never shorten that loop to rely on cron
cadence**: GitHub throttles scheduled workflows on public repos, and a `*/5`
cron was observed firing only about once an hour, so 4.5-minute runs left
55-minute holes with no polling at all. A ~55-minute loop means one firing per
hour still gives continuous coverage. Note
fsddb intentionally delays public *location* data by 15 min
(`location_delay_minutes`) — the mile counters the board uses are
near-real-time. The relay skips pushes when nothing changed, so it goes
quiet once the run ends (delete the workflow + branch when the board is
retired). The source chain is: direct snapshot JSON (only useful if fsddb
ever enables CORS) → the relay JSON → the page via allorigins (also
refreshes the `?client=` token) → the snapshot via allorigins → the page via
codetabs. Parsing prefers exact key paths, then fuzzy key
matching, then visible-text patterns (`"78 of 2,850 planned miles"`,
`"Time to beat 49:55:57"`, `"Race clock 1:35:09"`).

The hardcoded last-verified state paints immediately on load (the source walk
can take tens of seconds when mirrors are timing out, and a board full of
dashes reads as broken); the first successful source upgrades it in place. If
every source fails, the board stays on that snapshot and says so — it never
renders empty, and a snapshot never ticks (a stale clock would fabricate
elapsed time). States are driven by `data-state` on `#telemetry`:
`loading | live | snapshot | done` (`loading` only exists until the script
runs). While a run is live (known start, not finished, live feed reachable),
the elapsed clock and projection tick every second; sources are re-polled
every 90 s with cache-busters on the relay and mirror URLs.

## Social card (OG image)

`images/brand/og-image.jpg` (1200×630) is the Open Graph / Twitter card, and it's
a designed art-board — not a photo. The source is `images/brand/og-image.html`,
which reuses the site's Marquee tokens and fonts (onyx ground, champagne sunburst,
stacked wordmark). To regenerate after editing the HTML, run the command in the
file's top comment: Chrome headless screenshots it at 1200×630 → PNG, then `sips`
converts to JPEG q90. Keep the `.html` source in the repo alongside the `.jpg`
(same pattern as rivian-essentials). The old photo hero was removed with the July
2026 redesign — there is no longer a hero raster.

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
