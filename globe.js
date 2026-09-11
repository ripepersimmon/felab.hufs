// Conference-trip globe on the Blog page. Plain canvas, no libraries.
// The data (places, routes, photos) is written into blog.html by build.js as
// <script type="application/json" id="globe-data">. This file only draws it.
//
// Land is a run-length encoded equal-area dot grid at 1.5° spacing, sampled
// from Natural Earth 110m land (via world-atlas). Rows run from the south
// pole; each row lists alternating water/land run lengths, water first.
(function () {
'use strict';
var LAND_STEP = 1.5;
var LAND = '3;9;16;1,1,20;2,25,1;2,9,1,20,2;4,8,1,2,2,22,2;2,11,4,1,1,26,2;4,11,7,29,2;5,14,7,30,3;11,1,2,7,9,33,2;22,1,10,36,2;23,2,14,14,1,21,2;25,2,22,8,2,19,5;55,7,2,17,8;30,1,30,2,11,1,1,2,2,1,1,2,11;32,1,67;106;112;117;123;128;133;42,2,95;42,3,99;43,3,3,2,98;44,3,106;46,4,108;48,4,111;49,3,109,2,4;50,5,111,2,4;52,5,102,1,12,1,3;53,4,105,2,12,2,2;55,6,121,1,2;56,8,104,1,1,1,14,2,1;57,9,105,5,16;59,8,106,7,12,1,3;60,10,40,4,50,5,6,1,1,7,16;61,11,40,6,49,6,4,11,15;62,12,39,7,49,22,15;63,13,38,9,48,23,15;64,13,38,10,48,23,16;65,13,38,11,48,24,16;66,14,38,12,6,2,40,23,17;67,16,36,13,5,3,40,23,18;68,18,34,13,5,3,42,21,10,1,8;69,18,34,13,6,3,44,18,20;69,19,33,15,5,4,45,16,21;69,21,32,17,4,3,46,11,1,3,22;68,23,32,18,4,2,48,8,3,3,22;67,24,33,19,5,1,49,1,1,4,4,2,23;67,25,34,17,59,4,3,1,24;67,26,33,18,66,1,24;67,28,32,18,52,1,2,1,15,1,20;67,29,32,17,48,2,15,4,2,1,7,1,13;66,30,31,18,44,2,1,1,18,5,6,1,15;66,30,31,18,44,1,21,5,23;66,28,33,19,41,3,10,1,7,7,24;66,24,36,21,40,3,3,5,1,2,8,1,1,2,27;66,23,37,22,39,2,4,5,7,1,2,1,31;67,20,39,23,37,3,4,6,1,3,2,1,34;68,18,40,25,34,2,1,1,5,5,41;68,18,40,25,33,1,1,2,7,3,41;68,17,28,6,4,29,31,1,2,2,8,3,40;68,13,30,41,20,1,12,1,10,1,4,2,35;65,1,1,13,30,42,18,1,1,1,11,1,15,3,35;62,2,5,2,1,6,31,43,17,2,12,1,4,1,7,1,2,1,37;61,2,7,3,34,39,3,2,16,3,12,1,2,3,7,1,1,1,1,1,35;60,3,43,40,20,3,12,1,1,5,9,1,36;57,6,42,38,1,4,17,3,12,7,8,1,37;53,1,1,6,44,36,2,6,14,4,11,7,7,2,37;50,8,46,35,2,9,11,6,8,8,8,1,37;48,5,3,2,10,2,33,34,2,10,10,8,6,7,2,1,44;46,6,4,2,6,2,36,34,2,11,9,9,3,9,46;46,5,11,2,37,33,2,12,7,12,1,13,42;45,5,51,31,2,13,6,29,2,1,36;41,1,2,6,50,30,2,8,2,1,7,31,1,1,35;40,1,1,7,10,1,39,29,1,8,5,37,36;39,1,1,8,8,2,39,28,1,8,2,40,35;39,10,3,1,3,1,42,33,2,41,34;38,18,41,16,1,58,34;36,20,40,14,3,2,6,49,5,1,27;34,22,40,10,14,47,5,1,1,2,24;32,25,38,1,1,7,7,1,6,45,4,1,2,4,22;31,25,37,2,3,4,9,3,1,46,2,2,4,2,21;30,25,34,5,11,2,1,12,2,34,3,2,6,1,20;29,25,34,4,11,1,2,12,2,34,1,1,1,1,6,1,20;28,26,32,5,5,2,2,4,2,3,1,5,2,38,5,1,19;27,26,31,5,3,3,2,5,6,3,3,38,4,2,18;27,26,1,1,30,7,1,7,5,3,2,41,3,1,17;26,30,27,14,2,1,1,5,2,39,20;25,27,4,2,22,64,19;24,27,2,2,22,65,16;22,26,2,1,1,1,24,59,1,1,15;22,19,1,9,21,3,1,58,5,1,9;20,19,1,10,18,4,2,54,6,2,8;6,1,12,19,1,8,19,1,1,1,7,46,8,2,7;7,1,10,16,4,6,20,1,4,1,1,1,2,43,7,3,6;8,2,6,15,6,5,20,1,5,2,3,41,6,2,6;6,3,5,15,6,3,1,1,23,5,2,41,2,1,2,1,6;5,5,1,17,5,3,8,1,15,4,1,44,1,4,3;5,22,5,1,8,2,15,3,2,48,1;6,20,1,1,4,2,4,3,6,1,8,3,1,46;0,1,1,2,23,1,3,4,4,5,2,7,3,1,3,1,39;2,3,21,2,3,2,5,13,7,1,7,1,28;1,2,13,2,1,1,4,2,2,3,6,11,6,1,1,1,32;4,5,2,1,1,1,1,3,1,1,4,2,3,7,10,3,6,1,1,21,3,1,1;0,1,11,1,1,2,2,5,4,3,4,15,1,1,2,13,1,4,6;11,2,1,2,2,2,5,6,15,1,2,1,1,10,10;10,1,11,7,13,1,5,4,13;10,1,3,1,5,6,13,1,5,3,4,1,6;14,1,1,8,29;11,10,4,1,21;10,8,4,1,8,1,9;8,8,18;11,1,16;22;16;9;3';

var wrap = document.getElementById('globe');
var dataEl = document.getElementById('globe-data');
if (!wrap || !dataEl) return;
var data;
try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
var trips = data.trips || [];
if (!trips.length) return;

var stage = wrap.querySelector('.globe-stage');
var canvas = wrap.querySelector('canvas');
var photoBox = wrap.querySelector('.globe-photos');
var buttons = Array.prototype.slice.call(wrap.querySelectorAll('.globe-trips button'));
var ctx = canvas.getContext('2d');
var NAVY = '#0B3D6E';
var RED = '#B4262A';
var RAD = Math.PI / 180;
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function narrow() { return stage.clientWidth < 700; }

// Geometry -----------------------------------------------------------------

function vec(lat, lon) {
  var c = Math.cos(lat * RAD);
  return [c * Math.cos(lon * RAD), c * Math.sin(lon * RAD), Math.sin(lat * RAD)];
}
function slerp(a, b, t) {
  var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  var w = Math.acos(d), s = Math.sin(w);
  if (s < 1e-6) return a.slice();
  var p = Math.sin((1 - t) * w) / s, q = Math.sin(t * w) / s;
  return [a[0] * p + b[0] * q, a[1] * p + b[1] * q, a[2] * p + b[2] * q];
}

// Decode the land dots once into unit vectors.
var dots = (function () {
  var out = [];
  var rows = LAND.split(';');
  for (var i = 0; i < rows.length; i++) {
    var lat = -90 + LAND_STEP / 2 + i * LAND_STEP;
    var runs = rows[i].split(',');
    var n = 0, k;
    for (k = 0; k < runs.length; k++) n += +runs[k];
    var j = 0, land = false;
    for (k = 0; k < runs.length; k++) {
      var len = +runs[k];
      if (land) for (var m = 0; m < len; m++) out.push(vec(lat, -180 + (j + m + 0.5) * 360 / n));
      j += len; land = !land;
    }
  }
  return out;
})();

// View: the lon/lat facing the viewer. Rotate about the pole by -lon, then
// tilt about the screen's horizontal axis by -lat. After that, x points at the
// viewer, y to the right and z up.
var view = { lon: 0, lat: 0 };
var cl, sl, cp, sp;
function setRot() {
  cl = Math.cos(view.lon * RAD); sl = Math.sin(view.lon * RAD);
  cp = Math.cos(view.lat * RAD); sp = Math.sin(view.lat * RAD);
}
function rot(v) {
  var x1 = v[0] * cl + v[1] * sl, y1 = -v[0] * sl + v[1] * cl, z1 = v[2];
  return [x1 * cp + z1 * sp, y1, -x1 * sp + z1 * cp];
}

// Layout ---------------------------------------------------------------------

var W = 0, H = 0, R = 0, CX = 0, CY = 0, DPR = 1;
// The globe is drawn larger than the stage is tall, so it is cropped top and
// bottom: a closer view of the routes, with the rim still showing at the sides.
var ZOOM = 1.32;
// Extra zoom from the mouse wheel, 1 at the opening size.
var zoom = 1, ZOOM_MIN = 0.6, ZOOM_MAX = 4;
function radius() { return Math.round((narrow() ? Math.min(W - 24, 420) : 440) * ZOOM * zoom / 2); }
function layout() {
  W = stage.clientWidth;
  H = narrow() ? Math.round(W * 0.95) : 480;
  R = radius();
  CX = W / 2; CY = H / 2;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  // On narrow screens the photos sit under the canvas, so the stage grows with them.
  stage.style.height = narrow() ? '' : H + 'px';
  needs = true;
}

// Routes ---------------------------------------------------------------------

var places = data.places || {};
function placeVec(name) { var p = places[name]; return p ? vec(p[0], p[1]) : null; }

// Trips that share the same endpoints are bowed sideways, one to each side of
// the great circle, so every route stays its own line. All routes float a
// little above the surface.
var LIFT = 0.035, SPREAD = 0.12;
var groups = {};
trips.forEach(function (t) { var k = t.path.join('>'); groups[k] = (groups[k] || 0) + 1; });
var placed = {};
trips.forEach(function (t, i) {
  t.index = i;
  t.vecs = t.path.map(placeVec);
  var key = t.path.join('>'), n = groups[key], j = placed[key] || 0;
  placed[key] = j + 1;
  t.side = (j - (n - 1) / 2) * SPREAD;      // 0 for a lone route; ±SPREAD/2 for a pair
  t.samples = [];
  for (var s = 0; s + 1 < t.vecs.length; s++) {
    var a = t.vecs[s], b = t.vecs[s + 1], N = 72;
    // Unit normal of the great circle through a and b: the sideways direction.
    var nx = a[1] * b[2] - a[2] * b[1], ny = a[2] * b[0] - a[0] * b[2], nz = a[0] * b[1] - a[1] * b[0];
    var nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    for (var k = 0; k <= N; k++) {
      var u = k / N, p = slerp(a, b, u), w = Math.sin(Math.PI * u);
      var q = [p[0] + nx * t.side * w, p[1] + ny * t.side * w, p[2] + nz * t.side * w];
      var h = (1 + LIFT * w) / Math.hypot(q[0], q[1], q[2]);
      t.samples.push([q[0] * h, q[1] * h, q[2] * h]);
    }
  }
  t.mid = t.samples[Math.floor(t.samples.length / 2)];
  t.dest = t.vecs[t.vecs.length - 1];
});

// Center the opening view on all the routes together.
(function () {
  var c = [0, 0, 0];
  trips.forEach(function (t) { t.vecs.forEach(function (v) { c[0] += v[0]; c[1] += v[1]; c[2] += v[2]; }); });
  var n = Math.sqrt(c[0] * c[0] + c[1] * c[1] + c[2] * c[2]) || 1;
  view.lon = Math.atan2(c[1], c[0]) / RAD;
  view.lat = Math.asin(c[2] / n) / RAD;
  setRot();
})();

// Projection. Lifted points (|v| > 1) can be visible past the rim.
function proj(v) {
  var r = rot(v);
  return { x: CX + R * r[1], y: CY - R * r[2], d: r[0], vis: r[0] > 0 || (r[1] * r[1] + r[2] * r[2]) > 1 };
}

// Drawing --------------------------------------------------------------------

var hover = null, selected = null, needs = true, dashOffset = 0;
var FONT = 'Palatino, "Palatino Linotype", "Book Antiqua", serif';

function draw() {
  needs = false;
  setRot();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // Disc.
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.fillStyle = '#F6F8FB'; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = '#9FB0C4'; ctx.stroke();

  // Graticule, every 30°, front half only.
  var i, k, p, q, r;
  ctx.beginPath();
  for (i = -60; i <= 60; i += 30) line(function (u) { return vec(i, -180 + 360 * u); }, 120);
  for (i = 0; i < 360; i += 30) line(function (u) { return vec(-90 + 180 * u, i); }, 60);
  ctx.strokeStyle = 'rgba(11, 61, 110, 0.13)'; ctx.lineWidth = 0.7; ctx.stroke();

  // Land dots; smaller towards the rim so the sphere reads as a sphere.
  ctx.beginPath();
  // Dots grow with the globe, but slower, so a close view stays airy.
  var base = R / 165 * Math.pow(zoom, -0.3);
  for (i = 0; i < dots.length; i++) {
    r = rot(dots[i]);
    if (r[0] <= 0) continue;
    var rad = base * (0.45 + 0.55 * r[0]);
    var x = CX + R * r[1], y = CY - R * r[2];
    ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, Math.PI * 2);
  }
  ctx.fillStyle = NAVY; ctx.fill();

  // Routes: others faint, hovered/selected strong.
  for (i = 0; i < trips.length; i++) {
    var t = trips[i], on = (t === selected || t === hover);
    if (selected && !on) ctx.globalAlpha = 0.25;
    ctx.beginPath();
    var pen = false;
    for (k = 0; k < t.samples.length; k++) {
      p = proj(t.samples[k]);
      if (!p.vis) { pen = false; continue; }
      if (pen) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      pen = true;
    }
    ctx.lineWidth = on ? 2.4 : 1.4;
    ctx.strokeStyle = on ? RED : NAVY;
    ctx.setLineDash(t === selected && !reduceMotion ? [7, 5] : []);
    ctx.lineDashOffset = -dashOffset;
    ctx.stroke();
    ctx.setLineDash([]);
    arrowhead(t, on);
    ctx.globalAlpha = 1;
  }

  // Place markers and names.
  var drawn = {};
  ctx.font = '12px ' + FONT;
  ctx.textBaseline = 'middle';
  for (i = 0; i < trips.length; i++) {
    for (k = 0; k < trips[i].path.length; k++) {
      var name = trips[i].path[k];
      if (drawn[name]) continue;
      drawn[name] = true;
      q = proj(trips[i].vecs[k]);
      if (!q.vis) continue;
      ctx.beginPath(); ctx.arc(q.x, q.y, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = RED; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.fillStyle = '#1A1A1A';
      var left = q.x > CX + R * 0.55;
      ctx.textAlign = left ? 'right' : 'left';
      ctx.fillText(name, q.x + (left ? -8 : 8), q.y);
    }
  }

  // Name of the hovered or selected trip, at the top of its arc.
  var lab = hover || selected;
  if (lab) {
    p = proj(lab.mid);
    if (p.vis) {
      ctx.font = 'italic 13px ' + FONT;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      var tw = ctx.measureText(lab.label).width;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(p.x - tw / 2 - 5, p.y - 24, tw + 10, 18);
      ctx.fillStyle = RED;
      ctx.fillText(lab.label, p.x, p.y - 8);
    }
  }
  positionPhotos();
}

// Small triangle just short of the destination, pointing the way the trip went.
function arrowhead(t, on) {
  var n = t.samples.length, tip = proj(t.samples[n - 4]), back = proj(t.samples[n - 9]);
  if (!tip.vis || !back.vis) return;
  var dx = tip.x - back.x, dy = tip.y - back.y, L = Math.hypot(dx, dy) || 1;
  dx /= L; dy /= L;
  var s = on ? 9 : 7;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(tip.x - dx * s - dy * s * 0.45, tip.y - dy * s + dx * s * 0.45);
  ctx.lineTo(tip.x - dx * s + dy * s * 0.45, tip.y - dy * s - dx * s * 0.45);
  ctx.closePath();
  ctx.fillStyle = on ? RED : NAVY;
  ctx.fill();
}

function line(fn, n) {
  var pen = false;
  for (var k = 0; k <= n; k++) {
    var r = rot(fn(k / n));
    if (r[0] <= 0.001) { pen = false; continue; }
    var x = CX + R * r[1], y = CY - R * r[2];
    if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    pen = true;
  }
}

// Interaction ----------------------------------------------------------------

function hit(mx, my) {
  var best = null, bd = 9, i;
  for (i = 0; i < trips.length; i++) {
    var t = trips[i];
    for (var k = 0; k < t.samples.length; k += 2) {
      var p = proj(t.samples[k]);
      if (!p.vis) continue;
      var d = Math.hypot(p.x - mx, p.y - my);
      if (d < bd) { bd = d; best = t; }
    }
  }
  if (best) return best;
  // Markers: the first trip that ends there.
  for (i = 0; i < trips.length; i++) {
    var q = proj(trips[i].dest);
    if (q.vis && Math.hypot(q.x - mx, q.y - my) < 10) return trips[i];
  }
  return null;
}

var drag = null, idleSince = 0, tween = null;
function pos(e) { var b = canvas.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; }

// Zoom by a factor, keeping the point at (sx, sy) roughly where it is: the view
// centre slides a little towards it, so zooming in homes in on what the mouse
// or the fingers are over. Used by the wheel, pinch, double-tap and buttons.
function zoomAt(sx, sy, factor) {
  var next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * factor));
  if (next === zoom) return;
  setRot();
  var under = (sx == null) ? null : unproject(sx, sy);
  var f = 1 - zoom / next;
  zoom = next;
  R = radius();
  if (under && f > 0) {
    var c = slerp(vec(view.lat, view.lon), under, f);
    view.lon = Math.atan2(c[1], c[0]) / RAD;
    view.lat = Math.max(-80, Math.min(80, Math.asin(Math.max(-1, Math.min(1, c[2]))) / RAD));
  }
  tween = null;
  idleSince = performance.now();
  needs = true;
}
function unproject(sx, sy) {
  var y = (sx - CX) / R, z = (CY - sy) / R, x2 = 1 - y * y - z * z;
  if (x2 < 0) return null;
  var x = Math.sqrt(x2);
  // Undo the tilt, then the spin (inverse of rot).
  var x1 = x * cp - z * sp, z1 = x * sp + z * cp, y1 = y;
  return [x1 * cl - y1 * sl, x1 * sl + y1 * cl, z1];
}

