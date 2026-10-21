/* ============================================================================
   KED — carte interactive, frise des partenaires, apparitions au défilement.
   Aucune dépendance : JavaScript natif, aucun service tiers chargé.
   Données : data/points-de-vente.js · contours des cantons : cantons.js
   ============================================================================ */
(function () {
  'use strict';

  var I = window.KED_I18N || {};
  var J = I.js || {};
  var ROOT = I.root || '';
  var LANG = I.lang || 'fr';
  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- utilitaires ---------- */

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    (kids || []).forEach(function (c) {
      if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  function sv(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function fmt(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (_, k) { return vars[k] === undefined ? '' : vars[k]; });
  }
  function icon(path) {
    var s = sv('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    s.appendChild(sv('path', { d: path }));
    return s;
  }
  var ICON_BACK = 'M19 12H5M11 6l-6 6 6 6';
  var ICON_ROUTE = 'M5 19l14-14M9 5h10v10';
  var ICON_PHONE = 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z';
  var ICON_WEB = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18';

  /* ---------- apparitions au défilement ---------- */

  function initReveal() {
    var items = [].slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- frise des partenaires ---------- */

  function initMarquee() {
    var host = document.getElementById('marquee');
    var partners = window.KED_PARTENAIRES || [];
    if (!host || !partners.length) return;

    var perGroup = reduceMotion ? 1 : Math.max(1, Math.ceil(7 / partners.length));
    function group(hidden) {
      var g = el('ul', { class: 'marquee-group' });
      if (hidden) g.setAttribute('aria-hidden', 'true');
      for (var r = 0; r < perGroup; r++) {
        partners.forEach(function (p) {
          var img = el('img', { src: ROOT + p.logo, alt: hidden || r > 0 ? '' : p.nom, loading: 'lazy', decoding: 'async' });
          g.appendChild(el('li', { class: 'marquee-item' }, [img]));
        });
      }
      return g;
    }
    var track = el('div', { class: 'marquee-track' }, reduceMotion ? [group(false)] : [group(false), group(true)]);
    track.style.setProperty('--dur', Math.max(24, partners.length * perGroup * 6) + 's');
    host.appendChild(track);

    var btn = document.getElementById('marquee-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var paused = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
        btn.setAttribute('aria-label', paused ? I.partners_play : I.partners_pause);
        host.classList.toggle('is-paused', paused);
      });
    }
  }

  /* ---------- événements ---------- */

  function luxToday() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Luxembourg', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      return o.year + '-' + o.month + '-' + o.day;
    } catch (e) {
      var n = new Date();
      return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
    }
  }
  function formatDate(iso) {
    var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso || '';
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    var wd = (d.getUTCDay() + 6) % 7;
    var s = fmt(J.date_format, { wd: J.days[wd], d: +m[3], m: J.months[+m[2] - 1], y: m[1] });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function tr(v) {
    if (v && typeof v === 'object') return v[LANG] || v.fr || v.en || '';
    return v || '';
  }

  function initEvents() {
    var list = document.getElementById('events-list');
    var empty = document.getElementById('events-empty');
    if (!list || !empty) return;
    var today = luxToday();
    var events = (window.KED_EVENEMENTS || []).filter(function (e) {
      return e && e.date && (e.dateFin || e.date) >= today;
    }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

    if (!events.length) { empty.hidden = false; list.hidden = true; return; }

    if (events.some(function (e) { return e.exemple; })) {
      list.appendChild(el('p', { class: 'notice events-notice', text: J.event_example }));
    }
    events.forEach(function (e) {
      var when = formatDate(e.date) + (e.dateFin && e.dateFin !== e.date ? ' – ' + formatDate(e.dateFin) : '');
      var place = [e.lieu, e.ville].filter(Boolean).join(', ');
      var kids = [];
      if (e.image) {
        kids.push(el('figure', null, [el('img', { src: ROOT + e.image, alt: [tr(e.titre), place].filter(Boolean).join(' — '), loading: 'lazy', decoding: 'async', width: '1200', height: '800' })]));
      }
      var body = el('div', { class: 'event-body' }, [
        el('p', { class: 'event-date' }, [el('time', { datetime: e.date, text: when }), e.heure ? el('span', { text: e.heure.replace('-', ' – ') }) : null]),
        el('h3', { text: tr(e.titre) }),
        place ? el('p', { class: 'event-place', text: place }) : null,
        e.lien ? el('a', { class: 'btn btn--ghost', href: e.lien, target: '_blank', rel: 'noopener' }, [J.event_link]) : null
      ]);
      kids.push(body);
      list.appendChild(el('article', { class: 'event' + (e.image ? '' : ' event--noimg') }, kids));
    });
  }

  /* ---------- carte interactive ---------- */

  function initMap() {
    var mapEl = document.getElementById('map');
    var panel = document.getElementById('locator-panel');
    var cantons = window.KED_CANTONS || [];
    if (!mapEl || !panel || !cantons.length) return;

    /* calage coordonnées GPS -> repère de l'image (2048 x 2048) */
    var CAL = { x0: 427, x1: 1601, y0: 150, y1: 1869, lon0: 5.7357, lon1: 6.5287, lat0: 50.1824, lat1: 49.4478 };
    var HOME = [340, 90, 1330, 1820];
    function project(lat, lng) {
      return {
        x: CAL.x0 + (lng - CAL.lon0) / (CAL.lon1 - CAL.lon0) * (CAL.x1 - CAL.x0),
        y: CAL.y0 + (CAL.lat0 - lat) / (CAL.lat0 - CAL.lat1) * (CAL.y1 - CAL.y0)
      };
    }

    /* géométrie des cantons */
    function parse(d) {
      return d.replace(/Z/g, '').split(/[ML]/).filter(Boolean).map(function (s) {
        var p = s.trim().split(/\s+/);
        return [parseFloat(p[0]), parseFloat(p[1])];
      });
    }
    function inside(poly, x, y) {
      var c = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
      }
      return c;
    }
    function dist(poly, x, y) {
      var best = Infinity;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var ax = poly[j][0], ay = poly[j][1], bx = poly[i][0], by = poly[i][1];
        var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
        var t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l)) : 0;
        var px = ax + t * dx - x, py = ay + t * dy - y;
        best = Math.min(best, Math.sqrt(px * px + py * py));
      }
      return best;
    }
    var byCanton = {};
    cantons.forEach(function (c) { c.poly = parse(c.d); c.points = []; byCanton[c.id] = c; });

    /* points de vente : projection + canton déterminé automatiquement */
    var points = (window.KED_POINTS || []).filter(function (p) {
      return typeof p.lat === 'number' && typeof p.lng === 'number';
    });
    var byId = {};
    points.forEach(function (p) {
      var xy = project(p.lat, p.lng);
      p._x = xy.x; p._y = xy.y;
      var found = null;
      if (p.canton && byCanton[p.canton]) found = byCanton[p.canton];
      if (!found) {
        cantons.forEach(function (c) { if (!found && inside(c.poly, xy.x, xy.y)) found = c; });
      }
      if (!found) {
        var d = Infinity;
        cantons.forEach(function (c) { var dd = dist(c.poly, xy.x, xy.y); if (dd < d) { d = dd; found = c; } });
      }
      /* le dessin de la carte n'est pas une projection exacte : un point proche
         d'une frontière est ramené à l'intérieur de son canton */
      if (!inside(found.poly, p._x, p._y)) {
        var best = null, bd = Infinity, poly = found.poly;
        for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          var ax = poly[j][0], ay = poly[j][1], bx = poly[i][0], by = poly[i][1];
          var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
          var t = l ? Math.max(0, Math.min(1, ((p._x - ax) * dx + (p._y - ay) * dy) / l)) : 0;
          var qx = ax + t * dx, qy = ay + t * dy, dd = (qx - p._x) * (qx - p._x) + (qy - p._y) * (qy - p._y);
          if (dd < bd) { bd = dd; best = [qx, qy]; }
        }
        var cx = found.centroid[0], cy = found.centroid[1];
        var vx = cx - best[0], vy = cy - best[1], vl = Math.sqrt(vx * vx + vy * vy) || 1;
        for (var step = 14; step <= 140; step += 14) {
          var nx = best[0] + vx / vl * step, ny = best[1] + vy / vl * step;
          if (inside(poly, nx, ny)) { p._x = nx; p._y = ny; break; }
        }
      }
      p._canton = found.id;
      found.points.push(p);
      byId[p.id] = p;
    });
    var hasExample = points.some(function (p) { return p.exemple; });
    var cantonsWithPoints = cantons.filter(function (c) { return c.points.length; }).length;

    function cantonName(id) { return (J.cantons && J.cantons[id]) || id; }
    function countText(n) { return n === 1 ? J.count_one : fmt(J.count_other, { n: n }); }

    /* ---------- SVG ---------- */

    var svg = sv('svg', { viewBox: HOME.join(' '), role: 'group', 'aria-label': J.map_label, focusable: 'false' });
    var img = sv('image', { href: ROOT + 'assets/img/carte-luxembourg.webp', x: 0, y: 0, width: 2048, height: 2048, class: 'map-img', preserveAspectRatio: 'xMidYMid slice' });
    svg.appendChild(img);

    var gOutlines = sv('g', { 'aria-hidden': 'true' });
    var gCantons = sv('g');
    var gPins = sv('g');
    svg.appendChild(gOutlines); svg.appendChild(gCantons); svg.appendChild(gPins);

    var tip = el('div', { class: 'map-tip', role: 'presentation' });
    mapEl.appendChild(svg);
    mapEl.appendChild(tip);

    cantons.forEach(function (c) {
      var o = sv('path', { d: c.d, class: 'outline', 'data-id': c.id });
      gOutlines.appendChild(o); c.outline = o;
      var p = sv('path', { d: c.d, class: 'canton', 'data-id': c.id, tabindex: '0', role: 'button' });
      p.setAttribute('aria-label', cantonName(c.id) + ' — ' + countText(c.points.length));
      gCantons.appendChild(p); c.node = p;
      p.addEventListener('click', function () { selectCanton(c.id); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCanton(c.id); }
      });
      p.addEventListener('pointerenter', function (e) { showTip(e, cantonName(c.id), countText(c.points.length)); });
      p.addEventListener('pointermove', moveTip);
      p.addEventListener('pointerleave', hideTip);
      p.addEventListener('focus', function () {
        var r = p.getBoundingClientRect(), m = mapEl.getBoundingClientRect();
        showTipAt(r.left - m.left + r.width / 2, r.top - m.top + r.height / 2, cantonName(c.id), countText(c.points.length));
      });
      p.addEventListener('blur', hideTip);
    });

    points.forEach(function (p) {
      var g = sv('g', { class: 'pin-group', tabindex: '0', role: 'button', 'data-id': p.id });
      g.setAttribute('aria-label', p.nom + ' — ' + (p.ville || ''));
      var pulse = sv('circle', { class: 'pin-pulse', cx: p._x, cy: p._y });
      var ring = sv('circle', { class: 'pin-ring', cx: p._x, cy: p._y });
      var dot = sv('circle', { class: 'pin', cx: p._x, cy: p._y });
      var hit = sv('circle', { class: 'pin-hit', cx: p._x, cy: p._y });
      var label = sv('text', { class: 'pin-label', x: p._x, y: p._y, 'text-anchor': 'middle' });
      label.textContent = p.nom;
      g.appendChild(pulse); g.appendChild(ring); g.appendChild(dot); g.appendChild(hit); g.appendChild(label);
      gPins.appendChild(g);
      p._g = g; p._dot = dot; p._hit = hit; p._ring = ring; p._pulse = pulse; p._label = label;
      g.addEventListener('click', function (e) { e.stopPropagation(); selectPoint(p.id); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPoint(p.id); }
      });
      g.addEventListener('pointerenter', function (e) { showTip(e, p.nom, p.ville || ''); });
      g.addEventListener('pointermove', moveTip);
      g.addEventListener('pointerleave', hideTip);
    });

    /* info-bulle */
    function placeTip(x, y) { tip.style.left = x + 'px'; tip.style.top = y + 'px'; }
    function fillTip(a, b) {
      tip.textContent = a;
      if (b) tip.appendChild(el('small', { text: b }));
    }
    function showTip(e, a, b) { fillTip(a, b); moveTip(e); tip.classList.add('is-on'); }
    function showTipAt(x, y, a, b) { fillTip(a, b); placeTip(x, y); tip.classList.add('is-on'); }
    function moveTip(e) {
      var m = mapEl.getBoundingClientRect();
      placeTip(e.clientX - m.left, e.clientY - m.top);
    }
    function hideTip() { tip.classList.remove('is-on'); }

    /* ---------- zoom ---------- */

    var cur = HOME.slice();
    var raf = 0;

    function viewFor(c) {
      var aspect = HOME[2] / HOME[3];
      var bw = c.bbox[2] - c.bbox[0], bh = c.bbox[3] - c.bbox[1];
      var pad = 1.5;
      var w = Math.max(bw * pad, bh * pad * aspect, 480);
      var h = w / aspect;
      var cx = (c.bbox[0] + c.bbox[2]) / 2, cy = (c.bbox[1] + c.bbox[3]) / 2;
      return [cx - w / 2, cy - h / 2, w, h];
    }
    function sizePins() {
      var px = svg.clientWidth || mapEl.clientWidth || 600;
      var u = cur[2] / px;
      points.forEach(function (p) {
        var sel = state.point === p.id;
        p._dot.setAttribute('r', ((sel ? 6.5 : 4.6) * u).toFixed(2));
        p._dot.setAttribute('stroke-width', (1.6 * u).toFixed(2));
        p._hit.setAttribute('r', (18 * u).toFixed(2));
        p._ring.setAttribute('r', (11 * u).toFixed(2));
        p._ring.setAttribute('stroke-width', (1.6 * u).toFixed(2));
        p._pulse.setAttribute('r', (6.5 * u).toFixed(2));
        p._pulse.setAttribute('stroke-width', (1.4 * u).toFixed(2));
        p._label.setAttribute('font-size', (11.5 * u).toFixed(2));
        p._label.setAttribute('y', (p._y - 14 * u).toFixed(2));
        p._label.setAttribute('stroke-width', (3.5 * u).toFixed(2));
      });
    }
    function setView(v) {
      cur = v;
      svg.setAttribute('viewBox', v.map(function (n) { return n.toFixed(2); }).join(' '));
      sizePins();
    }
    function animateTo(target) {
      cancelAnimationFrame(raf);
      if (reduceMotion) { setView(target); return; }
      var from = cur.slice(), t0 = performance.now(), dur = 700;
      function step(t) {
        var k = Math.min(1, (t - t0) / dur);
        var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        setView(from.map(function (v, i) { return v + (target[i] - v) * e; }));
        if (k < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }

    /* ---------- état ---------- */

    var state = { canton: null, point: null };

    function applyMapState() {
      mapEl.classList.toggle('is-zoomed', !!state.canton);
      cantons.forEach(function (c) {
        var on = c.id === state.canton;
        c.node.classList.toggle('is-active', on);
        c.outline.classList.toggle('is-active', on);
        if (on) c.node.setAttribute('aria-current', 'true'); else c.node.removeAttribute('aria-current');
      });
      points.forEach(function (p) {
        var inCanton = !state.canton || p._canton === state.canton;
        /* un point n'est cliquable que dans le canton sélectionné : sur la carte
           complète, un toucher sélectionne toujours le canton, jamais un point */
        var clickable = !!state.canton && p._canton === state.canton;
        p._g.style.pointerEvents = clickable ? '' : 'none';
        p._g.setAttribute('tabindex', clickable ? '0' : '-1');
        p._g.setAttribute('aria-hidden', clickable ? 'false' : 'true');
        p._g.classList.toggle('is-dim', !inCanton);
        p._g.classList.toggle('is-selected', state.point === p.id);
        p._label.style.display = state.point === p.id ? '' : 'none';
      });
      sizePins();
    }

    function url() {
      try {
        var q = [];
        if (state.canton) q.push('canton=' + encodeURIComponent(state.canton));
        if (state.point) q.push('pv=' + encodeURIComponent(state.point));
        var u = location.pathname + (q.length ? '?' + q.join('&') : '') + (location.hash || '');
        history.replaceState(null, '', u);
      } catch (e) { /* file:// ou environnement restreint */ }
    }

    /* mobile : faire défiler la page jusqu'à un élément, sous l'en-tête fixe.
       window.scrollTo différé est fiable sur Safari iOS, contrairement à
       scrollIntoView lancé pendant l'animation de zoom de la carte. */
    function scrollToNode(node) {
      if (!node || !window.matchMedia('(max-width: 900px)').matches) return;
      setTimeout(function () {
        var header = document.querySelector('.site-header');
        var offset = (header ? header.offsetHeight : 0) + 12;
        var y = node.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - offset;
        try { window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' }); }
        catch (e) { window.scrollTo(0, y); }
      }, 80);
    }

    function selectCanton(id, noFocus) {
      state.canton = id; state.point = null;
      animateTo(viewFor(byCanton[id]));
      applyMapState(); render(!noFocus, noFocus ? null : panel); url();
    }
    function selectPoint(pid, noFocus) {
      var p = byId[pid]; if (!p) return;
      if (state.canton !== p._canton) { state.canton = p._canton; animateTo(viewFor(byCanton[p._canton])); }
      state.point = pid;
      applyMapState(); render(!noFocus, noFocus ? null : panel); url();
    }
    function backToCanton() {
      state.point = null; applyMapState(); render(true, panel); url();
    }
    /* retour à la carte complète : l'écran reste sur la carte (geste, Échap,
       clic dans le vide) ou y remonte (bouton « Toute la carte » sous la carte) */
    function reset(scrollTarget, keepFocus) {
      state.canton = null; state.point = null;
      animateTo(HOME.slice());
      applyMapState(); render(!keepFocus, scrollTarget || null); url();
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (state.point) backToCanton(); else if (state.canton) reset(null);
    });
    svg.addEventListener('click', function (e) {
      if (e.target === svg || e.target === img) { if (state.canton) reset(null, true); }
    });

    /* mobile : pincer (rapprocher deux doigts) sur un canton zoomé ramène à la carte complète */
    var pinch0 = 0;
    function touchDist(t) {
      var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    mapEl.addEventListener('touchstart', function (e) {
      pinch0 = e.touches.length === 2 ? touchDist(e.touches) : 0;
    }, { passive: true });
    mapEl.addEventListener('touchmove', function (e) {
      if (!pinch0 || e.touches.length !== 2 || !state.canton) return;
      if (touchDist(e.touches) / pinch0 < 0.8) { pinch0 = 0; hideTip(); reset(null, true); }
    }, { passive: true });
    mapEl.addEventListener('touchend', function (e) {
      if (e.touches.length < 2) pinch0 = 0;
    }, { passive: true });

    /* ---------- horaires ---------- */

    var DAY_KEYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
    function ranges(str) {
      if (!str || /^\s*(ferm|clos|zou|closed|—|-)/i.test(str)) return [];
      return String(str).split('/').map(function (r) {
        var m = r.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
        if (!m) return null;
        return [parseInt(m[1], 10) * 60 + parseInt(m[2], 10), parseInt(m[3], 10) * 60 + parseInt(m[4], 10)];
      }).filter(Boolean);
    }
    function luxNow() {
      try {
        var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Luxembourg', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
        var o = {};
        parts.forEach(function (p) { o[p.type] = p.value; });
        var d = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(o.weekday);
        return { day: d < 0 ? 0 : d, min: parseInt(o.hour, 10) * 60 + parseInt(o.minute, 10) };
      } catch (e) {
        var n = new Date();
        return { day: (n.getDay() + 6) % 7, min: n.getHours() * 60 + n.getMinutes() };
      }
    }
    function isOpen(h) {
      if (!h) return null;
      var n = luxNow();
      var today = ranges(h[DAY_KEYS[n.day]]);
      var yesterday = ranges(h[DAY_KEYS[(n.day + 6) % 7]]);
      var open = today.some(function (r) { return r[1] > r[0] ? (n.min >= r[0] && n.min < r[1]) : n.min >= r[0]; });
      if (!open) open = yesterday.some(function (r) { return r[1] <= r[0] && n.min < r[1]; });
      return open;
    }
    function hoursLabel(str) {
      var r = ranges(str);
      if (!r.length) return J.closed;
      if (r.length === 1 && r[0][0] === 0 && r[0][1] === 1440 && J.allday) return J.allday;
      return String(str).split('/').map(function (s) { return s.trim().replace('-', ' – '); }).join(' · ');
    }

    /* ---------- panneau ---------- */

    function mapsUrl(p) {
      if (p.itineraire) return p.itineraire;
      var dest = [p.adresse, [p.codePostal, p.ville].filter(Boolean).join(' '), 'Luxembourg'].filter(Boolean).join(', ');
      return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(dest || (p.lat + ',' + p.lng));
    }
    function typeLabel(p) { return (J.types && (J.types[p.type] || J.types.autre)) || ''; }
    function backButton(label, fn) {
      var b = el('button', { type: 'button', class: 'back' }, [icon(ICON_BACK), label]);
      b.addEventListener('click', fn);
      return b;
    }
    function pointItem(p) {
      var b = el('button', { type: 'button', class: 'list-item' }, [
        el('span', null, [
          el('span', { class: 't', text: p.nom }),
          el('span', { class: 's', text: [typeLabel(p), p.ville].filter(Boolean).join(' · ') })
        ]),
        icon('M9 6l6 6-6 6')
      ]);
      b.lastChild.setAttribute('width', '18'); b.lastChild.setAttribute('height', '18');
      b.addEventListener('click', function () { selectPoint(p.id); });
      b.addEventListener('pointerenter', function () { p._g.classList.add('is-hover'); });
      b.addEventListener('pointerleave', function () { p._g.classList.remove('is-hover'); });
      return b;
    }

    var titleNode = null;
    function render(moveFocus, scrollTarget) {
      panel.textContent = '';
      var children = [];

      if (hasExample) children.push(el('p', { class: 'notice', text: J.example_notice }));

      if (state.point) {
        var p = byId[state.point];
        var c = byCanton[p._canton];
        var open = isOpen(p.horaires);
        titleNode = el('h3', { class: 'panel-title', tabindex: '-1', text: p.nom });
        var d = el('div', { class: 'detail' });
        d.appendChild(el('div', { class: 'panel-head' }, [
          el('span', { class: 'chip', text: typeLabel(p) }),
          titleNode,
          open === null ? null : el('span', { class: 'status' + (open ? ' is-open' : ''), text: open ? J.open_now : J.closed_now })
        ]));
        if (p.note) d.appendChild(el('p', { class: 'point-note', text: tr(p.note) }));
        d.appendChild(el('address', null, [
          p.adresse || '', p.adresse ? el('br') : null,
          [p.codePostal, p.ville].filter(Boolean).join(' ')
        ]));
        if (p.horaires) {
          var n = luxNow();
          var tb = el('tbody');
          DAY_KEYS.forEach(function (k, i) {
            tb.appendChild(el('tr', { class: i === n.day ? 'is-today' : '' }, [
              el('th', { scope: 'row', text: J.days[i] }),
              el('td', { text: hoursLabel(p.horaires[k]) })
            ]));
          });
          var tbl = el('table', { class: 'hours' }, [
            el('caption', { class: 'muted', style: 'text-align:left;padding-bottom:8px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:700', text: J.hours }),
            tb
          ]);
          d.appendChild(tbl);
        }
        var actions = el('div', { class: 'actions' });
        actions.appendChild(el('a', { class: 'btn btn--primary', href: mapsUrl(p), target: '_blank', rel: 'noopener' }, [icon(ICON_ROUTE), J.directions]));
        if (p.telephone) actions.appendChild(el('a', { class: 'btn', href: 'tel:' + p.telephone.replace(/[^\d+]/g, '') }, [icon(ICON_PHONE), J.call]));
        if (p.siteWeb) actions.appendChild(el('a', { class: 'btn btn--ghost', href: p.siteWeb, target: '_blank', rel: 'noopener' }, [icon(ICON_WEB), J.website]));
        d.appendChild(actions);

        children.push(backButton(fmt(J.back_canton, { canton: cantonName(c.id) }), backToCanton));
        children.push(d);
      } else if (state.canton) {
        var cc = byCanton[state.canton];
        titleNode = el('h3', { class: 'panel-title', tabindex: '-1', text: cantonName(cc.id) });
        children.push(backButton(J.back_map, function () { reset(mapEl); }));
        children.push(el('div', { class: 'panel-head' }, [
          titleNode,
          el('p', { class: 'panel-count', text: countText(cc.points.length) })
        ]));
        if (cc.points.length) {
          var ul = el('div', { class: 'list' });
          cc.points.slice().sort(function (a, b) { return a.nom.localeCompare(b.nom, LANG); }).forEach(function (pt) { ul.appendChild(pointItem(pt)); });
          children.push(ul);
        } else {
          children.push(el('p', { class: 'muted', text: J.none }));
        }
      } else {
        titleNode = el('h3', { class: 'panel-title', tabindex: '-1', text: J.all_cantons });
        var total = points.length;
        children.push(el('div', { class: 'panel-head' }, [
          titleNode,
          el('p', { class: 'panel-count', text: total ? (total === 1 ? J.total_one : fmt(J.total, { n: total, m: cantonsWithPoints })) : J.none }),
          el('p', { class: 'muted', text: J.hint })
        ]));
        var all = el('div', { class: 'list list--grid' });
        cantons.slice().sort(function (a, b) {
          return b.points.length - a.points.length || cantonName(a.id).localeCompare(cantonName(b.id), LANG);
        }).forEach(function (cn) {
          var b = el('button', { type: 'button', class: 'list-item' + (cn.points.length ? '' : ' is-empty') }, [
            el('span', { class: 't', text: cantonName(cn.id) }),
            el('span', { class: 'c', text: String(cn.points.length) })
          ]);
          b.setAttribute('aria-label', cantonName(cn.id) + ' — ' + countText(cn.points.length));
          b.addEventListener('click', function () { selectCanton(cn.id); });
          all.appendChild(b);
        });
        children.push(all);
      }

      children.forEach(function (c) { panel.appendChild(c); });
      if (moveFocus && titleNode) {
        try { titleNode.focus({ preventScroll: true }); } catch (e) { /* ancien navigateur : pas de focus pour ne pas faire sauter l'écran */ }
      }
      if (scrollTarget) scrollToNode(scrollTarget);
    }

    /* liste complète des points de vente sous la carte : consultable sans
       manipuler la carte, et lisible par les moteurs de recherche */
    var allHost = document.getElementById('points-all');
    if (allHost) {
      cantons.filter(function (c) { return c.points.length; })
        .sort(function (a, b) { return cantonName(a.id).localeCompare(cantonName(b.id), LANG); })
        .forEach(function (c) {
          var ul = el('ul');
          c.points.slice().sort(function (a, b) { return a.nom.localeCompare(b.nom, LANG); }).forEach(function (p) {
            var show = el('button', { type: 'button', class: 'pa-link' }, [J.show_on_map]);
            show.addEventListener('click', function () {
              selectPoint(p.id, true);
              if (window.matchMedia('(max-width: 900px)').matches) scrollToNode(mapEl);
              else mapEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            });
            var lead = [typeLabel(p), p.adresse].filter(Boolean).join(' · ');
            var town = [p.codePostal, p.ville].filter(Boolean).join(' ');
            ul.appendChild(el('li', null, [
              el('strong', { text: p.nom }),
              el('span', { class: 'pa-meta' }, [lead + (town ? ', ' : ''), town ? el('span', { class: 'nowrap', text: town }) : null]),
              el('span', { class: 'pa-actions' }, [el('a', { href: mapsUrl(p), target: '_blank', rel: 'noopener' }, [String(J.directions).replace(/\s*\(.*\)\s*$/, '')]), show])
            ]));
          });
          allHost.appendChild(el('div', { class: 'pa-group' }, [el('h4', { text: cantonName(c.id) + ' (' + c.points.length + ')' }), ul]));
        });
    }

    window.addEventListener('resize', sizePins);

    /* démarrage (liens partageables : ?canton=remich&pv=identifiant) */
    applyMapState();
    render(false);
    try {
      var qs = new URLSearchParams(location.search);
      var qc = qs.get('canton'), qp = qs.get('pv');
      if (qp && byId[qp]) selectPoint(qp, true);
      else if (qc && byCanton[qc]) selectCanton(qc, true);
    } catch (e) { /* ignore */ }
  }

  /* ---------- démarrage ---------- */

  function start() {
    initReveal();
    initMarquee();
    initEvents();
    initMap();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
