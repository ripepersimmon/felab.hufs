// Local admin server for the lab site. No external packages.
// Run:  node admin/server.js   then open http://127.0.0.1:8080/admin
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { build } = require('../build.js');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'site.json');
const CONFIG = path.join(__dirname, 'config.json');
const ADMIN_HTML = path.join(__dirname, 'admin.html');
const IMAGES = path.join(ROOT, 'images');

const MAX_BODY = 8 * 1024 * 1024;
const SESSION_TTL = 12 * 60 * 60 * 1000;
const MIN_PASSWORD = 8;
const DEFAULT_PASSWORD = 'felab';
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']);
// Files the preview may serve from the site root: pages, styles, the globe
// script, and the generated favicon, sitemap, feed and BibTeX. admin/ and
// data/ stay blocked by the path checks in serveStatic.
const ROOT_EXT = new Set(['.html', '.css', '.js', '.ico', '.xml', '.txt', '.bib']);

// Config / password ----------------------------------------------------------

// scrypt is slow on purpose, so a leaked config.json cannot be brute-forced
// quickly. Configs written by earlier versions hold a plain SHA-256 and are
// upgraded the first time their password is used.
function hash(pw, salt) { return crypto.scryptSync(pw, salt, 32).toString('hex'); }
function legacyHash(pw, salt) { return crypto.createHash('sha256').update(salt + pw).digest('hex'); }

function saveConfig() { fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2)); }

function loadConfig() {
  if (!fs.existsSync(CONFIG)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const cfg = { host: '127.0.0.1', port: 8080, salt, passwordHash: hash(DEFAULT_PASSWORD, salt), kdf: 'scrypt' };
    fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
    console.log(`Created admin/config.json with the initial password: ${DEFAULT_PASSWORD}`);
    console.log('Change it in the admin page after logging in.');
    return cfg;
  }
  return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
}
let config = loadConfig();

function checkPassword(pw) {
  const legacy = config.kdf !== 'scrypt';
  const a = Buffer.from((legacy ? legacyHash : hash)(pw, config.salt));
  const b = Buffer.from(config.passwordHash);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (ok && legacy) setPassword(pw);
  return ok;
}

function setPassword(pw) {
  config.salt = crypto.randomBytes(16).toString('hex');
  config.passwordHash = hash(pw, config.salt);
  config.kdf = 'scrypt';
  saveConfig();
}

// Wrong guesses are slowed down: a short pause after each, and a lockout after
// several in a row. The server only listens locally, but a page open in the
// same browser could otherwise try passwords as fast as it likes.
const login = { failures: 0, lockedUntil: 0 };
const LOCK_AFTER = 5, LOCK_MS = 60 * 1000;
function loginLocked() { return login.lockedUntil > Date.now(); }
function noteLogin(ok) {
  if (ok) { login.failures = 0; return; }
  login.failures++;
  if (login.failures >= LOCK_AFTER) { login.failures = 0; login.lockedUntil = Date.now() + LOCK_MS; }
}

// Sessions ---------------------------------------------------------------------

const sessions = new Map();
function newSession() {
  for (const [t, exp] of sessions) if (exp < Date.now()) sessions.delete(t);
  const t = crypto.randomBytes(24).toString('hex');
  sessions.set(t, Date.now() + SESSION_TTL);
  return t;
}
function sessionToken(req) {
  const m = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '');
  return m ? m[1] : null;
}
function sessionOk(req) {
  const t = sessionToken(req);
  const exp = t && sessions.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}

// Request origin ---------------------------------------------------------------

// The server is reachable only from this machine, but a browser on this
// machine can be pointed at it from anywhere: by a hostname an attacker made
// resolve to 127.0.0.1 (DNS rebinding), or by a page on another local port
// (a dev server) posting to it. Both are refused here: the Host header must
// name this server, and a POST must come from this origin, as JSON.
function ownOrigin(req) {
  const host = String(req.headers.host || '').toLowerCase();
  const name = host.replace(/:\d+$/, '');
  const port = (host.match(/:(\d+)$/) || [])[1] || '80';
  return ['127.0.0.1', 'localhost', '[::1]', config.host].includes(name) && Number(port) === config.port;
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin fetch()/forms may omit it; cross-site browsers never do
  const m = /^https?:\/\/([^/]+)$/i.exec(origin);
  return !!m && m[1].toLowerCase() === String(req.headers.host || '').toLowerCase();
}
function isJson(req) { return /^application\/json\b/i.test(req.headers['content-type'] || ''); }

