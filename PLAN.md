# Tesla-Essentials.com — Site Plan

## Summary
**Goal**: Build `tesla-essentials.com` — a curated affiliate site for essential Tesla accessories, with primary focus on Model 3 / Model Y but covering all current Tesla models (3, Y, S, X, Cybertruck). Visual style and architecture mirror the proven `cyberoffroading.com` pattern (single-page, mobile-first, semantic HTML, SEO-tuned), but reskinned with a refined Tesla-aesthetic identity (white/silver/black) appropriate for a broader passenger-car audience rather than off-road niche.
**Status**: Not Started — awaiting product list from user
**Current Step**: Step 0 of 8 — Plan approved → directory bootstrap
**Last Updated**: 2026-04-28 11:31 PDT

---

## Context

### Project Overview
Empty directory at `/Users/kevinchau/localdev/tesla-essentials/`. The user will purchase the domain `tesla-essentials.com`. Proven reference implementation lives at `/Users/kevinchau/localdev/cyberoffroading/` — same author, same hosting pattern (GitHub Pages + Cloudflare CDN + optional Cloudflare Worker for vote/click tracking via KV).

### Reference Project Inventory (cyberoffroading)
| File | Role | Reusable? |
|------|------|-----------|
| `index.html` (67KB) | Hero + sticky nav + product grid sections + footer | Pattern: yes. Content: no. |
| `css/style.css` (~1400 lines) | Full design system w/ CSS custom properties, clip-path cards, brushed-steel aesthetic | Structure: yes. Palette/fonts: replace. |
| `js/main.js` | IntersectionObserver card reveals, sticky-nav active tracking, smooth scroll, back-to-top, lightbox, modals | Yes — copy mostly verbatim. |
| `worker/index.js` + `wrangler.toml` | Cloudflare Worker w/ KV storage for `/votes/:id` and `/click/:id` endpoints, CORS-locked to allowed origins | Yes — change ALLOWED_ORIGINS. |
| `guides/*.html` | Standalone long-form guide pages | Pattern: yes (used for buying guides). |
| `404.html`, `CNAME`, `.gitignore` | Hosting plumbing | Yes — change CNAME. |

### Key Design Patterns From Reference (must preserve)
1. **Zero build step.** Plain HTML/CSS/JS. Edit & deploy. No bundler, no framework.
2. **Single-page anchor navigation.** All categories on one scroll, sticky pill nav highlights active section via IntersectionObserver. Separate pages reserved only for long-form guides.
3. **CSS custom properties drive the palette** — change `:root` vars, the whole site reskins.
4. **Clip-path geometry** instead of border-radius for card corners and CTA buttons. We will SOFTEN this for tesla-essentials (Tesla aesthetic is cleaner, less aggressive than Cybertruck angular).
5. **Mobile-first responsive grid**: 1 col mobile → 2 col tablet → 3 col desktop. Max-width 1200px.
6. **SEO baked in from line 1**: semantic `<article>`/`<section>`, JSON-LD Product schema, Open Graph, canonical, sitemap.xml.
7. **Affiliate links**: `target="_blank" rel="noopener noreferrer sponsored"` — note the `sponsored` rel attribute is REQUIRED by Google for affiliate links (cyberoffroading omits this; we add it).
8. **Image discipline**: WebP where possible, `loading="lazy"` on all but hero (`eager`), descriptive alt with model keyword.

### Dependencies & Constraints
- **Hosting**: GitHub Pages (free, push-to-deploy). Cloudflare proxy for SSL + caching + Web Analytics.
- **Domain**: `tesla-essentials.com` (user purchasing). DNS: CNAME to `kchau.github.io` (or whatever GH user). CNAME file inside repo.
- **Affiliate program**: Amazon Associates (user provides links + tag). Must include FTC disclosure in footer AND near the top per Amazon Associates Operating Agreement.
- **Performance budget**: Page weight < 1MB on first load. Lighthouse Performance ≥ 90 mobile. Keep this site faster than competitors — Google ranks affiliate sites partly on page experience.
- **Trademark caution**: "Tesla" is a Tesla, Inc. trademark. Domain & content must clearly state we are NOT affiliated with Tesla, Inc. Footer disclosure required. Avoid Tesla logo, official wordmark, or any branding implying endorsement.

