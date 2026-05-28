/* ============================================================
   TESLA-ESSENTIALS.COM — Main JS
   - Scroll-triggered card reveals (staggered)
   - Sticky nav active section tracking + auto-scroll
   - Sticky-nav shadow when scrolled
   - Section "in-view" observer (drives accent dot in headers)
   - Back-to-top button visibility
   - Year stamp in footer
   - Fully vanilla, no deps. Honors prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. Footer year
     ---------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     2. Card reveals
     ---------------------------------------------------------- */
  var cards = document.querySelectorAll('.product-card');

  if (cards.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('revealed'); });
    } else {
      var viewportH = window.innerHeight;

      // Reveal anything already on screen immediately so we don't flash empty.
      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        if (rect.top < viewportH && rect.bottom > 0) {
          card.classList.add('revealed');
        }
      });

      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var card = entry.target;
          var siblings = Array.prototype.slice.call(card.parentElement.children);
          var idx = siblings.indexOf(card);
          card.style.transitionDelay = (idx % 6) * 60 + 'ms';
          card.classList.add('revealed');
          revealObs.unobserve(card);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

      cards.forEach(function (card) {
        if (!card.classList.contains('revealed')) revealObs.observe(card);
      });
    }
  }

  /* ----------------------------------------------------------
     3. Sticky nav — shadow on scroll, active pill tracking
     ---------------------------------------------------------- */
  var nav = document.querySelector('.category-nav');
  var navInner = nav ? nav.querySelector('.category-nav__inner') : null;
  var navPills = document.querySelectorAll('.nav-pill');
  var sections = document.querySelectorAll('main section[id]');

  if (nav) {
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        nav.classList.toggle('is-stuck', window.scrollY > 8);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------
     4. Active section observer (drives nav pill + section accent)
     ---------------------------------------------------------- */
  if (sections.length && 'IntersectionObserver' in window) {
    var sectionMap = {};
    navPills.forEach(function (pill) {
      var href = pill.getAttribute('href') || '';
      if (href.indexOf('#') === 0) sectionMap[href.slice(1)] = pill;
    });

    function setActive(id) {
      navPills.forEach(function (p) { p.classList.remove('active'); });
      var pill = sectionMap[id];
      if (!pill) return;
      pill.classList.add('active');
      // Auto-scroll active pill into view (mobile horizontal nav)
      if (navInner && pill.scrollIntoView) {
        var pillRect = pill.getBoundingClientRect();
        var navRect  = navInner.getBoundingClientRect();
        if (pillRect.left < navRect.left + 12 || pillRect.right > navRect.right - 12) {
          navInner.scrollTo({
            left: pill.offsetLeft - navInner.clientWidth / 2 + pill.clientWidth / 2,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      }
    }

    var sectionObs = new IntersectionObserver(function (entries) {
      // Pick the section closest to top-of-viewport that's intersecting.
      var visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (visible.length) {
        var s = visible[0].target;
        setActive(s.id);
        s.classList.add('in-view');
      }
    }, {
      // Activate when section enters the upper third of the viewport
      rootMargin: '-20% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { sectionObs.observe(s); });
  }

  /* ----------------------------------------------------------
     5. Smooth-scroll for nav clicks (overrides default to honor sticky-nav offset)
     ---------------------------------------------------------- */
  navPills.forEach(function (pill) {
    pill.addEventListener('click', function (e) {
      var href = pill.getAttribute('href') || '';
      if (href.indexOf('#') !== 0) return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - (nav ? nav.offsetHeight + 12 : 12);
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', href);
    });
  });

  /* ----------------------------------------------------------
     6. Back-to-top
     ---------------------------------------------------------- */
  var backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    var backTicking = false;
    function onBackScroll() {
      if (backTicking) return;
      backTicking = true;
      window.requestAnimationFrame(function () {
        backBtn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
        backTicking = false;
      });
    }
    window.addEventListener('scroll', onBackScroll, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
    onBackScroll();
  }

  /* ----------------------------------------------------------
     7. (Optional) Affiliate click tracking — gated on gtag
     ---------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a.cta-button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!/^https?:/.test(href)) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        link_url: href,
        link_text: (a.textContent || '').trim().slice(0, 80)
      });
    }
  });
})();