// Pointers: the mouse or one finger turns the globe (or taps a route); two
// fingers pinch to zoom and drag to turn. The canvas has touch-action: none,
// so the browser never starts scrolling under a pinch; instead a one-finger
// swipe that begins mostly vertically scrolls the page from here. A quick
// double tap zooms in on that spot.
var pointers = {}, pinch = null, lastTap = null;
function count() { var n = 0; for (var k in pointers) n++; return n; }
function startDrag(m, e) {
  drag = { x: m.x, y: m.y, lon: view.lon, lat: view.lat, moved: false, mode: e && e.pointerType !== 'mouse' ? null : 'turn', lastY: e ? e.clientY : 0 };
}
function startPinch() {
  var ids = Object.keys(pointers), a = pointers[ids[0]], b = pointers[ids[1]];
  pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  drag = null;
  startDrag(pinch.mid);
  drag.moved = true;
}

canvas.addEventListener('pointerdown', function (e) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  var m = pos(e);
  pointers[e.pointerId] = m;
  canvas.setPointerCapture(e.pointerId);
  tween = null;
  if (count() >= 2) startPinch(); else startDrag(m, e);
});
canvas.addEventListener('pointermove', function (e) {
  var m = pos(e);
  if (pointers[e.pointerId]) pointers[e.pointerId] = m;
  if (pinch && count() >= 2) {
    var ids = Object.keys(pointers), a = pointers[ids[0]], b = pointers[ids[1]];
    var dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    var mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    if (Math.abs(dist / pinch.dist - 1) > 0.01) { zoomAt(mid.x, mid.y, dist / pinch.dist); pinch.dist = dist; }
    m = mid;
  }
  if (drag) {
    var dx = m.x - drag.x, dy = m.y - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (!drag.mode) {
      // A finger: wait to see which way it goes. Mostly vertical means the
      // reader wants the page, not the globe.
      if (Math.abs(dx) + Math.abs(dy) < 6) return;
      drag.mode = Math.abs(dy) > Math.abs(dx) * 1.2 ? 'scroll' : 'turn';
    }
    if (drag.mode === 'scroll') {
      window.scrollBy(0, drag.lastY - e.clientY);
      drag.lastY = e.clientY;
      return;
    }
    var k = 70 / R;
    view.lon = drag.lon - dx * k;
    view.lat = Math.max(-80, Math.min(80, drag.lat + dy * k));
    needs = true;
    return;
  }
  if (e.pointerType !== 'mouse') return;
  var h = hit(m.x, m.y);
  if (h !== hover) { hover = h; needs = true; }
  canvas.style.cursor = h ? 'pointer' : 'grab';
  idleSince = performance.now();
});
function release(e) {
  delete pointers[e.pointerId];
  if (pinch && count() < 2) {
    pinch = null;
    drag = null;
    for (var k in pointers) startDrag(pointers[k]);   // carry on turning with the finger that stays
    if (drag) { drag.moved = true; drag.mode = 'turn'; }
  }
}
canvas.addEventListener('pointerup', function (e) {
  release(e);
  if (!drag || count()) return;
  var moved = drag.moved; drag = null;
  idleSince = performance.now();
  if (moved) return;
  var m = pos(e), now = performance.now();
  if (lastTap && now - lastTap.t < 350 && Math.hypot(m.x - lastTap.x, m.y - lastTap.y) < 24) {
    lastTap = null;
    zoomAt(m.x, m.y, zoom >= ZOOM_MAX - 0.01 ? ZOOM_MIN / zoom : 1.6);
    return;
  }
  lastTap = { x: m.x, y: m.y, t: now };
  var h = hit(m.x, m.y);
  select(h === selected ? null : h);
});
canvas.addEventListener('pointercancel', function (e) { release(e); if (!count()) { drag = null; pinch = null; } });
// A pointer whose capture is lost without an up (e.g. the tab switching) must
// not linger, or the next pinch would count three fingers.
canvas.addEventListener('lostpointercapture', function (e) { if (pointers[e.pointerId]) { release(e); if (!count()) { drag = null; pinch = null; } } });