### User Preferences (from conversation + global CLAUDE.md)
- Plan first, get approval, then implement.
- "Make it pretty" — invoke `/frontend-design:frontend-design` during the build phase for visual polish beyond the cyberoffroading baseline.
- SEO is a primary goal, not an afterthought.
- User will compile and provide the Amazon affiliate product list.
- User is a confirmed Tesla owner (per persistent context: TezLab MCP shows live Tesla vehicle data) — content can be authentic owner-perspective.

---

## Design Direction

### Aesthetic Brief: REFINED MINIMALISM (vs cyberoffroading's BRUTALISM)
Cyberoffroading is "armored vehicle HUD." Tesla-essentials is **"Apple Store meets Tesla showroom"** — clean, white space, premium materials, restrained accents. Mass-market Tesla owners (Model 3 / Y) skew aspirational tech-aesthetic, not industrial-rugged. The site should feel like an extension of the Tesla mobile app's visual language without copying it.

### Color Palette (proposed — to be refined by frontend-design skill)
```css
:root {
  /* Light mode primary (default) */
  --bg-primary:    #ffffff;       /* Pure white — Tesla showroom floor */
  --bg-secondary:  #f5f5f7;       /* Off-white panel — Apple-esque */
  --bg-tertiary:   #ebebef;       /* Card hover, dividers */

  --ink-primary:   #1d1d1f;       /* Near-black text */
  --ink-secondary: #6e6e73;       /* Subdued copy */
  --ink-tertiary:  #a1a1a6;       /* Captions, meta */

  --accent:        #cc0000;       /* Tesla red — used SPARINGLY (CTAs, highlights only) */
  --accent-hover:  #a30000;
  --accent-glow:   rgba(204, 0, 0, 0.08);

  --edge:          #d2d2d7;       /* 1px borders */

  /* Dark mode (auto via prefers-color-scheme) */
  --bg-primary-dark:    #0a0a0a;
  --bg-secondary-dark:  #1a1a1c;
  --ink-primary-dark:   #f5f5f7;
}
```
Tesla red is iconic but legally "T-red" is not trademarked as a color. Using a similar hue for CTAs is fair use and instantly evokes the brand.

### Typography
- **Display**: `Inter` (Google Fonts, weights 600/700) — modern, geometric, used by half the modern web; reads as "premium tech" without being a ripoff of Tesla's custom Gotham-like wordmark.
- **Body**: `Inter` (weights 400/500) — same family for consistency, smaller scale.
- *(Alternative if frontend-design skill recommends:* `Söhne`-alike → `Manrope`, or `SF Pro` via system font stack.*)*

### Geometry
- **Subtle border-radius** (`8px` cards, `4px` buttons) — NOT zero like cyberoffroading. Tesla UI uses gentle rounding.
- **No clip-path angular cuts** — replace with clean rectangles + soft shadows (`0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)`).
- **Generous white space**: Section padding 96–120px desktop, 64–80px mobile.
- **Hairline dividers** (`1px solid var(--edge)`) between sections instead of color blocks.

### Hero
- Full-bleed photograph: Model 3 or Y interior or charging at sunset (royalty-free / user-supplied).
- Light overlay (white-to-transparent gradient) keeping text legible.
- Headline: clean sans-serif, large.
- Sub-tagline + ONE primary CTA ("Browse Essentials").

### Frontend-Design Skill Directive
**During Step 3 (CSS build)**, invoke `/frontend-design:frontend-design` with the brief:
> "Design a refined, premium accessory landing page for Tesla owners. Reference points: Apple.com product pages, Tesla.com shop, Wirecutter. Mobile-first. Hero, sticky category nav, product card grid, FTC-compliant footer. Avoid generic AI dark-mode aesthetic. Use white space, hairline dividers, restrained color (white/black/silver with one Tesla-red accent), Inter typography. Card layout: 16:10 image, title, 2-line review, price (optional), 'View on Amazon' CTA."

