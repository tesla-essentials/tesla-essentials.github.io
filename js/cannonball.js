/* ============================================================
   TESLA-ESSENTIALS.COM — FSD Cannonball live telemetry
   Pulls David Moss's run data from the FSDDB tracker
   (https://fsddb.com/trackers/FSDCannonball) in the visitor's
   browser and projects the total run time from pace so far:

       projected = elapsed ÷ (miles completed ÷ route miles)

   fsddb.com has no documented public API, so this is built
   defensively: try a likely JSON endpoint, then the page itself,
   then read-only CORS mirrors of the page — and scrape whatever
   fields we can find. Anything missing falls back to the last
   verified result so the board never renders empty.
   Fully vanilla, no deps. Honors prefers-reduced-motion via CSS.
   ============================================================ */
(function () {
  'use strict';

  var root = document.getElementById('telemetry');
  if (!root || typeof window.fetch !== 'function') return;

  var TRACKER_PAGE = 'https://fsddb.com/trackers/FSDCannonball';
  var REFRESH_MS = 90000;   // re-poll the tracker every 90s
  var FETCH_TIMEOUT_MS = 9000;

  // Last verified result (July 2026): David Moss, Tesla Diner LA →
  // Myrtle Beach SC on FSD, zero interventions. Shown only if every
  // live source fails, and labeled as a snapshot when it is.
  var FALLBACK = {
    miles: 2732.4,
    totalMiles: 2732.4,
    elapsedMs: ((2 * 24) + 20) * 3600 * 1000, // 2d 20h
    interventions: 0,
    startTime: null,
    finished: true
  };

  // Order matters: cheapest/cleanest first. The proxies are public
  // read-only mirrors that add CORS headers to the same page.
  var SOURCES = [
    { url: 'https://fsddb.com/api/trackers/FSDCannonball', kind: 'json' },
    { url: TRACKER_PAGE, kind: 'html' },
    { url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(TRACKER_PAGE), kind: 'html' },
    { url: 'https://corsproxy.io/?url=' + encodeURIComponent(TRACKER_PAGE), kind: 'html' }
  ];

  var els = {
    status: document.getElementById('tm-status'),
    projected: document.getElementById('tm-projected'),
    projectedLabel: document.getElementById('tm-projected-label'),
    miles: document.getElementById('tm-miles'),
    total: document.getElementById('tm-total'),
    elapsed: document.getElementById('tm-elapsed'),
    speed: document.getElementById('tm-speed'),
    interventions: document.getElementById('tm-interventions'),
    bar: document.getElementById('tm-bar'),
    barWrap: document.getElementById('tm-bar-wrap'),
    pct: document.getElementById('tm-pct'),
    note: document.getElementById('tm-note')
  };

  var data = null;        // best data we currently have
  var isSnapshot = true;  // true until a live source succeeds
  var fetchedAt = 0;
  var tickTimer = null;

  /* ----------------------------------------------------------
     Fetch helpers
     ---------------------------------------------------------- */
  function fetchWithTimeout(url) {
    var controller = ('AbortController' in window) ? new AbortController() : null;
    var timer = controller && window.setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);
    return window.fetch(url, {
      signal: controller ? controller.signal : undefined,
      // no credentials; we only ever read public pages
      credentials: 'omit'
    }).then(function (res) {
      if (timer) window.clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }, function (err) {
      if (timer) window.clearTimeout(timer);
      throw err;
    });
  }

  /* ----------------------------------------------------------
     Parsing — deliberately fuzzy. We accept any of:
     - JSON with mile/distance/start/intervention-ish keys
     - Next.js __NEXT_DATA__ payloads embedded in the page
     - visible-text patterns like "1,234.5 / 2,732.4 mi",
       "2d 20h 14m", "0 interventions"
     ---------------------------------------------------------- */
  function num(v) {
    if (typeof v === 'number' && isFinite(v)) return v;
    if (typeof v === 'string') {
      var n = parseFloat(v.replace(/,/g, ''));
      if (isFinite(n)) return n;
    }
    return null;
  }

  function parseDate(v) {
    if (typeof v === 'number' && v > 1e12 && v < 4e12) return v;            // ms epoch
    if (typeof v === 'number' && v > 1e9 && v < 4e9) return v * 1000;       // s epoch
    if (typeof v === 'string' && /\d{4}-\d{2}-\d{2}T/.test(v)) {
      var t = Date.parse(v);
      if (isFinite(t)) return t;
    }
    return null;
  }

  // Flatten an object tree into [lowercasedKeyPath, primitiveValue] pairs
  function flatten(obj, out, prefix, depth) {
    if (obj == null || depth > 14 || out.length > 4000) return;
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) flatten(obj[i], out, prefix, depth + 1);
      return;
    }
    if (typeof obj === 'object') {
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        var v = obj[k];
        var path = prefix + k.toLowerCase();
        if (v == null) continue;
        if (typeof v === 'object') flatten(v, out, path + '.', depth + 1);
        else out.push([path, v]);
      }
    }
  }

  function pick(pairs, keyRe, valueFn, lo, hi) {
    for (var i = 0; i < pairs.length; i++) {
      if (!keyRe.test(pairs[i][0])) continue;
      var v = valueFn(pairs[i][1]);
      if (v !== null && v >= lo && v <= hi) return v;
    }
    return null;
  }

  function fromJsonTree(tree) {
    var pairs = [];
    flatten(tree, pairs, '', 0);
    if (!pairs.length) return null;

    var out = {};
    out.totalMiles = pick(pairs, /(total|route|goal|target|planned)[^.]*(mile|distance|length)|(mile|distance|length)[^.]*(total|route|goal|target)/, num, 300, 8000);
    out.miles = pick(pairs, /(driven|completed|current|progress|fsd|traveled|travelled)[^.]*(mile|distance)|(mile|distance)[^.]*(driven|completed|current|progress|traveled|travelled)|(^|\.)miles?$/, num, 0.1, 8000);
    out.startTime = pick(pairs, /start|depart|began|begin/, parseDate, Date.parse('2024-01-01'), Date.now() + 864e5);
    out.endTime = pick(pairs, /(end|finish|complete)[^.]*(time|at|date)/, parseDate, Date.parse('2024-01-01'), Date.now() + 864e5);
    out.interventions = pick(pairs, /interven|disengage/, num, 0, 999);
    out.elapsedMs = null;
    var elapsedH = pick(pairs, /elapsed|duration/, num, 0.01, 500);
    if (elapsedH !== null) out.elapsedMs = elapsedH * 3600 * 1000;
    return (out.miles !== null || out.totalMiles !== null || out.startTime !== null) ? out : null;
  }

  function fromHtml(html) {
    // 1) Embedded Next.js/JSON payloads
    var m = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/);
    if (m) {
      try {
        var viaJson = fromJsonTree(JSON.parse(m[1]));
        if (viaJson && viaJson.miles !== null) return viaJson;
      } catch (e) { /* fall through to text scraping */ }
    }

    // 2) Visible-text scraping
    var text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');

    var out = { miles: null, totalMiles: null, startTime: null, endTime: null, interventions: null, elapsedMs: null };

    // "1,234.5 / 2,732.4 mi" or "1,234.5 of 2,732.4 miles"
    var frac = text.match(/([\d,]+(?:\.\d+)?)\s*(?:\/|of|out of)\s*([\d,]+(?:\.\d+)?)\s*(?:mi\b|miles)/i);
    if (frac) {
      var a = num(frac[1]), b = num(frac[2]);
      if (a !== null && b !== null && b >= a && b >= 300) { out.miles = a; out.totalMiles = b; }
    }

    // Standalone totals if no fraction found: take the two largest "N mi" values
    if (out.miles === null) {
      var miRe = /([\d,]+(?:\.\d+)?)\s*(?:mi\b|miles)/gi, hit, vals = [];
      while ((hit = miRe.exec(text)) !== null) {
        var v = num(hit[1]);
        if (v !== null && v > 1) vals.push(v);
      }
      if (vals.length >= 2) {
        vals.sort(function (x, y) { return y - x; });
        if (vals[0] >= 300 && vals[0] >= vals[1]) { out.totalMiles = vals[0]; out.miles = vals[1]; }
      }
    }

    // "2d 20h 14m" | "68h 12m" elapsed
    var dur = text.match(/(?:(\d+)\s*d(?:ays?)?\s*)?(\d+)\s*h(?:ou?rs?)?\s*(?:(\d+)\s*m(?:in(?:ute)?s?)?)?/i);
    if (dur && (dur[1] || num(dur[2]) !== null)) {
      var ms = ((num(dur[1]) || 0) * 24 + (num(dur[2]) || 0)) * 3600 * 1000 + (num(dur[3]) || 0) * 60 * 1000;
      if (ms > 0 && ms < 500 * 3600 * 1000) out.elapsedMs = ms;
    }

    var iv = text.match(/(\d+)\s*interventions?/i);
    if (iv) out.interventions = num(iv[1]);

    // Labeled start timestamps in the raw HTML (JSON-ish attributes)
    var st = html.match(/"(?:start|depart)[a-z_]*"\s*:\s*"?(\d{10,13}|\d{4}-\d{2}-\d{2}T[\d:.+Zz-]+)"?/i);
    if (st) out.startTime = parseDate(/^\d+$/.test(st[1]) ? Number(st[1]) : st[1]);

    return (out.miles !== null || out.elapsedMs !== null) ? out : null;
  }

  /* ----------------------------------------------------------
     Data assembly + projection
     ---------------------------------------------------------- */
  function merge(parsed) {
    var d = {
      miles: (parsed && parsed.miles !== null && parsed.miles !== undefined) ? parsed.miles : FALLBACK.miles,
      totalMiles: (parsed && parsed.totalMiles) || FALLBACK.totalMiles,
      startTime: (parsed && parsed.startTime) || null,
      endTime: (parsed && parsed.endTime) || null,
      interventions: (parsed && parsed.interventions !== null && parsed.interventions !== undefined)
        ? parsed.interventions : FALLBACK.interventions,
      elapsedMs: (parsed && parsed.elapsedMs) || null
    };
    if (d.totalMiles < d.miles) d.totalMiles = d.miles;
    d.finished = d.miles >= d.totalMiles - 1;
    if (d.elapsedMs === null) {
      if (d.startTime && d.endTime && d.endTime > d.startTime) d.elapsedMs = d.endTime - d.startTime;
      else if (d.startTime && !d.finished) d.elapsedMs = Math.max(0, Date.now() - d.startTime);
      else d.elapsedMs = FALLBACK.elapsedMs;
    }
    return d;
  }

  function elapsedNow(d) {
    // A live run with a known start keeps counting between polls
    if (!d.finished && d.startTime) return Math.max(0, Date.now() - d.startTime);
    return d.elapsedMs;
  }

  function projectedMs(d) {
    if (d.miles <= 0 || d.totalMiles <= 0) return null;
    return elapsedNow(d) * (d.totalMiles / d.miles);
  }

  /* ----------------------------------------------------------
     Formatting + render
     ---------------------------------------------------------- */
  function fmtMiles(v) {
    return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  }

  function fmtDur(ms, withSeconds) {
    if (ms === null || !isFinite(ms)) return '—';
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    var parts = [];
    if (d) parts.push(d + 'd');
    parts.push(h + 'h');
    parts.push((m < 10 ? '0' : '') + m + 'm');
    if (withSeconds && !d) parts.push((s < 10 ? '0' : '') + s + 's');
    return parts.join(' ');
  }

  function setStatus(state, label) {
    root.setAttribute('data-state', state);
    if (els.status) els.status.textContent = label;
  }

  function render() {
    if (!data) return;
    var el = elapsedNow(data);
    var proj = projectedMs(data);
    var ticking = !data.finished && !!data.startTime;
    var pct = data.totalMiles > 0 ? Math.min(100, (data.miles / data.totalMiles) * 100) : 0;
    var hours = el / 3600000;

    if (els.miles) els.miles.textContent = fmtMiles(data.miles);
    if (els.total) els.total.textContent = fmtMiles(data.totalMiles);
    if (els.elapsed) els.elapsed.textContent = fmtDur(el, ticking);
    if (els.speed) els.speed.textContent = hours > 0.05 ? (data.miles / hours).toFixed(1) : '—';
    if (els.interventions) els.interventions.textContent = String(data.interventions);
    if (els.projected) els.projected.textContent = fmtDur(proj, false);
    if (els.projectedLabel) {
      els.projectedLabel.textContent = data.finished ? 'Final time — run complete' : 'Projected total time';
    }
    if (els.bar) els.bar.style.width = pct.toFixed(2) + '%';
    if (els.pct) els.pct.textContent = pct.toFixed(1) + '% of route';
    if (els.barWrap) {
      els.barWrap.setAttribute('aria-valuenow', pct.toFixed(1));
      els.barWrap.setAttribute('aria-valuetext', pct.toFixed(1) + '% of the route completed');
    }

    if (els.note) {
      var ago = fetchedAt ? Math.max(0, Math.round((Date.now() - fetchedAt) / 1000)) : null;
      els.note.textContent = isSnapshot
        ? 'Live feed unreachable right now — showing the last verified result. Projection = elapsed time ÷ share of route driven.'
        : 'Pulled from fsddb.com' + (ago !== null ? ' · updated ' + ago + 's ago' : '') +
          ' · projection = elapsed time ÷ share of route driven.';
    }

    // Tick every second only while there's something moving on screen
    if (tickTimer) { window.clearInterval(tickTimer); tickTimer = null; }
    if (ticking) tickTimer = window.setInterval(render, 1000);
  }

  /* ----------------------------------------------------------
     Poll loop — walk the source list until one parses
     ---------------------------------------------------------- */
  function tryNext(i) {
    if (i >= SOURCES.length) return Promise.resolve(null);
    var src = SOURCES[i];
    return fetchWithTimeout(src.url).then(function (body) {
      var parsed = null;
      if (src.kind === 'json') {
        try { parsed = fromJsonTree(JSON.parse(body)); } catch (e) { parsed = null; }
      } else {
        parsed = fromHtml(body);
      }
      return parsed || tryNext(i + 1);
    }, function () {
      return tryNext(i + 1);
    });
  }

  function refresh() {
    tryNext(0).then(function (parsed) {
      if (parsed) {
        data = merge(parsed);
        isSnapshot = false;
        fetchedAt = Date.now();
        setStatus(data.finished ? 'done' : 'live', data.finished ? 'Run complete' : 'Live');
      } else if (!data) {
        data = merge(null);
        isSnapshot = true;
        setStatus(data.finished ? 'done' : 'snapshot', data.finished ? 'Final result' : 'Snapshot');
      }
      render();
    });
  }

  refresh();
  window.setInterval(refresh, REFRESH_MS);
})();