// Wheel over the globe zooms; outside the disc it scrolls the page as usual.
canvas.addEventListener('wheel', function (e) {
  var m = pos(e);
  if (Math.hypot(m.x - CX, m.y - CY) > R) return;
  e.preventDefault();
  var dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY;
  zoomAt(m.x, m.y, Math.exp(-dy * 0.0016));
}, { passive: false });

// The + / − buttons, for touch screens and anyone without a wheel.
Array.prototype.forEach.call(wrap.querySelectorAll('.globe-zoom button'), function (b) {
  b.addEventListener('click', function () { zoomAt(null, null, b.getAttribute('data-zoom') === 'in' ? 1.5 : 1 / 1.5); });
});
canvas.addEventListener('pointerleave', function () { if (hover) { hover = null; needs = true; } });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && selected) select(null); });

buttons.forEach(function (b) {
  b.addEventListener('click', function () {
    var t = trips[+b.getAttribute('data-trip')];
    select(t === selected ? null : t);
  });
});

function select(t) {
  selected = t;
  buttons.forEach(function (b) { b.classList.toggle('on', !!t && +b.getAttribute('data-trip') === t.index); });
  wrap.classList.toggle('has-photos', !!t);
  hover = null;
  if (t) {
    // Turn the globe so the whole route is in front, then let the photos out.
    var m = t.mid, n = Math.hypot(m[0], m[1], m[2]);
    var toLon = Math.atan2(m[1], m[0]) / RAD, toLat = Math.asin(m[2] / n) / RAD;
    var dLon = ((toLon - view.lon + 540) % 360) - 180;
    tween = { t0: performance.now(), dur: reduceMotion ? 0 : 650, lon0: view.lon, lat0: view.lat, lon1: view.lon + dLon, lat1: toLat };
    showPhotos(t);
  } else {
    hidePhotos();
    idleSince = performance.now();
  }
  needs = true;
}