The skill's output should produce a `css/style.css` that supersedes the placeholder palette above where it conflicts.

---

## Site Structure

```
tesla-essentials/
├── index.html                   # Hero + sticky nav + all category sections + footer
├── css/
│   └── style.css                # Single stylesheet, CSS custom properties
├── js/
│   └── main.js                  # Reveal observer, nav highlight, smooth scroll, back-to-top
├── images/
│   ├── hero/                    # hero-model-y.webp etc.
│   └── products/<category>/<slug>/  # Product photos (Amazon CDN OR self-hosted)
├── guides/                      # Long-form buying guides (added in Phase 2)
│   ├── model-3-essentials.html  # "20 Things Every New Model 3 Owner Needs"
│   ├── model-y-essentials.html  # Same for Y
│   └── winter-driving.html      # All-Tesla winter prep
├── worker/                      # OPTIONAL — only if vote/click tracking desired
│   ├── index.js
│   └── wrangler.toml
├── CNAME                        # tesla-essentials.com
├── robots.txt                   # Allow all + sitemap location
├── sitemap.xml                  # Generated; update on content change
├── 404.html                     # Custom not-found
└── PLAN.md                      # This file
```

### Category Sections (proposed — finalize once Amazon list arrives)
Each section is an `<a id="…">` anchor with a sticky-nav pill. Order is conversion-optimized (high-intent first):

| # | Section ID | Display Name | Rationale |
|---|------------|--------------|-----------|
| 1 | `#charging` | Charging | #1 search intent — every new owner buys a J1772 adapter, mobile connector, NEMA 14-50, etc. |
| 2 | `#interior` | Interior Protection | Floor mats, screen protectors, sun shades — high purchase volume |
| 3 | `#exterior` | Exterior & Wheels | Mud flaps, paint protection, wheel covers (Aero) |
| 4 | `#storage` | Storage & Organization | Frunk organizer, trunk organizer, center console trays |
| 5 | `#tech` | Tech & Mounts | Phone mounts, USB hubs, dashcam (Sentry SSD) |
| 6 | `#safety` | Safety & Emergency | Tire repair kit, jump starter, fire extinguisher, first aid |
| 7 | `#cleaning` | Cleaning & Care | Detailing supplies, microfiber, ceramic spray |
| 8 | `#kids-pets` | Kids & Pets | Car seat protectors, pet barriers, hammocks |
| 9 | `#road-trip` | Road Trip | Coolers, camp mode gear, Starlink-for-RV (overlap w/ Y owners) |
| 10 | `#model-specific` | Model-Specific | Sub-categorize by 3 / Y / S / X / Cybertruck if products are model-locked |

This taxonomy is a starting point — adjust based on actual products user provides.

---

## SEO Strategy (built in from Step 1)

### Per-Page Optimizations
- **`<title>`**: 50–60 chars. Format: `Tesla Essentials — [Page Topic] for Model 3, Y, S, X & Cybertruck`
- **`<meta name="description">`**: 140–160 chars. Action-oriented, includes primary keyword.
- **Canonical URL** on every page (`<link rel="canonical">`).
- **Open Graph + Twitter Card** (large image card) on every page.
- **JSON-LD** structured data:
  - `WebSite` + `SearchAction` on homepage
  - `Product` schema per product card (name, image, brand, offers→url)
  - `BreadcrumbList` on guide pages
  - `FAQPage` on guide pages with Q&A sections
  - `Organization` schema in homepage with logo + sameAs (X/Twitter, etc.)
- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`. Use exactly one `<h1>` per page.
- **Internal linking**: Guide pages link back to relevant homepage section anchors. Homepage section intros link to relevant guide pages.

### Site-Wide
- `robots.txt`: allow all, point to sitemap.
- `sitemap.xml`: list homepage + every guide page with `<lastmod>`.
- **Image SEO**: Every `<img>` has descriptive `alt` containing model keyword where natural. WebP format. `width`/`height` attributes set to prevent CLS.
- **Page experience**: Lighthouse mobile score ≥ 90 for all of Performance, Accessibility, Best Practices, SEO. Track and verify before launch.
- **No render-blocking JS**: `<script defer>` on main.js.
- **Preconnect** to fonts.googleapis.com.

### Target Keywords (high-intent, lower-competition variants)
Primary:
- "tesla model 3 accessories"
- "tesla model y accessories"
- "tesla essentials"
- "best accessories for tesla model 3"
- "tesla model y must have accessories"

Long-tail (guide pages):
- "what does a new tesla owner need"
- "tesla j1772 adapter recommendation"
- "tesla model 3 floor mats winter"
- "tesla sentry mode usb drive"

### Affiliate-Specific SEO Hygiene
- All affiliate links: `rel="nofollow sponsored noopener noreferrer"` and `target="_blank"`. The `sponsored` value is **mandated by Google** for affiliate links — failure to include it can trigger manual actions.
- FTC disclosure visible above the fold AND in footer. Recommended copy:
  > *"Tesla-Essentials.com is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you. We are not affiliated with, endorsed by, or sponsored by Tesla, Inc."*

---

## Implementation Steps

### Step 1: Bootstrap Project Structure
**Status**: Pending
**Files**: directory tree, `CNAME`, `.gitignore`, `robots.txt`, `404.html`

**What to do**:
1. Create directory tree: `css/`, `js/`, `images/hero/`, `images/products/`, `guides/`.
2. Create `CNAME` containing single line: `tesla-essentials.com`
3. Create `.gitignore` (copy from cyberoffroading):
   ```
   .DS_Store
   .wrangler/
   working/
   *.log
   ```
4. Create `robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://tesla-essentials.com/sitemap.xml
   ```
5. Create placeholder `404.html` (copy structure from cyberoffroading 404).
6. `git init` and create initial commit (do NOT push until user confirms GitHub repo name).

**Verification**:
- [ ] `ls /Users/kevinchau/localdev/tesla-essentials/` shows expected tree
- [ ] `git log` shows initial commit

---

### Step 2: Build `index.html` Skeleton (no products yet)
**Status**: Pending — depends on Step 1
**Files**: `index.html`

**What to do**:
1. Write full HTML5 document with:
   - `<head>`: charset, viewport, title, meta description, canonical, Open Graph, Twitter Card, preconnect to fonts, link to `css/style.css?v=1`, JSON-LD `WebSite` + `Organization` schema.
   - `<body>`:
     - `<header class="hero">` with bg image placeholder + headline + sub + primary CTA.
     - FTC disclosure strip immediately under hero.
     - `<nav class="category-nav">` with sticky pill nav (placeholder anchors for all 10 categories).
     - `<main>`: one empty `<section id="…">` per category with header + product-grid container + intro copy stub. NO product cards yet — those come in Step 5.
     - `<footer class="site-footer">`: brand, nav links, FTC disclosure (full), Tesla trademark disclaimer, copyright.
   - `<script defer src="js/main.js?v=1"></script>` before `</body>`.
2. Use semantic tags throughout. One `<h1>` (in hero), `<h2>` per section, `<h3>` for product titles (when added).
3. Add `<link rel="preload" as="image" href="images/hero/hero.webp">` for the LCP image.

**Verification**:
- [ ] Page loads with no console errors.
- [ ] HTML validates (https://validator.w3.org/).
- [ ] Lighthouse SEO score on placeholder = 100.

---

### Step 3: Build `css/style.css` — Invoke Frontend-Design Skill
**Status**: Pending — depends on Step 2
**Files**: `css/style.css`

**What to do**:
1. **Invoke `/frontend-design:frontend-design` skill** with the design directive in the "Design Direction" section above.
2. The skill should produce a complete stylesheet covering:
   - CSS reset + base typography (Inter from Google Fonts, fluid `clamp()` sizing)
   - Custom properties (palette, spacing scale, type scale)
   - `.container`, `.section`, `.section--alt` layout primitives
   - `.hero` with full-bleed image + overlay
   - `.category-nav` sticky bar with pill buttons (rounded, NOT angular clip-path)
   - `.ftc-banner` thin disclosure strip
   - `.product-grid` (1/2/3 col responsive)
   - `.product-card` (rounded corners, soft shadow, hover lift, image area, info area, CTA)
   - `.cta-button` primary (Tesla-red fill) and `.cta-button--ghost` variants
   - `.guide-card` variant for guide-page links
   - `.warning-callout` and `.info-callout` (callout boxes)
   - `.site-footer` with multi-column layout, fine-print
   - `.back-to-top` floating button
   - Dark mode via `@media (prefers-color-scheme: dark)`
   - `prefers-reduced-motion` overrides
3. **Constraints to pass to the skill**:
   - Single CSS file, no preprocessor.
   - Mobile-first (write base styles for mobile, use `min-width` media queries to enhance).
   - No external CSS dependencies (no Tailwind, no Bootstrap).
   - Hairline borders, soft shadows, generous white space.
   - Tesla-red used ONLY for primary CTA + active nav pill + section accents (≤5% of viewport).

**Verification**:
- [ ] Visual review on mobile (375px), tablet (768px), desktop (1280px) viewports.
- [ ] Lighthouse Best Practices ≥ 95.
- [ ] No layout shift (CLS = 0).

---

### Step 4: Build `js/main.js`
**Status**: Pending — depends on Step 3
**Files**: `js/main.js`

**What to do**:
1. Adapt cyberoffroading's `js/main.js` (line-for-line port is ~80% reusable):
   - IntersectionObserver-based card reveals with staggered delays.
   - Sticky nav active-section tracking on scroll.
   - Smooth scroll on nav-pill click.
   - Auto-scroll active pill into view inside the horizontal scroll nav (mobile UX critical).
   - Back-to-top button visibility toggle on scroll.
2. Strip out cyberoffroading-specific code: lightbox, guide-modal system, vote/click tracking (defer those to Phase 2/3 if wanted).
3. Wrap in IIFE, no globals leaked. Vanilla JS only — no jQuery, no React.
4. Honor `prefers-reduced-motion` — skip animations entirely, just reveal cards immediately.
5. Add affiliate link click tracking via simple `gtag('event', 'affiliate_click', {…})` IF user adds Google Analytics later (gate behind `if (typeof gtag === 'function')`).

**Verification**:
- [ ] Cards reveal smoothly as you scroll on mobile.
- [ ] Active pill highlights correctly across all sections.
- [ ] No JS errors on any browser (test Safari, Chrome, Firefox).
- [ ] Site fully functional with JS disabled (graceful degradation — content visible, just no animations).

---

### Step 5: Populate Product Cards (BLOCKED — awaiting user product list)
**Status**: Blocked — needs Amazon product inventory from user
**Files**: `index.html` (sections), `images/products/<category>/<slug>/`

**What to do** (when user provides list):
1. For each product, gather: name, category, 1–3 sentence review, Amazon affiliate link, optional price, optional model-fit tag (3/Y/S/X/CT or "All").
2. Create the product card HTML using this template:
   ```html
   <article class="product-card" itemscope itemtype="https://schema.org/Product">
     <div class="product-card__image">
       <img src="images/products/CATEGORY/SLUG/photo.webp"
            alt="PRODUCT NAME — Tesla Model 3/Y accessory"
            loading="lazy" width="400" height="300" itemprop="image">
     </div>
     <div class="product-card__info">
       <span class="product-card__fit">Model 3 · Model Y</span>
       <h3 itemprop="name">PRODUCT NAME</h3>
       <p class="product-card__review" itemprop="description">SHORT REVIEW</p>
       <a href="AMAZON_AFFILIATE_LINK"
          class="cta-button"
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          itemprop="url">View on Amazon</a>
       <meta itemprop="brand" content="BRAND">
     </div>
   </article>
   ```
3. Save each product image into `images/products/<category>/<product-slug>/photo.webp`. Convert from JPG/PNG via `cwebp -q 85`.
4. Group cards into the appropriate `<section>`. Order within a section: by usefulness/rating, not alphabetical.
5. Update sticky nav to remove any sections that ended up with zero products.

**Decision needed from user**:
- Self-host product images vs hot-link from Amazon CDN? Self-hosting = better performance + reliability but more work. Recommend self-host. (Amazon Associates Operating Agreement permits using their product images via Product Advertising API; direct hot-linking may break.)

---

### Step 6: Build Guide Pages (Phase 2)
**Status**: Pending — recommended after homepage is live
**Files**: `guides/model-3-essentials.html`, `guides/model-y-essentials.html`, `guides/winter-driving.html`

**What to do**:
1. Each guide is a standalone HTML page reusing `css/style.css`, with:
   - `<head>`: unique title, description, canonical, JSON-LD `Article` + `BreadcrumbList` + `FAQPage` schemas.
   - `<header>`: small site logo, "← Back to Tesla Essentials" link.
   - `<main class="guide-page">`: H1, byline + date, table-of-contents anchor list, body content with H2 subsections.
   - Inline product cards where relevant (link back to homepage section anchors AND include affiliate links inline).
   - FAQ section at the bottom (5–7 Q&A) — fuels FAQ rich results.
   - "Related guides" cards at end.
2. Initial guides to write:
   - **`model-3-essentials.html`**: "20 Things Every New Model 3 Owner Needs in 2026" — covers all categories at high level, each linking to homepage section.
   - **`model-y-essentials.html`**: Same template, Y-specific.
   - **`winter-driving.html`**: All-models winter prep — cold-weather charging, tire chains, wiper care.
3. Add links to guides from homepage sticky nav AND from relevant homepage section intros.

---

### Step 7: SEO Finalization & Sitemap
**Status**: Pending — depends on Steps 5 & 6
**Files**: `sitemap.xml`, `index.html` (validate schema), all guide pages

**What to do**:
1. Generate `sitemap.xml` listing every URL with `<lastmod>` (today) and reasonable `<priority>` (homepage 1.0, guides 0.8).
2. Validate every JSON-LD block via https://validator.schema.org/ — fix any errors/warnings.
3. Run https://search.google.com/test/rich-results on homepage AND each guide page — confirm Product / Article / FAQ rich results are eligible.
4. Run Lighthouse mobile + desktop on homepage and one guide; capture scores. Target: ≥90 on all four pillars.
5. Confirm OG image dimensions (1200×630), file size <300KB.
6. Prepare Google Search Console & Bing Webmaster Tools verification meta tags (placeholder; user adds tokens after registering domain).

**Verification**:
- [ ] Schema validator: 0 errors across all pages.
- [ ] Rich results test: Product + Article + FAQ recognized.
- [ ] Lighthouse mobile: Performance ≥ 90, SEO = 100, Accessibility ≥ 95, Best Practices ≥ 95.

---

### Step 8: Deploy & DNS
**Status**: Pending — depends on Step 7 + user owning domain
**Files**: GitHub repo, Cloudflare DNS

**What to do**:
1. User creates GitHub repo `tesla-essentials` (public or private — GH Pages works on both with paid plan; public on free).
2. Push local repo: `git remote add origin … && git push -u origin main`.
3. Enable GitHub Pages: Settings → Pages → Source: `main` / `(root)`. Wait for first deploy (~1 min).
4. User adds DNS records on Cloudflare (after domain registration):
   - `A` records pointing apex `tesla-essentials.com` to GitHub Pages IPs (185.199.108–111.153)
   - `CNAME` for `www` → `<github-username>.github.io`
   - Set Cloudflare proxy ON (orange cloud) for both
5. In GitHub Pages settings, enter custom domain `tesla-essentials.com`, enable "Enforce HTTPS" once cert provisions.
6. Cloudflare → SSL/TLS → set to "Full (strict)".
7. Cloudflare → Caching → set Browser TTL to 4h, Edge TTL via page rule "Cache Everything" for `*tesla-essentials.com/*`.
8. Cloudflare → Analytics → enable Web Analytics, paste snippet into `index.html` before `</body>`.
9. Submit `https://tesla-essentials.com/sitemap.xml` to Google Search Console (after verifying ownership).
10. Submit to Bing Webmaster Tools.

**Verification**:
- [ ] `curl -I https://tesla-essentials.com/` returns 200 + correct cert.
- [ ] Cloudflare Analytics shows traffic.
- [ ] Sitemap appears in GSC, "Discovered" → "Indexed" within ~2 weeks.

---

## Decisions Log

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| Tech stack | Plain HTML/CSS/JS | Zero build, instant deploy, matches reference site | Astro, Next.js — overkill for affiliate page |
| Hosting | GitHub Pages + Cloudflare | Free, proven on cyberoffroading | Netlify, Vercel, Cloudflare Pages (all viable, GH Pages chosen for parity) |
| Visual style | Refined minimalism (white/silver/red) | Matches Tesla mass-market aesthetic; differentiates from cyberoffroading's industrial brutalism | Brutalism reskinned in Tesla colors — rejected, wrong audience |
| Geometry | Soft border-radius, soft shadows | Tesla UI uses gentle rounding; clip-path angular cuts feel "off" for non-truck audience | Angular clip-paths from cyberoffroading |
| Single page vs multi-page | Single page + guide subpages | Same as cyberoffroading; better mobile UX; concentrates link equity | Multi-page category browsing |
| Affiliate link `rel` | `nofollow sponsored noopener noreferrer` | Required by Google for affiliate; cyberoffroading currently omits `sponsored` (their bug, not to copy) | Just `noopener noreferrer` (insufficient) |
| Vote/click tracking worker | Defer to Phase 3 (optional) | Not core to MVP; can add later without refactor | Build into MVP |
| Image hosting | Self-host WebP | Performance + reliability | Hot-link Amazon CDN (against ToS in some cases, can break) |
| Tesla branding | Disclaimer-heavy, no Tesla logo | Trademark safety; Tesla has been litigious | Use Tesla wordmark (NO — legal risk) |

---

## Open Questions (Resolved 2026-04-28)

- [x] **Amazon Associates tag**: User will pre-generate links with tag baked in.
- [x] **Image source**: Self-host. Fetch from public sources (Amazon product imagery, manufacturer sites) where available; user will supply own photos where they exist.
- [x] **GitHub repo**: Not created yet — defer Step 8 (Deploy & DNS) until user is ready.
- [x] **Vote/click tracking**: SKIP for MVP. No Cloudflare Worker. Drop `worker/` from tree.
- [x] **Guide topics**: None yet — defer Step 6 (Guide Pages) until user identifies topics.

### Scope adjustment
- **Active steps**: 1, 2, 3, 4, 5, 7
- **Deferred**: Step 6 (guides — no topics), Step 8 (deploy — no repo/domain yet)
- **Removed**: Cloudflare Worker entirely (no `worker/` directory, no vote/click tracking JS)

---

## Verification Checklist (Pre-Launch)

- [ ] All affiliate links open in new tab, have `rel="nofollow sponsored noopener noreferrer"`
- [ ] FTC disclosure visible above fold AND in footer
- [ ] Tesla non-affiliation disclaimer in footer
- [ ] Every image has descriptive `alt` and explicit `width`/`height`
- [ ] All images converted to WebP, total page weight < 1MB
- [ ] Lighthouse mobile: Perf ≥ 90, SEO = 100, A11y ≥ 95, Best Practices ≥ 95
- [ ] Schema.org validation: 0 errors
- [ ] Google Rich Results test: Product + Article + FAQ eligible
- [ ] Sitemap.xml present and submitted to GSC + Bing
- [ ] HTTPS enforced, valid cert, A/CNAME records correct
- [ ] No JS console errors on Chrome / Safari / Firefox
- [ ] Site fully usable with JS disabled
- [ ] Mobile viewport tested at 375px, 414px, 768px, 1280px
- [ ] Dark mode renders correctly (or is intentionally not implemented yet)
- [ ] All anchor links resolve correctly, sticky nav highlights right section
- [ ] 404.html responds for missing paths
- [ ] Cloudflare caching active, hit ratio > 90% after warmup
