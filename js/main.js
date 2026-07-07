/* ============================================================
   TESLA-ESSENTIALS.COM — Main JS
   - Vehicle / category / search filtering over one product grid
   - Deep links: #y-2026 etc. (plus legacy #new-model-y aliases)
   - Scroll-triggered card reveals (staggered)
   - Sticky toolbar shadow, back-to-top, year stamp
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
     2. Filter engine — vehicle AND category AND search
     ---------------------------------------------------------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
  var vehicleChips = document.querySelectorAll('.filter-chip[data-vehicle]');
  var catChips = document.querySelectorAll('.filter-chip[data-cat]');
  var searchInput = document.getElementById('search');
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('grid-empty');
  var resetBtn = document.getElementById('reset-filters');
  var toolbar = document.getElementById('toolbar');

  var state = { vehicle: 'all', cat: 'all', q: '' };

  // Canonical hash per vehicle filter (legacy section anchors still resolve)
  var VEHICLE_HASH = {
    y26: 'y-2026', y20: 'y-2020', m324: 'm3-2024', m317: 'm3-2017', s: 'model-s', ct: 'cybertruck'
  };
  var HASH_TO_VEHICLE = {
    'y-2026': 'y26', 'y-2020': 'y20', 'm3-2024': 'm324', 'm3-2017': 'm317',
    'model-s': 's', 'cybertruck': 'ct',
    // legacy anchors from the sectioned layout
    'new-model-y': 'y26', 'new-model-3': 'm324',
    'previous-model-y': 'y20', 'previous-model-3': 'm317',
    'universal': 'all'
  };

  // Pre-compute each card's search haystack once
  var haystacks = cards.map(function (card) {
    return card.textContent.replace(/\s+/g, ' ').toLowerCase();
  });

  function applyFilters() {
    var visible = 0;
    var q = state.q.trim().toLowerCase();

    cards.forEach(function (card, i) {
      var fits = (card.getAttribute('data-fits') || '').split(/\s+/);
      var cat = card.getAttribute('data-cat') || '';
      var show =
        (state.vehicle === 'all' || fits.indexOf(state.vehicle) !== -1) &&
        (state.cat === 'all' || cat === state.cat) &&
        (!q || haystacks[i].indexOf(q) !== -1);
      card.hidden = !show;
      if (show) {
        visible++;
        // Skip the entrance animation for cards revealed by filtering
        card.classList.add('is-visible');
      }
    });

    if (countEl) countEl.textContent = visible + ' of ' + cards.length;
    if (emptyEl) emptyEl.hidden = visible > 0;

    // Reflect the vehicle view in the URL (search/category stay ephemeral)
    var hash = state.vehicle === 'all' ? 'collection' : VEHICLE_HASH[state.vehicle];
    if (hash && history.replaceState) {
      history.replaceState(null, '', '#' + hash);
    }
  }

  function setChipGroup(chips, attr, value) {
    chips.forEach(function (chip) {
      var active = chip.getAttribute(attr) === value;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }

  function setVehicle(v) {
    state.vehicle = v;
    setChipGroup(vehicleChips, 'data-vehicle', v);
    applyFilters();
  }

  function setCategory(c) {
    state.cat = c;
    setChipGroup(catChips, 'data-cat', c);
    applyFilters();
  }

  vehicleChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setVehicle(chip.getAttribute('data-vehicle'));
    });
  });

  catChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setCategory(chip.getAttribute('data-cat'));
    });
  });

  if (searchInput) {
    var searchTimer = null;
    searchInput.addEventListener('input', function () {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(function () {
        state.q = searchInput.value;
        applyFilters();
      }, 120);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      state.q = '';
      if (searchInput) searchInput.value = '';
      setChipGroup(catChips, 'data-cat', 'all');
      state.cat = 'all';
      setVehicle('all');
    });
  }

  function scrollToCollection() {
    var target = document.getElementById('collection');
    if (!target) return;
    var offset = toolbar ? toolbar.offsetHeight + 16 : 16;
    var top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  // Footer vehicle links + deep links on load
  function handleHash(hash, scroll) {
    var v = HASH_TO_VEHICLE[hash];
    if (v === undefined) return false;
    setVehicle(v);
    if (scroll) scrollToCollection();
    return true;
  }

  document.querySelectorAll('.site-footer__links a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (handleHash(a.getAttribute('href').slice(1), true)) e.preventDefault();
    });
  });

  if (location.hash && handleHash(location.hash.slice(1), false)) {
    // Deep link: jump to the grid once layout settles. Runs after the load
    // event so the browser's own scroll restoration can't override it.
    var jumpToGrid = function () {
      window.setTimeout(function () {
        var target = document.getElementById('collection');
        if (target) {
          var offset = toolbar ? toolbar.offsetHeight + 16 : 16;
          window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - offset);
        }
      }, 60);
    };
    if (document.readyState === 'complete') jumpToGrid();
    else window.addEventListener('load', jumpToGrid);
  }

  /* ----------------------------------------------------------
     2b. Fit picker modal — collapses multi-link cards to one button
     ---------------------------------------------------------- */
  var modal = document.getElementById('fit-modal');

  if (modal && typeof modal.showModal === 'function') {
    var mKicker = document.getElementById('fit-modal-kicker');
    var mTitle = document.getElementById('fit-modal-title');
    var mIntro = document.getElementById('fit-modal-intro');
    var mOptions = document.getElementById('fit-modal-options');

    var VEHICLE_LABEL = {
      y26: 'Model Y 2026+', y20: 'Model Y 2020–25',
      m324: 'Model 3 2024+', m317: 'Model 3 2017–23',
      s: 'Model S', ct: 'Cybertruck'
    };

    var openPicker = function (card, group, kind) {
      var titleEl = card.querySelector('h3');
      var kickerEl = card.querySelector('.product-card__kicker');
      mTitle.textContent = titleEl ? titleEl.textContent : '';
      mKicker.textContent = kickerEl ? kickerEl.textContent : '';

      var opts = Array.prototype.slice.call(group.querySelectorAll('a'));

      // For a fit picker, narrow to the active vehicle when one is selected.
      var shown = opts;
      if (kind === 'fit' && state.vehicle !== 'all') {
        var match = opts.filter(function (a) {
          return (a.getAttribute('data-fits') || '').split(/\s+/).indexOf(state.vehicle) !== -1;
        });
        if (match.length) shown = match;
      }

      if (kind === 'kit') {
        mIntro.textContent = 'This is a ' + opts.length + '-part setup — add each piece to your cart.';
      } else if (shown.length < opts.length) {
        mIntro.textContent = 'Showing the fit for ' + (VEHICLE_LABEL[state.vehicle] || 'your Tesla') + '.';
      } else {
        mIntro.textContent = 'Pick the version that matches your car.';
      }

      mOptions.innerHTML = '';
      shown.forEach(function (a) {
        var note = a.getAttribute('data-note') || '';
        var li = document.createElement('li');
        var link = document.createElement('a');
        link.className = 'fit-option';
        link.href = a.href;
        link.target = '_blank';
        link.rel = a.getAttribute('rel') || 'nofollow sponsored noopener noreferrer';
        link.innerHTML =
          '<span class="fit-option__body">' +
            '<span class="fit-option__label"></span>' +
            (note ? '<span class="fit-option__note"></span>' : '') +
          '</span>' +
          '<span class="fit-option__arrow" aria-hidden="true">→</span>';
        link.querySelector('.fit-option__label').textContent = a.textContent.trim();
        if (note) link.querySelector('.fit-option__note').textContent = note;
        link.addEventListener('click', function () { modal.close(); });
        li.appendChild(link);
        mOptions.appendChild(li);
      });

      modal.showModal();
    };

    cards.forEach(function (card) {
      var group = card.querySelector('.product-card__ctas');
      if (!group) return;
      var kind = group.getAttribute('data-picker') || 'fit';
      var count = group.querySelectorAll('a').length;
      card.classList.add('has-picker');

      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'cta-button fit-trigger';
      trigger.textContent = kind === 'kit' ? 'See the ' + count + '-piece kit' : 'Select your model';
      trigger.addEventListener('click', function () { openPicker(card, group, kind); });
      card.querySelector('.product-card__info').appendChild(trigger);
    });

    // Close on backdrop click (target is the dialog itself) or the close button
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-close]')) modal.close();
    });
  }

  /* ----------------------------------------------------------
     3. Card reveals (entrance only; filtering bypasses this)
     ---------------------------------------------------------- */
  if (cards.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('is-visible'); });
    } else {
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var card = entry.target;
          var siblings = Array.prototype.slice.call(card.parentElement.children)
            .filter(function (el) { return !el.hidden; });
          var idx = siblings.indexOf(card);
          if (idx > -1) card.style.transitionDelay = (idx % 6) * 60 + 'ms';
          card.classList.add('is-visible');
          revealObs.unobserve(card);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

      cards.forEach(function (card) {
        if (!card.classList.contains('is-visible')) revealObs.observe(card);
      });
    }
  }

  /* ----------------------------------------------------------
     4. Sticky toolbar shadow
     ---------------------------------------------------------- */
  if (toolbar) {
    var sentinel = document.createElement('div');
    toolbar.parentNode.insertBefore(sentinel, toolbar);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        toolbar.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }).observe(sentinel);
    }
  }

  /* ----------------------------------------------------------
     5. Back-to-top
     ---------------------------------------------------------- */
  var backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    var backTicking = false;
    var onBackScroll = function () {
      if (backTicking) return;
      backTicking = true;
      window.requestAnimationFrame(function () {
        backBtn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
        backTicking = false;
      });
    };
    window.addEventListener('scroll', onBackScroll, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
    onBackScroll();
  }

  /* ----------------------------------------------------------
     6. (Optional) Affiliate + filter analytics — gated on gtag
     ---------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a.cta-button, a.fit-option');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!/^https?:/.test(href)) return;
    if (typeof window.gtag === 'function') {
      // Prefix the product name: cards label buttons by model, modal by variant
      var card = a.closest('.product-card');
      var product = '';
      if (card && card.querySelector('h3')) product = card.querySelector('h3').textContent.trim();
      else if (a.classList.contains('fit-option') && mTitle) product = mTitle.textContent.trim();
      var label = (a.textContent || '').replace(/\s+/g, ' ').trim();
      window.gtag('event', 'affiliate_click', {
        link_url: href,
        link_text: (product && product !== label ? product + ' — ' + label : label).slice(0, 80)
      });
    }
  });
})();