// Floating photos ------------------------------------------------------------

var figs = [];
// Six slots: three down each side of the globe, alternating right and left so
// the first photos land nearest the top. [side, y fraction, tilt]
var SLOTS = [[1, 0.03, -3], [0, 0.05, 4], [1, 0.34, 2], [0, 0.36, -5], [1, 0.63, -4], [0, 0.61, 3]];

function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

function showPhotos(t) {
  hidePhotos(true);
  var list = (t.photos || []).slice(0, SLOTS.length);
  var d = proj(t.dest);
  if (!list.length) {
    var f = el('figure', 'gphoto gnote');
    var a = el('a'); a.href = t.href; a.textContent = data.noPhotos || 'No photos yet. Read the post →';
    f.appendChild(a);
    figs.push(place(f, 0, d));
  }
  list.forEach(function (ph, i) {
    var f = el('figure', 'gphoto');
    var a = el('a'); a.href = t.href; a.title = t.label;
    var img = el('img'); img.src = ph.url; img.alt = ph.caption || t.label;
    a.appendChild(img); f.appendChild(a);
    if (ph.caption) { var c = el('figcaption'); c.innerHTML = ph.caption; f.appendChild(c); }
    figs.push(place(f, i, d));
  });
  positionPhotos();
  // Two frames later, so the transition starts from the folded-up state.
  requestAnimationFrame(function () { requestAnimationFrame(function () { figs.forEach(function (f) { f.classList.add('in'); }); }); });
}
function place(f, i, d) {
  f._slot = i;
  f.style.setProperty('--r', SLOTS[i % SLOTS.length][2] + 'deg');
  f.style.setProperty('--x0', Math.round(d.x) + 'px'); f.style.setProperty('--y0', Math.round(d.y) + 'px');
  photoBox.appendChild(f);
  return f;
}
function positionPhotos() {
  if (!figs.length || narrow()) return;
  var d = selected ? proj(selected.dest) : null;
  figs.forEach(function (f) {
    var s = SLOTS[f._slot % SLOTS.length];
    var w = f.offsetWidth || 180;
    var side = Math.max(W / 2 - R - 28, 210);   // free width beside the globe (over it when zoomed in)
    var nudge = (f._slot % 3 === 1) ? 14 : 0;   // middle slot sits closer to the globe
    var x = s[0] ? W - side + (side - w) / 2 - nudge : (side - w) / 2 + nudge;
    var y = H * s[1];
    f.style.setProperty('--x', Math.round(x) + 'px'); f.style.setProperty('--y', Math.round(y) + 'px');
    if (d) { f.style.setProperty('--x0', Math.round(d.x) + 'px'); f.style.setProperty('--y0', Math.round(d.y) + 'px'); }
  });
}
function hidePhotos(now) {
  var old = figs; figs = [];
  old.forEach(function (f) {
    if (now || reduceMotion) { if (f.parentNode) f.parentNode.removeChild(f); return; }
    f.classList.remove('in'); f.classList.add('out');
    setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 450);
  });
}

// Loop -------------------------------------------------------------------------

var visible = true;
if ('IntersectionObserver' in window) {
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(stage);
}
function frame(now) {
  requestAnimationFrame(frame);
  if (!visible || document.hidden) return;
  if (tween) {
    var u = tween.dur ? Math.min(1, (now - tween.t0) / tween.dur) : 1;
    var e = 1 - Math.pow(1 - u, 3);
    view.lon = tween.lon0 + (tween.lon1 - tween.lon0) * e;
    view.lat = tween.lat0 + (tween.lat1 - tween.lat0) * e;
    if (u >= 1) tween = null;
    needs = true;
  } else if (!reduceMotion && !drag && !selected && !hover && now - idleSince > 1500) {
    view.lon += 0.04;
    needs = true;
  }
  if (selected && !reduceMotion) { dashOffset = (dashOffset + 0.35) % 12; needs = true; }
  if (needs) draw();
}
layout();
window.addEventListener('resize', function () { layout(); positionPhotos(); });
canvas.style.cursor = 'grab';
requestAnimationFrame(frame);
})();
