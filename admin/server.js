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
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']);

// Config / password ----------------------------------------------------------

function hash(pw, salt) { return crypto.createHash('sha256').update(salt + pw).digest('hex'); }

function loadConfig() {
  if (!fs.existsSync(CONFIG)) {
    const salt = crypto.randomBytes(8).toString('hex');
    const cfg = { host: '127.0.0.1', port: 8080, salt, passwordHash: hash('felab', salt) };
    fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
    console.log('Created admin/config.json with the initial password: felab');
    console.log('Change it in the admin page after logging in.');
    return cfg;
  }
  return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
}
let config = loadConfig();

function checkPassword(pw) {
  const a = Buffer.from(hash(pw, config.salt));
  const b = Buffer.from(config.passwordHash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function setPassword(pw) {
  config.salt = crypto.randomBytes(8).toString('hex');
  config.passwordHash = hash(pw, config.salt);
  fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2));
}

// Sessions ---------------------------------------------------------------------

const sessions = new Map();
function newSession() {
  const t = crypto.randomBytes(24).toString('hex');
  sessions.set(t, Date.now() + SESSION_TTL);
  return t;
}
function sessionOk(req) {
  const m = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '');
  if (!m) return false;
  const exp = sessions.get(m[1]);
  if (!exp || exp < Date.now()) { sessions.delete(m[1]); return false; }
  return true;
}
function sessionToken(req) {
  const m = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '');
  return m ? m[1] : null;
}

// Helpers ----------------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}
function json(res, code, obj) { send(res, code, JSON.stringify(obj), 'application/json; charset=utf-8'); }
function redirect(res, to, cookie) {
  const h = { Location: to };
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
  const allowed = rel.startsWith('/images/') ? IMAGE_EXT.has(ext) : (ext === '.html' || ext === '.css');
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

  if (p === '/admin/login') {
    if (req.method === 'GET') return send(res, 200, loginPage(''), 'text/html; charset=utf-8');
    const body = new URLSearchParams((await readBody(req)).toString());
    if (checkPassword(body.get('password') || '')) {
      return redirect(res, '/admin', `sid=${newSession()}; HttpOnly; SameSite=Strict; Path=/`);
    }
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
    if (String(d.next || '').length < 4) return json(res, 400, { error: 'new password must be at least 4 characters' });
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
  console.log('Press Ctrl+C to stop.');
});