// Helpers ----------------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.bib': 'text/plain; charset=utf-8',
};

const BASE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  // Not "no-referrer": under that policy browsers send "Origin: null" even on
  // same-origin POSTs, which sameOrigin() below would refuse.
  'Referrer-Policy': 'same-origin',
};

function send(res, code, body, type) {
  res.writeHead(code, { ...BASE_HEADERS, 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}
function json(res, code, obj) { send(res, code, JSON.stringify(obj), 'application/json; charset=utf-8'); }
function redirect(res, to, cookie) {
  const h = { ...BASE_HEADERS, Location: to };
  if (cookie) h['Set-Cookie'] = cookie;
  res.writeHead(302, h); res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new Error('body too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function loginPage(msg) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>Admin login</title>
<link rel="stylesheet" href="/style.css"><style>
.login{max-width:360px;margin:80px auto;padding:0 24px}.login input{width:100%;box-sizing:border-box;padding:8px;font:inherit;border:1px solid #999;margin:8px 0 14px}
.login button{font:inherit;padding:8px 18px;background:#0B3D6E;color:#fff;border:none;cursor:pointer}.err{color:#A00}
</style></head><body><div class="login"><h2 style="text-transform:none;letter-spacing:0;color:#1A1A1A;font-size:1.4em">Financial Engineering Lab. &middot; Admin</h2>
${msg ? `<p class="err">${msg}</p>` : ''}
<form method="post" action="/admin/login"><label>Password<input type="password" name="password" autofocus></label><button type="submit">Log in</button></form></div></body></html>`;
}

function validateData(d) {
  const need = ['site', 'professor', 'members', 'research', 'projects', 'publications', 'courses', 'news'];
  for (const k of need) if (!(k in d)) return `missing "${k}"`;
  for (const k of ['members', 'research', 'projects', 'publications', 'courses', 'news']) if (!Array.isArray(d[k])) return `"${k}" must be a list`;
  for (const n of d.news) if (!/^\d{4}-\d{2}$/.test(n.date || '')) return `news date must be YYYY-MM (got "${n.date}")`;
  for (const p of (d.blog || [])) if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || '')) return `blog date must be YYYY-MM-DD (got "${p.date}")`;
  for (const p of d.publications) if (!p.title) return 'a publication has no title';
  return null;
}

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === '/') rel = '/index.html';
  const ext = path.extname(rel).toLowerCase();
  const allowed = rel.startsWith('/images/') ? IMAGE_EXT.has(ext)
    : rel.startsWith('/blog/') ? ext === '.html'
    : ROOT_EXT.has(ext);
  const file = path.normalize(path.join(ROOT, rel));
  if (!allowed || !file.startsWith(ROOT + path.sep) || file.includes(path.sep + 'admin' + path.sep) || file.includes(path.sep + 'data' + path.sep)) {
    return send(res, 404, 'Not found');
  }
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, buf, MIME[ext] || 'application/octet-stream');
  });
}

// Router -----------------------------------------------------------------------

async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (!ownOrigin(req)) return send(res, 421, 'Wrong host');
  if (req.method === 'POST' && !sameOrigin(req)) return send(res, 403, 'Cross-origin request refused');
  if (req.method === 'POST' && p.startsWith('/api/') && !isJson(req)) return json(res, 415, { error: 'expected application/json' });

  if (p === '/admin/login') {
    if (req.method === 'GET') return send(res, 200, loginPage(''), 'text/html; charset=utf-8');
    if (loginLocked()) return send(res, 429, loginPage('Too many attempts. Try again in a minute.'), 'text/html; charset=utf-8');
    const body = new URLSearchParams((await readBody(req)).toString());
    const ok = checkPassword(body.get('password') || '');
    noteLogin(ok);
    if (ok) return redirect(res, '/admin', `sid=${newSession()}; HttpOnly; SameSite=Strict; Path=/`);
    await new Promise(r => setTimeout(r, 1000));
    return send(res, 401, loginPage('Wrong password.'), 'text/html; charset=utf-8');
  }
  if (p === '/admin/logout') {
    const t = sessionToken(req); if (t) sessions.delete(t);
    return redirect(res, '/admin/login', 'sid=; Max-Age=0; Path=/');
  }

  const isAdmin = p === '/admin' || p === '/admin/' || p.startsWith('/api/');
  if (isAdmin && !sessionOk(req)) {
    if (p.startsWith('/api/')) return json(res, 401, { error: 'not logged in' });
    return redirect(res, '/admin/login');
  }

  if (p === '/admin' || p === '/admin/') {
    return send(res, 200, fs.readFileSync(ADMIN_HTML), 'text/html; charset=utf-8');
  }
  if (p === '/api/data' && req.method === 'GET') {
    return send(res, 200, fs.readFileSync(DATA), 'application/json; charset=utf-8');
  }
  if (p === '/api/data' && req.method === 'POST') {
    let d;
    try { d = JSON.parse((await readBody(req)).toString('utf8')); } catch (e) { return json(res, 400, { error: 'invalid JSON' }); }
    const err = validateData(d);
    if (err) return json(res, 400, { error: err });
    fs.copyFileSync(DATA, DATA + '.bak');
    fs.writeFileSync(DATA, JSON.stringify(d, null, 2) + '\n', 'utf8');
    try { build(); } catch (e) { return json(res, 500, { error: 'build failed: ' + e.message }); }
    return json(res, 200, { ok: true });
  }
  if (p === '/api/upload' && req.method === 'POST') {
    let d;
    try { d = JSON.parse((await readBody(req)).toString('utf8')); } catch (e) { return json(res, 400, { error: 'invalid JSON' }); }
    const name = String(d.name || '').toLowerCase().replace(/[^a-z0-9._-]/g, '');
    const ext = path.extname(name);
    if (!name || !IMAGE_EXT.has(ext)) return json(res, 400, { error: 'image files only (jpg, png, gif, svg, webp)' });
    const buf = Buffer.from(String(d.data || ''), 'base64');
    if (!buf.length || buf.length > 5 * 1024 * 1024) return json(res, 400, { error: 'file must be under 5 MB' });
    const folder = String(d.folder || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20);
    const dir = folder ? path.join(IMAGES, folder) : IMAGES;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buf);
    return json(res, 200, { ok: true, path: 'images/' + (folder ? folder + '/' : '') + name });
  }
  if (p === '/api/password' && req.method === 'POST') {
    let d;
    try { d = JSON.parse((await readBody(req)).toString('utf8')); } catch (e) { return json(res, 400, { error: 'invalid JSON' }); }
    if (!checkPassword(String(d.current || ''))) return json(res, 403, { error: 'current password is wrong' });
    if (String(d.next || '').length < MIN_PASSWORD) return json(res, 400, { error: `new password must be at least ${MIN_PASSWORD} characters` });
    if (String(d.next) === DEFAULT_PASSWORD) return json(res, 400, { error: 'choose a password other than the initial one' });
    setPassword(String(d.next));
    return json(res, 200, { ok: true });
  }
  if (p === '/api/fetch-courses' && req.method === 'POST') {
    try {
      const { updateSite } = require('../fetch-courses.js');
      const courses = await updateSite();
      return json(res, 200, { ok: true, count: courses.length, courses });
    } catch (e) { return json(res, 500, { error: e.message }); }
  }
  if (p === '/api/fetch-citations' && req.method === 'POST') {
    try {
      const { updateSite } = require('../fetch-citations.js');
      const r = await updateSite();
      const total = Object.values(r.works).reduce((n, w) => n + w.count, 0);
      build();
      return json(res, 200, { ok: true, found: r.found, missing: r.missing, total });
    } catch (e) { return json(res, 500, { error: e.message }); }
  }
  if (p === '/api/build' && req.method === 'POST') {
    try { build(); } catch (e) { return json(res, 500, { error: e.message }); }
    return json(res, 200, { ok: true });
  }

  if (req.method === 'GET') return serveStatic(req, res, p);
  send(res, 405, 'Method not allowed');
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(e => { console.error(e); try { send(res, 500, 'Server error'); } catch (_) {} });
});

server.listen(config.port, config.host, () => {
  console.log(`Site preview:  http://${config.host}:${config.port}/`);
  console.log(`Admin page:    http://${config.host}:${config.port}/admin`);
  if (checkPassword(DEFAULT_PASSWORD)) {
    console.log(`WARNING: the admin password is still the initial "${DEFAULT_PASSWORD}". Change it in the Password tab.`);
  }
  console.log('Press Ctrl+C to stop.');
});
