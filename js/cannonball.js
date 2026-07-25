/* ============================================================
   TESLA-ESSENTIALS.COM — FSD Cannonball live telemetry
   Pulls the FSD Cannonball record-attempt data from the FSDDB
   tracker (https://fsddb.com/trackers/FSDCannonball) in the
   visitor's browser and projects the total run time from pace:

       projected = elapsed ÷ (miles completed ÷ route miles)

   Verified against the real site (July 2026): fsddb is a Rails
   app that embeds a `let snapshot = {...}` JSON blob in the
   tracker page and polls /trackers/fsdcannonball/snapshot
   (?client= token required, rotates per race — scrape it from
   the page's data-snapshot-url). fsddb sends NO CORS headers,
   so cross-origin reads must go through a CORS mirror; the
   direct endpoint stays first in the chain only in case they
   ever enable CORS. corsproxy.io blocks production origins on
   its free tier, so allorigins.win is the mirror of record.

   Snapshot fields that matter (real names):
     public_route.planned_total_miles  route length (2,850)
     public_route.progress_miles       miles completed on route
     total_miles / self_driving_miles  miles driven so far
       (NOT the route length — do not map these to totalMiles)
     manual_miles                      the honesty metric; fsddb
                                       has no "interventions" key
     race.started_at / ended_at        run clock
     race.final_seconds                elapsed, once finished
     race.time_to_beat_seconds         179757 = 49:55:57 record
     race.record_holder                "@BLKMDL3"
     race.beat_record                  true/false once decided
     status                            "active" while running

   Anything missing falls back to the last verified snapshot so
   the board never renders empty. Fully vanilla, no deps.
   ============================================================ */
(function () {
  'use strict';

  var root = document.getElementById('telemetry');
  if (!root || typeof window.fetch !== 'function') return;

  var TRACKER_PAGE = 'https://fsddb.com/trackers/FSDCannonball';
  var REFRESH_MS = 60000;   // re-poll the sources every 60s
  var FETCH_TIMEOUT_MS = 9000;

  // Uncertainty on the projection. The hours already driven are fact;
  // only the remaining time is an estimate, and ±10% covers the pace
  // swing between open interstate and charging-heavy stretches. Shown
  // as a confidence percentage: 100% minus the projection's overall
  // pace uncertainty, so it rises to 100% at the finish line. The same
  // uncertainty window also decides when the race delta is "too close
  // to call". Heuristic, not statistics — but honest about which part
  // of the number is guesswork.
  var BAND_SHARE = 0.10;

  // Snapshot JSON path. The ?client= token rotates per race; this is the
  // value observed July 2026, and refresh() re-scrapes the live one from
  // the page's data-snapshot-url whenever the page is the source that wins.
  var snapshotPath = '/trackers/fsdcannonball/snapshot?client=20260724-race-1';

  // Time to beat: fastest zero-intervention FSD Cannonball to date —
  // 49:55:57 by @BLKMDL3 (May 2026), exactly as the tracker's
  // race.time_to_beat_seconds reports it. Overridden by the live feed.
  var recordMs = 179757 * 1000;

  // Last verified live state (probed 2026-07-25 12:43 UTC, near Florence
  // OH): David Moss, Owen Sparks and Spencer, NYC Red Ball Garage →
  // Portofino Inn Redondo Beach, run in progress. Shown only if every
  // live source fails, and labeled as a snapshot when it is (a snapshot
  // never ticks).
  var FALLBACK = {
    miles: 509,
    totalMiles: 2850,
    manualMiles: 0,
    startTime: Date.parse('2026-07-24T21:38:02-07:00'),
    elapsedMs: Date.parse('2026-07-25T05:42:49-07:00') - Date.parse('2026-07-24T21:38:02-07:00'),
    finished: false
  };

  // Our own relay: .github/workflows/cannonball-relay.yml polls fsddb
  // every ~45 s (looping inside a 5-min cron) and pushes changes to the
  // cannonball-data branch; raw.github serves it WITH CORS headers —
  // unlike fsddb itself. Typical lag ~1 min, and the elapsed clock
  // ticks locally anyway so only the mile counter lags at all.
  var RELAY = 'https://raw.githubusercontent.com/tesla-essentials/tesla-essentials.github.io/cannonball-data/cannonball.json';

  function mirror(url) {
    // allorigins caches ~5 min per URL; the throwaway param keeps polls live
    return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url) + '&_=' + Date.now();
  }

  function mirror2(url) {
    return 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url);
  }

  // Order matters: cheapest/cleanest first. Direct fsddb JSON fails CORS
  // today (no ACAO headers) but costs one fast failed request; the relay
  // is the dependable workhorse. The public CORS mirrors trail as
  // fresher-but-flaky extras — during the July 2026 race both sat on
  // 520/522 for hours, which is why they can't lead the chain.
  function sources() {
    return [
      { url: 'https://fsddb.com' + snapshotPath, kind: 'json' },
      { url: RELAY + '?_=' + Date.now(), kind: 'json' },
      { url: mirror(TRACKER_PAGE), kind: 'html' },
      { url: mirror('https://fsddb.com' + snapshotPath), kind: 'json' },
      { url: mirror2(TRACKER_PAGE), kind: 'html' }
    ];
  }

  var els = {
    status: document.getElementById('tm-status'),
    projected: document.getElementById('tm-projected'),
    conf: document.getElementById('tm-conf'),
    projectedLabel: document.getElementById('tm-projected-label'),
    record: document.getElementById('tm-record'),
    diff: document.getElementById('tm-diff'),
    diffLabel: document.getElementById('tm-diff-label'),
    diffWrap: document.getElementById('tm-diff-wrap'),
    miles: document.getElementById('tm-miles'),
    total: document.getElementById('tm-total'),
    elapsed: document.getElementById('tm-elapsed'),
    speed: document.getElementById('tm-speed'),
    manual: document.getElementById('tm-manual'),
    bar: document.getElementById('tm-bar'),
    barWrap: document.getElementById('tm-bar-wrap'),
    pct: document.getElementById('tm-pct'),
    note: document.getElementById('tm-note')
  };

  var data = null;        // best data we currently have
  var isSnapshot = true;  // true until a live source succeeds
  var attempted = false;  // true once the first source walk finished
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
     Parsing. Primary: the exact snapshot schema above. Backup:
     fuzzy key matching (in case fsddb renames), then the page's
     visible text ("78 of 2,850 planned miles", "Time to beat
     49:55:57", "Race clock 1:35:09").
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
    if (typeof v === 'string' && /\d{4}-\d{2}-\d{2}T/.test(v)) {
      var t = Date.parse(v);
      if (isFinite(t)) return t;
    }
    if (typeof v === 'number' && v > 1e12 && v < 4e12) return v;            // ms epoch
    if (typeof v === 'number' && v > 1e9 && v < 4e9) return v * 1000;       // s epoch
    return null;
  }

  // Flatten an object tree into [lowercasedKeyPath, primitiveValue] pairs
  function flatten(obj, out, prefix, depth) {
    if (obj == null || depth > 10 || out.length > 2000) return;
    if (Array.isArray(obj)) {
      // Never descend into route_line-sized arrays of coordinates
      if (obj.length > 50) return;
      for (var i = 0; i < obj.length; i++) flatten(obj[i], out, prefix, depth + 1);
      return;
    }
    if (typeof obj === 'object') {
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        var v = obj[k];
        var path = prefix + k.toLowerCase();
        if (typeof v === 'object' && v !== null) flatten(v, out, path + '.', depth + 1);
        else out.push([path, v]);
      }
    }
  }

  function pick(pairs, keyRe, valueFn, lo, hi) {
    for (var i = 0; i < pairs.length; i++) {
      if (!keyRe.test(pairs[i][0])) continue;
      var v = valueFn(pairs[i][1]);
      if (v !== null && (lo === undefined || (v >= lo && v <= hi))) return v;
    }
    return null;
  }

  function fromJsonTree(tree) {
    if (!tree || typeof tree !== 'object') return null;
    var pairs = [];
    flatten(tree, pairs, '', 0);
    if (!pairs.length) return null;

    var out = {};
    // Route length: planned_total_miles. "total_miles" alone is the miles
    // DRIVEN so far on fsddb — never treat it as the route length.
    out.totalMiles = pick(pairs, /planned_total_miles$|planned[^.]*mile|route[^.]*mile/, num, 300, 8000);
    // Miles completed along the route (odometer_miles and miles_to_arrival
    // must not match).
    out.miles = pick(pairs, /progress_miles$/, num, 0, 8000);
    if (out.miles === null) out.miles = pick(pairs, /self_driving_miles$/, num, 0, 8000);
    if (out.miles === null) out.miles = pick(pairs, /(^|\.)total_miles$/, num, 0, 8000);
    out.manualMiles = pick(pairs, /manual_miles$|manual[^.]*(mile|distance)/, num, 0, 8000);
    out.startTime = pick(pairs, /race\.started_at$/, parseDate) ||
                    pick(pairs, /(^|\.)started_at$|start|depart/, parseDate);
    // When fsddb last moved the mile counters. The projection must pair
    // the miles with the clock reading from the same instant, or stale
    // data silently inflates the projected time.
    out.dataTime = pick(pairs, /counter_updated_at$/, parseDate) ||
                   pick(pairs, /vehicle_updated_at$|(^|\.)updated_at$/, parseDate);
    out.endTime = pick(pairs, /race\.ended_at$/, parseDate) ||
                  pick(pairs, /(^|\.)ended_at$|(end|finish|complete)[^.]*(time|at|date)/, parseDate);
    out.finalSeconds = pick(pairs, /final_seconds$/, num, 60, 3e6);
    out.recordSeconds = pick(pairs, /time_to_beat_seconds$|record[^.]*seconds/, num, 3600, 3e6);
    out.status = pick(pairs, /(^|\.)status$/, function (v) {
      return typeof v === 'string' ? v.toLowerCase() : null;
    });
    out.beatRecord = null;
    for (var i = 0; i < pairs.length; i++) {
      if (/beat_record$/.test(pairs[i][0]) && typeof pairs[i][1] === 'boolean') {
        out.beatRecord = pairs[i][1];
        break;
      }
    }
    return (out.miles !== null || out.totalMiles !== null || out.startTime !== null) ? out : null;
  }

  // Extract the balanced JSON object starting at html[from] (respects strings)
  function jsonAt(html, from) {
    var depth = 0, inStr = false, esc = false;
    for (var i = from; i < html.length && i < from + 500000; i++) {
      var c = html.charAt(i);
      if (esc) { esc = false; continue; }
      if (inStr) {
        if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          try { return JSON.parse(html.slice(from, i + 1)); } catch (e) { return null; }
        }
      }
    }
    return null;
  }

  function hms(h, m, s) {
    return ((num(h) || 0) * 3600 + (num(m) || 0) * 60 + (num(s) || 0)) * 1000;
  }

  function fromHtml(html) {
    // Freshen the snapshot path (its ?client= token rotates per race)
    var su = html.match(/data-snapshot-url="([^"]+)"/);
    if (su && su[1].indexOf('/trackers/') === 0) snapshotPath = su[1];

    // 1) The embedded `let snapshot = {...}` JSON — the full data set
    var m = html.match(/(?:let|var|const)\s+snapshot\s*=\s*\{/);
    if (m) {
      var viaJson = fromJsonTree(jsonAt(html, m.index + m[0].length - 1));
      if (viaJson && viaJson.miles !== null) return viaJson;
    }

    // 2) Visible-text scraping of the real tracker markup
    var text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');

    var out = { miles: null, totalMiles: null, manualMiles: null, startTime: null,
                endTime: null, finalSeconds: null, recordSeconds: null, status: null, beatRecord: null };

    // "78 of 2,850 planned miles"
    var frac = text.match(/([\d,]+(?:\.\d+)?)\s*of\s*([\d,]+(?:\.\d+)?)\s*planned\s*miles/i);
    if (!frac) frac = text.match(/([\d,]+(?:\.\d+)?)\s*(?:\/|of|out of)\s*([\d,]+(?:\.\d+)?)\s*(?:mi\b|miles)/i);
    if (frac) {
      var a = num(frac[1]), b = num(frac[2]);
      if (a !== null && b !== null && b >= a && b >= 300) { out.miles = a; out.totalMiles = b; }
    }

    // "Time to beat 49:55:57" and "Race clock 1:35:09"
    var beat = text.match(/time\s*to\s*beat\s*(\d+):(\d{2}):(\d{2})/i);
    if (beat) out.recordSeconds = hms(beat[1], beat[2], beat[3]) / 1000;
    var clock = text.match(/race\s*clock\s*(\d+):(\d{2}):(\d{2})/i);
    if (clock) out.elapsedMs = hms(clock[1], clock[2], clock[3]);

    // Labeled start timestamps in the raw HTML (JSON-ish attributes)
    var st = html.match(/"started_at"\s*:\s*"(\d{4}-\d{2}-\d{2}T[^"]+)"/i);
    if (st) out.startTime = parseDate(st[1]);

    return (out.miles !== null || out.elapsedMs || out.startTime !== null) ? out : null;
  }

  /* ----------------------------------------------------------
     Data assembly + projection
     ---------------------------------------------------------- */
  function merge(parsed) {
    var d = {
      miles: (parsed && parsed.miles !== null && parsed.miles !== undefined) ? parsed.miles : FALLBACK.miles,
      totalMiles: (parsed && parsed.totalMiles) || FALLBACK.totalMiles,
      manualMiles: (parsed && parsed.manualMiles !== null && parsed.manualMiles !== undefined)
        ? parsed.manualMiles : FALLBACK.manualMiles,
      startTime: (parsed && parsed.startTime) || FALLBACK.startTime,
      dataTime: (parsed && parsed.dataTime) || null,
      endTime: (parsed && parsed.endTime) || null,
      elapsedMs: (parsed && parsed.elapsedMs) || null,
      beatRecord: (parsed && typeof parsed.beatRecord === 'boolean') ? parsed.beatRecord : null
    };
    if (parsed && parsed.recordSeconds) recordMs = parsed.recordSeconds * 1000;
    if (d.totalMiles < d.miles) d.totalMiles = d.miles;

    d.finished = !!(d.endTime ||
      (parsed && parsed.finalSeconds) ||
      d.beatRecord !== null ||
      (parsed && parsed.status && parsed.status !== 'active' && parsed.status !== 'scheduled') ||
      d.miles >= d.totalMiles - 1);

    if (parsed && parsed.finalSeconds) d.elapsedMs = parsed.finalSeconds * 1000;
    if (d.elapsedMs === null) {
      if (d.startTime && d.endTime && d.endTime > d.startTime) d.elapsedMs = d.endTime - d.startTime;
      else if (d.startTime && !d.finished) d.elapsedMs = Math.max(0, Date.now() - d.startTime);
      else d.elapsedMs = FALLBACK.elapsedMs;
    }
    return d;
  }

  function isTicking(d) {
    // Only a live (non-snapshot) run with a known start keeps counting
    // between polls — a stale snapshot must never pretend to be a clock.
    return !d.finished && !!d.startTime && !isSnapshot;
  }

  function elapsedNow(d) {
    if (isTicking(d)) return Math.max(0, Date.now() - d.startTime);
    return d.elapsedMs;
  }

  // How old the mile counters are. The race clock is always live, but the
  // miles are only as fresh as fsddb's last counter update plus whatever
  // the relay/mirror added on top.
  function dataAgeMs(d) {
    if (!d.dataTime || d.finished) return 0;
    return Math.max(0, Date.now() - d.dataTime);
  }

  // Elapsed time AT THE MOMENT the miles were recorded — the only clock
  // reading that pairs with them. Using the live clock instead would
  // charge the run for time it has no mileage data for: with 874 of
  // 2,850 miles down, every hour of stale data inflated the projection
  // by 3.3 hours, marching the board toward "behind the record" and
  // snapping back on the next update.
  function paceElapsedMs(d) {
    var el = elapsedNow(d);
    if (!d.dataTime || !d.startTime || d.finished) return el;
    var atData = d.dataTime - d.startTime;
    if (!isFinite(atData) || atData <= 0) return el;
    return Math.min(el, atData);
  }

  function projectedMs(d) {
    if (d.miles <= 0 || d.totalMiles <= 0) return null;
    var proj = paceElapsedMs(d) * (d.totalMiles / d.miles);
    // A projection can never undercut time already on the clock.
    return Math.max(proj, elapsedNow(d));
  }

  /* ----------------------------------------------------------
     Formatting + render
     ---------------------------------------------------------- */
  function fmtMiles(v) {
    return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  }

  // Durations render in hours only — never days — so run times compare
  // at a glance against the record ("68h 00m", not "2d 20h 00m").
  function fmtDur(ms, withSeconds) {
    if (ms === null || !isFinite(ms)) return '—';
    var s = Math.floor(Math.abs(ms) / 1000);
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    var parts = [h + 'h', (m < 10 ? '0' : '') + m + 'm'];
    if (withSeconds) parts.push((s < 10 ? '0' : '') + s + 's');
    return parts.join(' ');
  }

  function setStatus(state, label) {
    root.setAttribute('data-state', state);
    if (els.status) els.status.textContent = label;
  }

  function render() {
    if (!data) return;
    var el = elapsedNow(data);
    var paceEl = paceElapsedMs(data);
    var proj = projectedMs(data);
    var ticking = isTicking(data);
    var pct = data.totalMiles > 0 ? Math.min(100, (data.miles / data.totalMiles) * 100) : 0;
    // Average speed pairs miles with the clock from the same instant too
    var hours = paceEl / 3600000;

    if (els.miles) els.miles.textContent = fmtMiles(data.miles);
    if (els.total) els.total.textContent = fmtMiles(data.totalMiles);
    if (els.elapsed) els.elapsed.textContent = fmtDur(el, ticking);
    if (els.speed) els.speed.textContent = hours > 0.05 ? (data.miles / hours).toFixed(1) : '—';
    if (els.manual) els.manual.textContent = data.manualMiles === null ? '—' : fmtMiles(data.manualMiles);
    if (els.projected) els.projected.textContent = fmtDur(proj, false);
    if (els.projectedLabel) {
      els.projectedLabel.textContent = data.finished ? 'Final time — run complete' : 'Projected total time';
    }

    // Uncertainty window (never displayed as ±): BAND_SHARE of the
    // REMAINING time. Drives the confidence % and the too-close call.
    // Everything after the last data point is extrapolation, so the
    // window grows with stale data instead of hiding it.
    var band = null;
    if (proj !== null && isFinite(proj) && !data.finished) {
      band = Math.max(0, proj - paceEl) * BAND_SHARE;
    }
    if (els.conf) {
      if (band !== null && proj > 0) {
        var conf = Math.max(0, Math.min(100, Math.round(100 * (1 - band / proj))));
        els.conf.hidden = false;
        els.conf.textContent = conf + '% confidence';
      } else {
        els.conf.hidden = true;
      }
    }

    // Race vs the record: negative delta = on pace to beat it. When the
    // margin to the record is smaller than the uncertainty window, say
    // so instead of pretending the projection can pick a side.
    if (els.record) els.record.textContent = fmtDur(recordMs, false);
    var diff = (proj !== null && isFinite(proj)) ? proj - recordMs : null;
    var tooClose = diff !== null && band !== null && Math.abs(diff) <= band;
    if (els.diff) {
      els.diff.textContent = diff === null ? '—' : (diff < 0 ? '−' : '+') + fmtDur(diff, false);
    }
    if (els.diffLabel) {
      els.diffLabel.textContent = diff === null ? 'Projected vs record'
        : tooClose ? 'Too close to call'
        : diff < 0
          ? (data.finished ? 'Beat the record by' : 'Ahead of the record')
          : (data.finished ? 'Over the record by' : 'Behind the record');
    }
    // Glow is earned: only ahead beyond the uncertainty band lights up
    if (els.diffWrap) {
      els.diffWrap.classList.toggle('is-ahead',
        diff !== null && diff < 0 && (data.finished || !tooClose));
    }
    if (els.bar) els.bar.style.width = pct.toFixed(2) + '%';
    if (els.pct) els.pct.textContent = pct.toFixed(1) + '% of route';
    if (els.barWrap) {
      els.barWrap.setAttribute('aria-valuenow', pct.toFixed(1));
      els.barWrap.setAttribute('aria-valuetext', pct.toFixed(1) + '% of the route completed');
    }

    if (els.note) {
      // Report the age of the MILES (fsddb's counter), not of our fetch —
      // a fetch that returns hour-old numbers isn't "updated 3s ago".
      var ageMin = Math.round(dataAgeMs(data) / 60000);
      var ago = ageMin >= 2 ? ' · miles ' + ageMin + ' min old' : ' · miles current';
      els.note.textContent = !isSnapshot
        ? 'Pulled from fsddb.com' + ago +
          ' · projection = elapsed time ÷ share of route driven.'
        : attempted
          ? 'Live feed unreachable right now — showing the last verified state. Projection = elapsed time ÷ share of route driven.'
          : 'Connecting to the live feed — showing the last verified state meanwhile. Projection = elapsed time ÷ share of route driven.';
    }

    // Tick every second only while there's something moving on screen
    if (tickTimer) { window.clearInterval(tickTimer); tickTimer = null; }
    if (ticking) tickTimer = window.setInterval(render, 1000);
  }

  /* ----------------------------------------------------------
     Poll loop — walk the source list until one parses
     ---------------------------------------------------------- */
  function tryNext(list, i) {
    if (i >= list.length) return Promise.resolve(null);
    var src = list[i];
    return fetchWithTimeout(src.url).then(function (body) {
      // A parser exception must never wedge the board in a stale state —
      // treat it exactly like an unreachable source and walk on.
      var parsed = null;
      try {
        parsed = (src.kind === 'json') ? fromJsonTree(JSON.parse(body)) : fromHtml(body);
      } catch (e) { parsed = null; }
      return parsed || tryNext(list, i + 1);
    }, function () {
      return tryNext(list, i + 1);
    });
  }

  function refresh() {
    tryNext(sources(), 0).then(function (parsed) {
      attempted = true;
      if (parsed) {
        data = merge(parsed);
        isSnapshot = false;
        fetchedAt = Date.now();
        setStatus(data.finished ? 'done' : 'live', data.finished ? 'Run complete' : 'Live');
      }
      render();
    }).catch(function () {
      attempted = true;
      render();
    });
  }

  // Paint the last verified state immediately — the source walk can take
  // tens of seconds when the mirrors are struggling, and an empty board
  // full of dashes reads as broken. refresh() upgrades it to live data.
  data = merge(null);
  setStatus(data.finished ? 'done' : 'snapshot', data.finished ? 'Final result' : 'Last verified');
  render();

  refresh();
  window.setInterval(refresh, REFRESH_MS);
})();
