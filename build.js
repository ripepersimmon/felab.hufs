// Generates the static HTML pages from data/site.json.
// Run:  node build.js
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data', 'site.json');

const MENU = [
  ['index.html', 'Home'],
  ['team.html', 'Team'],
  ['research.html', 'Research'],
  ['projects.html', 'Projects'],
  ['publications.html', 'Publications'],
  ['courses.html', 'Courses'],
  ['news.html', 'News'],
];

const EXT_ICON = '<svg class="ext" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// Short hash of a file so browsers fetch a fresh copy whenever it changes. The
// style.css hash is recomputed at the start of every build(), since the admin
// server keeps one process running across many builds.
let CSS_VERSION = '';
function fileVersion(file) {
  try {
    return require('crypto').createHash('sha1').update(fs.readFileSync(path.join(ROOT, file))).digest('hex').slice(0, 8);
  } catch (e) { return String(Date.now()); }
}

const esc = s => String(s == null ? '' : s)
  .replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LINK_ICONS = {
  linkedin: '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="LinkedIn"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
  github: '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="GitHub"><path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/></svg>',
  scholar: '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="Google Scholar"><path fill="currentColor" d="M12 2 1 9l11 7 9-5.7V17h2V9L12 2zm0 16.5L5.5 14.4v4.3c0 1.8 3 3.3 6.5 3.3s6.5-1.5 6.5-3.3v-4.3L12 18.5z"/></svg>',
  website: '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="Website"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15.5 15.5 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4zM4.3 14a8 8 0 0 1 0-4h3.4a16 16 0 0 0 0 4H4.3zm.8 2h3a15.5 15.5 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.4-3.6C8.9 5.5 8.4 6.7 8.1 8zM12 20c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4zm2.3-6H9.7a14 14 0 0 1 0-4h4.6a14 14 0 0 1 0 4zm.2 5.6c.6-1.1 1.1-2.3 1.4-3.6h3a8 8 0 0 1-4.4 3.6zm1.8-5.6a16 16 0 0 0 0-4h3.4a8 8 0 0 1 0 4h-3.4z"/></svg>',
};

const LINK_NAMES = { linkedin: 'LinkedIn', github: 'GitHub', scholar: 'Google Scholar', website: 'Website' };

function linksHtml(links) {
  if (!links || !links.length) return '';
  const a = links.map(l => {
    const icon = LINK_ICONS[l.type] || LINK_ICONS.website;
    const title = LINK_NAMES[l.type] || 'Link';
    return `<a href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(title)}">${icon}</a>`;
  }).join('');
  return `<p class="links">${a}</p>`;
}

// Absolute URL for a site-relative path. Everything that has to be absolute
// (canonical, og:url, sitemap, feed) goes through here, so moving the site to
// another domain is a one-line change to site.url.
function abs(site, rel) {
  const base = String(site.url || '').replace(/\/+$/, '');
  return base + '/' + String(rel || '').replace(/^\/+/, '');
}

// One-line summary for search results and link previews.
function metaDesc(text, limit = 200) {
  // stripTags turns each tag into a space, which can leave " ," where a link
  // ended mid-sentence.
  const t = stripTags(text).replace(/\s+([,.;:)])/g, '$1').replace(/\(\s+/g, '(');
  return t.length > limit ? t.slice(0, limit - 1).replace(/\s+\S*$/, '') + '…' : t;
}

function head(site, pageTitle, opts) {
  const o = opts || {};
  const baseHref = o.base;
  const docTitle = o.docTitle;
  const t = docTitle ? `${docTitle} — ${site.title}` : pageTitle ? `${pageTitle} — ${site.title}, ${site.titleSuffix}` : `${site.title} — ${site.titleSuffix}`;
  const desc = metaDesc(o.desc || '');
  const path = o.path || 'index.html';
  const canonical = site.url ? abs(site, path) : '';
  const image = site.url ? abs(site, o.image || site.ogImage || 'images/og.png') : '';
  const meta = [];
  if (desc) meta.push(`<meta name="description" content="${esc(desc)}">`);
  if (canonical) meta.push(`<link rel="canonical" href="${esc(canonical)}">`);
  meta.push(`<meta property="og:type" content="${o.type || 'website'}">`);
  meta.push(`<meta property="og:site_name" content="${esc(site.title)}">`);
  meta.push(`<meta property="og:title" content="${esc(docTitle || t)}">`);
  if (desc) meta.push(`<meta property="og:description" content="${esc(desc)}">`);
  if (canonical) meta.push(`<meta property="og:url" content="${esc(canonical)}">`);
  if (image) meta.push(`<meta property="og:image" content="${esc(image)}">`);
  meta.push(`<meta name="twitter:card" content="summary_large_image">`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${baseHref ? `<base href="${baseHref}">
` : ""}<title>${t}</title>
${meta.join('\n')}
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="images/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="images/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="${esc(site.title)} — ${esc(blogLabel(site))}" href="feed.xml">
<link rel="stylesheet" href="style.css?v=${CSS_VERSION}">
${o.style ? `<style>
${o.style}</style>
` : ''}</head>
<body>
<div id="wrapper">
\t<div id="header">
\t\t<h1><a href="index.html">${site.title}</a></h1>
\t\t<p>${site.subtitle}</p>
\t</div>
\t<div id="menu">
\t\t<ul>
${MENU.map(([f, l]) => `\t\t\t<li${f === (pageTitle ? pageTitle.toLowerCase() + '.html' : 'index.html') ? ' class="current_page_item"' : ''}><a href="${f}">${l}</a></li>`).join('\n')}
${blogMenuItem(site, pageTitle)}
\t\t</ul>
\t</div>
`;
}

const blogLabel = site => (site.blog && site.blog.label) || 'Blog';

function blogMenuItem(site, pageTitle) {
  const b = site.blog || {};
  if (b.enabled === false) return '';
  const label = blogLabel(site);
  if (b.external) {
    return `\t\t\t<li class="menu-right"><a href="${esc(b.external)}" target="_blank" rel="noopener">${esc(label)} ${EXT_ICON}</a></li>`;
  }
  const cur = pageTitle === 'Blog' ? ' current_page_item' : '';
  return `\t\t\t<li class="menu-right${cur}"><a href="blog.html">${esc(label)} ${EXT_ICON}</a></li>`;
}

function foot(site) {
  const f = site.footer;
  return `
\t<div id="footer">
\t\t<div class="footer-logo"><a href="${esc(f.logoUrl)}" target="_blank" rel="noopener"><img src="${esc(f.logo)}" alt="Hankuk University of Foreign Studies"></a></div>
\t\t<div class="footer-text">
\t\t\t<p>${f.lines.join('<br>\n\t\t\t')}<br>
\t\t\tEmail. <a href="mailto:${esc(f.email)}">${esc(f.email)}</a></p>
\t\t\t<p>${f.copyright}${f.webmaster ? `<br>\n\t\t\tWebmaster. <a href="mailto:${esc(f.webmaster)}">${esc(f.webmaster)}</a>${f.webmasterName ? ` (${esc(f.webmasterName)})` : ''}` : ''}</p>
\t\t</div>
\t</div>
</div>
</body>
</html>
`;
}

// Publications -------------------------------------------------------------

function authorsHtml(authors, data) {
  const director = data.professor.name.trim();
  const members = new Set(data.members.map(m => m.name.trim()));
  return authors.split(',').map(raw => {
    let n = raw.trim();
    if (!n) return '';
    let corr = false;
    if (/[†*]$/.test(n)) { corr = true; n = n.slice(0, -1).trim(); }
    let h = esc(n);
    if (n === director) h = `<b>${h}</b>`;
    else if (members.has(n)) h = `<u>${h}</u>`;
    return h + (corr ? '&dagger;' : '');
  }).filter(Boolean).join(', ');
}

// DOI and arXiv id of a publication, from its links. Citation lookups and the
// BibTeX entry both key off these.
function pubIds(p) {
  const urls = (p.links || []).map(l => l.url);
  const find = re => urls.map(u => (u.match(re) || [])[1]).find(Boolean);
  return { doi: find(/doi\.org\/(.+)$/), arxiv: find(/arxiv\.org\/(?:abs|pdf)\/([\d.]+)/) };
}

// Citation counts come from data/citations.json, refreshed by fetch-citations.js.
// The file is optional: with no file, publications simply show no count.
function citeCount(p, cites) {
  const { doi, arxiv } = pubIds(p);
  const key = doi || arxiv;
  if (!key || !cites) return null;
  const e = cites[key.toLowerCase()];
  return e && e.count > 0 ? e : null;
}

function pubLi(p, data, cites) {
  const venue = p.type === 'thesis' ? p.venue : `<i>${p.venue}</i>`;
  const note = p.note ? ` (${p.note})` : '';
  const links = (p.links || []).map(l => ` [<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || 'paper')}</a>]`).join('');
  const c = citeCount(p, cites);
  const cited = c ? ` <span class="cited">Cited by <a href="${esc(c.url)}" target="_blank" rel="noopener">${c.count}</a></span>` : '';
  const bib = `<details class="bib"><summary>bib</summary><pre>${esc(bibEntry(p))}</pre></details>`;
  return `<li>${authorsHtml(p.authors, data)} (${p.year}). ${p.title}. ${venue}${note}.${links}${cited}${bib}</li>`;
}

const LEGEND = '<p class="legend"><b>Bold</b>: lab director &middot; <u>Underlined</u>: lab members &middot; &dagger;: corresponding author</p>';

// Underlines lab member names wherever they appear in a piece of hand-written
// HTML (News entries). Only text between tags is touched, so names inside an
// href or an attribute are left alone, and a name already inside <u> is not
// wrapped twice.
function markMembers(html, data) {
  const names = data.members.map(m => m.name.trim()).filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (!names.length) return html;
  const re = new RegExp('(?<![\\w-])(' + names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\w-])', 'g');
  let depth = 0;
  return String(html).split(/(<[^>]+>)/).map(seg => {
    if (seg.startsWith('<')) {
      if (/^<u[\s>]/i.test(seg)) depth++;
      else if (/^<\/u\s*>/i.test(seg)) depth = Math.max(0, depth - 1);
      return seg;
    }
    return depth > 0 ? seg : seg.replace(re, '<u>$1</u>');
  }).join('');
}

// BibTeX -------------------------------------------------------------------

function lastName(author) {
  const n = author.trim().replace(/[†*]$/, '').trim();
  const parts = n.split(/\s+/);
  return parts[parts.length - 1] || n;
}

function bibKey(p) {
  const authors = p.authors.split(',');
  const first = lastName(authors[0] || 'anon').toLowerCase().replace(/[^a-z]/g, '');
  const STOP = ['with', 'from', 'under', 'using', 'their', 'into', 'when', 'that', 'this',
    'have', 'does', 'keep', 'your', 'about', 'what', 'which', 'where', 'only', 'more',
    'such', 'than', 'then', 'they', 'them', 'been', 'were', 'will', 'some', 'toward'];
  const word = (stripTags(p.title).toLowerCase().match(/[a-z]{4,}/g) || ['work'])
    .find(w => !STOP.includes(w)) || 'work';
  return `${first}${p.year}${word}`;
}

// "Family, Given" is the unambiguous BibTeX form: it tells the style which
// part is the surname instead of leaving it to guess from the last word.
function bibName(author) {
  const n = author.trim().replace(/[†*]$/, '').trim();
  const parts = n.split(/\s+/);
  if (parts.length < 2) return n;
  const family = parts[parts.length - 1];
  return `${family}, ${parts.slice(0, -1).join(' ')}`;
}

function bibEntry(p) {
  const authors = p.authors.split(',').map(a => a.trim()).filter(Boolean).map(bibName).join(' and ');
  const { doi, arxiv } = pubIds(p);
  const f = [['author', authors], ['title', stripTags(p.title)], ['year', String(p.year)]];
  let type;
  if (p.type === 'journal') { type = 'article'; f.push(['journal', p.venue]); }
  else if (p.type === 'conference') { type = 'inproceedings'; f.push(['booktitle', p.venue]); }
  else if (p.type === 'thesis') {
    type = /ph\.?d/i.test(p.venue) ? 'phdthesis' : 'mastersthesis';
    const m = p.venue.match(/,\s*([^,]+)$/);
    f.push(['school', m ? m[1].trim() : p.venue]);
  } else {
    type = 'misc';
    if (arxiv) f.push(['eprint', arxiv], ['archivePrefix', 'arXiv'], ['howpublished', 'arXiv preprint']);
    else f.push(['howpublished', p.venue]);
  }
  if (doi) f.push(['doi', doi]);
  const used = f.filter(([, v]) => v);
  const pad = Math.max(...used.map(([k]) => k.length));
  const body = used.map(([k, v]) => `  ${k.padEnd(pad)} = {${String(v).replace(/&amp;/g, '&')}}`).join(',\n');
  return `@${type}{${bibKey(p)},\n${body}\n}`;
}

function bibFile(data) {
  const header = `% BibTeX entries for publications of the ${stripTags(data.site.title)}\n% ${data.site.url || ''}\n\n`;
  return header + data.publications.map(bibEntry).join('\n\n') + '\n';
}

// News ---------------------------------------------------------------------

function monthShort(d) { const [y, m] = d.split('-'); return `${(MONTHS[+m - 1] || m).slice(0, 3)} ${y}`; }

// Pages --------------------------------------------------------------------

function pageIndex(data) {
  const s = data.site;
  const selected = data.publications.filter(p => p.selected);
  const recent = data.news.slice(0, s.recentCount || 3);
  let h = head(s, '', { desc: s.about[0], path: 'index.html' });
  h += `
\t<div class="columns">
\t\t<div class="main">
`;
  if (s.notice && s.notice.enabled && s.notice.html) {
    h += `\t\t\t<div class="notice">\n\t\t\t\t${s.notice.html}\n\t\t\t</div>\n`;
  }
  h += `\t\t\t<div class="section">
\t\t\t\t<h2>About</h2>
${s.about.map((p, i) => `\t\t\t\t<p${i === 0 ? ' class="lead"' : ''}>${p}</p>`).join('\n')}
\t\t\t</div>

\t\t\t<div class="section">
\t\t\t\t<h2>Selected Publications</h2>
\t\t\t\t${LEGEND}
\t\t\t\t<ul class="pub-list">
${selected.map(p => '\t\t\t\t\t' + pubLi(p, data)).join('\n')}
\t\t\t\t</ul>
\t\t\t\t<p><a href="publications.html">All publications</a></p>
\t\t\t</div>
\t\t</div>

\t\t<div class="side">
\t\t\t<div class="section">
\t\t\t\t<h2>Contact</h2>
\t\t\t\t<p>${esc(s.contact.name)}<br>
\t\t\t\t<a href="mailto:${esc(s.contact.email)}">${esc(s.contact.email)}</a></p>
\t\t\t\t<p>${s.contact.lines.join('<br>\n\t\t\t\t')}</p>
\t\t\t</div>
\t\t\t<div class="section">
\t\t\t\t<h2>Recent</h2>
${recent.map(n => `\t\t\t\t<p>${monthShort(n.date)} &mdash; ${markMembers(n.short || n.text, data)}</p>`).join('\n')}
\t\t\t\t<p><a href="news.html">More news</a></p>
\t\t\t</div>
\t\t</div>
\t</div>
`;
  return h + foot(s);
}

function personCard(p, small) {
  const photo = p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}">` : '';
  const H = small ? 'h4' : 'h3';
  const lines = [];
  if (small) {
    if (p.role || p.period) {
      const role = p.role ? esc(p.role) : '';
      const period = p.period ? `<span class="period">${esc(p.period)}</span>` : '';
      lines.push(`<p>${[role, period].filter(Boolean).join(', ')}</p>`);
    }
    if (p.interests) lines.push(`<p>Interests: ${esc(p.interests)}</p>`);
  } else {
    (p.lines || []).forEach(l => lines.push(`<p>${l}</p>`));
  }
  if (p.email) lines.push(`<p>Email: <a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>`);
  const links = linksHtml(p.links);
  if (links) lines.push(links);
  const ind = small ? '\t\t\t\t' : '\t\t\t';
  return `${ind}<div class="person${small ? ' small' : ''}">
${ind}\t<div class="photo">${photo}</div>
${ind}\t<div class="bio">
${ind}\t\t<${H}>${esc(p.name)}${p.korean ? ` (${esc(p.korean)})` : ''}</${H}>
${lines.map(l => `${ind}\t\t${l}`).join('\n')}
${ind}\t</div>
${ind}</div>`;
}

function pageTeam(data) {
  const s = data.site;
  const names = [data.professor.name].concat(data.members.map(m => m.name)).join(', ');
  let h = head(s, 'Team', { desc: `Members of the ${stripTags(s.title)} at ${stripTags(s.titleSuffix)}: ${names}.`, path: 'team.html' });
  h += `
\t<div class="section">
\t\t<h2>Professor</h2>
${personCard(data.professor, false)}

\t\t<h3 id="join">Joining the Lab</h3>
\t\t<p>${data.joining}</p>
\t</div>
`;
  // group members preserving first-seen group order
  const groups = [];
  for (const m of data.members) {
    const g = m.group || 'Members';
    let e = groups.find(x => x.name === g);
    if (!e) { e = { name: g, items: [] }; groups.push(e); }
    e.items.push(m);
  }
  if (groups.length) {
    h += `
\t<div class="section">
\t\t<h2>Members</h2>
`;
    for (const g of groups) {
      h += `
\t\t<h3>${esc(g.name)}</h3>
\t\t<div class="member-grid">
${g.items.map(m => personCard(m, true)).join('\n')}
\t\t</div>
`;
    }
    h += `\t</div>\n`;
  }
  return h + foot(s);
}

function pageResearch(data) {
  const s = data.site;
  let h = head(s, 'Research', { desc: `Research areas of the ${stripTags(s.title)}: ${data.research.map(r => stripTags(r.title)).join(', ')}.`, path: 'research.html' });
  h += `
\t<div class="section">
\t\t<h2>Research Areas</h2>
${data.research.map(r => `\n\t\t<h3>${r.title}</h3>\n\t\t<p>${r.text}</p>`).join('\n')}
\t</div>
`;
  const ongoing = (data.ongoing || []).filter(Boolean);
  if (ongoing.length) {
    h += `
\t<div class="section">
\t\t<h2>Ongoing Research</h2>
\t\t<ul>
${ongoing.map(t => `\t\t\t<li>${t}</li>`).join('\n')}
\t\t</ul>
\t</div>
`;
  }
  return h + foot(s);
}

function pageProjects(data) {
  const s = data.site;
  let h = head(s, 'Projects', { desc: `Funded research projects of the ${stripTags(s.title)}, with sponsors including ${[...new Set(data.projects.map(p => stripTags(p.sponsor)))].slice(0, 4).join(', ')}.`, path: 'projects.html' });
  h += `
\t<div class="section">
\t\t<h2>Projects</h2>
\t\t<dl class="projects">
${data.projects.map(p => `\t\t\t<dt>${p.title} <span>${p.sponsor}${p.period ? ', ' + p.period : ''}</span></dt>\n\t\t\t<dd>${p.description}</dd>`).join('\n\n')}
\t\t</dl>
\t</div>
`;
  return h + foot(s);
}

function pagePublications(data) {
  const s = data.site;
  const pubs = data.publications.filter(p => p.type !== 'thesis');
  const theses = data.publications.filter(p => p.type === 'thesis');
  const years = [...new Set(pubs.map(p => p.year))].sort((a, b) => b - a);
  const cites = data.citations;
  const total = data.publications.reduce((n, p) => n + ((citeCount(p, cites) || {}).count || 0), 0);
  let h = head(s, 'Publications', {
    desc: `Publications of the ${stripTags(s.title)}, published in ${[...new Set(pubs.map(p => stripTags(p.venue)))].slice(0, 4).join(', ')}.`,
    path: 'publications.html',
  });
  h += `
\t<div class="section">
\t\t<h2>Publications</h2>
\t\t${LEGEND}
\t\t<p class="pub-tools"><span class="jump">${years.map(y => `<a href="#y${y}">${y}</a>`).join(' ')}${theses.length ? ' <a href="#thesis">Thesis</a>' : ''}</span><span class="pub-stats">${total ? `${total} citations &middot; ` : ''}<a href="felab.bib">Download all as BibTeX</a></span></p>
`;
  for (const y of years) {
    h += `
\t\t<h3 class="year-heading" id="y${y}">${y}</h3>
\t\t<ul class="pub-list">
${pubs.filter(p => p.year === y).map(p => '\t\t\t' + pubLi(p, data, cites)).join('\n')}
\t\t</ul>
`;
  }
  if (theses.length) {
    h += `
\t\t<h3 class="year-heading" id="thesis">Thesis</h3>
\t\t<ul class="pub-list">
${theses.map(p => '\t\t\t' + pubLi(p, data, cites)).join('\n')}
\t\t</ul>
`;
  }
  h += `\t</div>\n`;
  return h + foot(s);
}

// Course rows. Only the first row of a run of the same semester is labelled;
// the rest show a repeat mark so the semester groups read at a glance.
function semesterRows(courses) {
  let prev = null;
  return courses.map(c => {
    const cell = c.semester === prev ? '<span class="rep">--</span>' : esc(c.semester);
    prev = c.semester;
    return `\t\t\t<tr><td>${cell}</td><td>${esc(c.title)}</td><td>${esc(c.level)}</td></tr>`;
  }).join('\n');
}

function pageCourses(data) {
  const s = data.site;
  let h = head(s, 'Courses', { desc: data.coursesIntro || '', path: 'courses.html' });
  h += `
\t<div class="section">
\t\t<h2>Courses</h2>
\t\t<p>${data.coursesIntro || ''}</p>
\t\t<table class="plain">
\t\t\t<tr><th>Semester</th><th>Course</th><th>Level</th></tr>
${semesterRows(data.courses)}
\t\t</table>
\t</div>
`;
  return h + foot(s);
}

function pageNews(data) {
  const s = data.site;
  let h = head(s, 'News', { desc: `News from the ${stripTags(s.title)}. ${data.news.slice(0, 2).map(n => stripTags(n.short || n.text)).join(' ')}`, path: 'news.html' });
  h += `
\t<div class="section">
\t\t<h2>News</h2>
\t\t<dl class="news">
`;
  let last = null;
  for (const n of data.news) {
    if (n.date !== last) { h += `\t\t\t<dt>${dateLong(n.date)}</dt>\n`; last = n.date; }
    h += `\t\t\t<dd>${markMembers(n.text, data)}</dd>\n`;
  }
  h += `\t\t</dl>
\t</div>
`;
  return h + foot(s);
}

// Blog ---------------------------------------------------------------------

// Safe id / class / file-name fragment from a title or category key.
function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'post';
}

function sortedPosts(data) { return (data.blog || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')); }
function photosOf(p) { return (p.photos || []).filter(x => x && x.url); }

// "2026-03-05" -> "March 5, 2026"; "2026-03" -> "March 2026".
function dateLong(d) {
  const [y, m, day] = String(d).split('-');
  return `${MONTHS[+m - 1] || m} ${day ? +day + ', ' : ''}${y}`;
}

function postId(p) { return p.id || `${p.date}-${slug(p.title)}`; }

function stripTags(html) { return String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }

function postSummary(p) { return p.summary || metaDesc(p.text, 170); }

function catChip(cats, type) {
  const c = cats[type];
  if (!c) return '';
  return `<span class="tag">${c.icon ? c.icon + ' ' : ''}${esc(c.name)}</span>`;
}

function postCard(p, cats) {
  const id = postId(p);
  const photos = photosOf(p);
  const c = cats[p.type] || {};
  const thumb = photos.length
    ? `<img src="${esc(photos[0].url)}" alt="${esc(p.title)}" loading="lazy">`
    : `<div class="thumb-blank">${c.icon || ''}</div>`;
  return `\t\t\t<a class="card y${esc(String(p.date || '').slice(0, 4))} c-${slug(p.type)}" href="blog/${esc(id)}.html">
\t\t\t\t<div class="thumb">${thumb}</div>
\t\t\t\t<div class="card-body">
\t\t\t\t\t<p class="card-meta">${catChip(cats, p.type)}<time>${dateLong(p.date)}</time></p>
\t\t\t\t\t<h4>${p.title}</h4>
${p.titleKr ? `\t\t\t\t\t<p class="post-kr">${p.titleKr}</p>\n` : ''}\t\t\t\t\t<p class="card-summary">${esc(postSummary(p))}</p>
\t\t\t\t\t<p class="card-foot"><span>${p.location ? esc(p.location) : ''}</span><span class="more">Details &rarr;</span></p>
\t\t\t\t</div>
\t\t\t</a>`;
}

// Conference-trip globe. A post takes part when its "route" lists places
// (separated by ">") that are all in data.places. The drawing is done by
// globe.js in the browser; here only the data and the static frame are
// written, so the page still reads fine without JavaScript.
function tripsOf(data, posts) {
  const places = data.places || {};
  const trips = [];
  for (const p of posts) {
    if (!p.route) continue;
    const path = String(p.route).split(/\s*(?:>|→|->)\s*/).map(x => x.trim()).filter(Boolean);
    const missing = path.filter(n => !Array.isArray(places[n]) || places[n].length < 2);
    if (path.length < 2 || missing.length) {
      console.warn(`blog: route "${p.route}" of "${stripTags(p.title)}" skipped${missing.length ? ' (unknown place: ' + missing.join(', ') + ')' : ''}`);
      continue;
    }
    trips.push({
      label: stripTags(p.tripLabel || p.title),
      date: p.date,
      when: dateLong(String(p.date || '').slice(0, 7)),
      href: `blog/${postId(p)}.html`,
      path,
      photos: photosOf(p).map(x => ({ url: x.url, caption: x.caption || '' })),
    });
  }
  return trips;
}

function globeSection(data, posts) {
  const trips = tripsOf(data, posts);
  if (!trips.length) return '';
  const used = {};
  for (const t of trips) for (const n of t.path) used[n] = data.places[n].slice(0, 2).map(Number);
  const g = (data.site.blog && data.site.blog.globe) || {};
  // Inside a <script> block only "</" and "-->" could break out; escape them.
  const payload = JSON.stringify({ places: used, trips, noPhotos: g.noPhotos || 'No photos yet. Read the post \u2192' })
    .replace(/</g, '\\u003c').replace(/-->/g, '--\\u003e');
  const buttons = trips.map((t, i) =>
    `\t\t\t\t<button type="button" data-trip="${i}"><span class="n">${i + 1}</span>${esc(t.label)}<span class="when">${esc(t.path[t.path.length - 1])}, ${esc(t.when)}</span></button>`).join('\n');
  const list = trips.map(t => `\t\t\t\t<li><a href="${esc(t.href)}">${esc(t.label)}</a> — ${esc(t.path.join(' → '))}, ${esc(t.when)}</li>`).join('\n');
  return `\t\t<div class="globe" id="globe">
\t\t\t<h3>${esc(g.title || 'Conference trips')}</h3>
\t\t\t<div class="globe-stage">
\t\t\t\t<canvas role="img" aria-label="Globe showing the lab's conference trips"></canvas>
\t\t\t\t<div class="globe-photos"></div>
\t\t\t\t<div class="globe-zoom"><button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="out" aria-label="Zoom out">&minus;</button></div>
\t\t\t</div>
\t\t\t<div class="globe-trips">
${buttons}
\t\t\t</div>
\t\t\t<p class="globe-hint">${g.hint || 'Drag to turn the globe; scroll, pinch or double-tap to zoom. Click a route, or a trip above, to see photos from it.'}</p>
\t\t\t<noscript><ul class="globe-list">
${list}
\t\t\t</ul></noscript>
\t\t\t<script type="application/json" id="globe-data">${payload}</script>
\t\t</div>
`;
}

function pageBlog(data) {
  const s = data.site;
  const cats = data.blogCategories || {};
  const posts = sortedPosts(data);
  const intro = (s.blog && s.blog.intro) || '';

  // Two filters: by year and by category. Both are radio groups, and because
  // each one only ever hides cards, picking one from each intersects for free.
  // A filter with a single value would do nothing, so it is left out.
  const years = [...new Set(posts.map(p => (p.date || '').slice(0, 4)))].filter(Boolean);
  const types = Object.keys(cats).filter(t => posts.some(p => p.type === t));
  const byYear = years.length > 1;
  const byType = types.length > 1;
  const ON = 'background: #0B3D6E; color: #fff; border-color: #0B3D6E;';

  // The values are data, so the rules pairing each button with its cards have
  // to be generated here. Everything that does not depend on them is in style.css.
  const css = [];
  for (const y of (byYear ? years : [])) {
    css.push(`#yf-${y}:checked ~ .cards .card:not(.y${y}) { display: none; }`);
    css.push(`#yf-${y}:checked ~ .filters label[for="yf-${y}"] { ${ON} }`);
  }
  if (byYear) css.push(`#yf-all:checked ~ .filters label[for="yf-all"] { ${ON} }`);
  for (const t of (byType ? types : [])) {
    css.push(`#cf-${slug(t)}:checked ~ .cards .card:not(.c-${slug(t)}) { display: none; }`);
    css.push(`#cf-${slug(t)}:checked ~ .filters label[for="cf-${slug(t)}"] { ${ON} }`);
  }
  if (byType) css.push(`#cf-all:checked ~ .filters label[for="cf-all"] { ${ON} }`);
  // A year and a category together can match nothing. Which pairs those are is
  // known at build time, so each gets its own rule and the reader gets a line
  // of text instead of a blank space.
  if (byYear && byType) {
    for (const y of years) {
      for (const t of types) {
        if (!posts.some(p => (p.date || '').slice(0, 4) === y && p.type === t)) {
          css.push(`#yf-${y}:checked ~ #cf-${slug(t)}:checked ~ .empty { display: block; }`);
        }
      }
    }
  }

  let h = head(s, 'Blog', {
    desc: intro,
    path: 'blog.html',
    style: css.length ? css.join('\n') + '\n' : '',
  });
  h += `
\t<div class="section blog">
\t\t<h2>${esc(blogLabel(s))}</h2>
${intro ? `\t\t<p class="blog-intro">${intro}</p>\n` : ''}`;
  if (!posts.length) return h + `\t\t<p>No posts yet.</p>\n\t</div>\n` + foot(s);
  const globe = globeSection(data, posts);
  h += globe;

  // The inputs come first: the rules above reach the buttons and the cards
  // through the sibling combinator, so both have to follow the inputs.
  const rows = [];
  if (byYear) {
    h += years.map(y => `\t\t<input class="bfilter" type="radio" name="year" id="yf-${y}">`).join('\n') + '\n';
    h += `\t\t<input class="bfilter" type="radio" name="year" id="yf-all" checked>\n`;
    rows.push(`\t\t\t<p class="filter-row"><span class="filter-label">Year</span><label for="yf-all">All</label>` +
      years.map(y => `<label for="yf-${y}">${y}</label>`).join('') + `</p>`);
  }
  if (byType) {
    h += types.map(t => `\t\t<input class="bfilter" type="radio" name="cat" id="cf-${slug(t)}">`).join('\n') + '\n';
    h += `\t\t<input class="bfilter" type="radio" name="cat" id="cf-all" checked>\n`;
    rows.push(`\t\t\t<p class="filter-row"><span class="filter-label">Category</span><label for="cf-all">All</label>` +
      types.map(t => `<label for="cf-${slug(t)}">${cats[t].icon ? cats[t].icon + ' ' : ''}${esc(cats[t].name || t)}</label>`).join('') + `</p>`);
  }
  if (rows.length) h += `\t\t<div class="filters">\n${rows.join('\n')}\n\t\t</div>\n`;

  h += `\t\t<div class="cards">\n${posts.map(p => postCard(p, cats)).join('\n')}\n\t\t</div>\n`;
  if (byYear && byType) h += `\t\t<p class="empty">No posts match this filter.</p>\n`;
  h += `\t</div>\n`;
  h += foot(s);
  // The only script on the site; loaded on this page alone, and only with a trip to show.
  if (globe) h = h.replace('</body>', `<script src="globe.js?v=${fileVersion('globe.js')}"></script>\n</body>`);
  return h;
}

function pagePost(data, p) {
  const s = data.site;
  const cats = data.blogCategories || {};
  const meta = [dateLong(p.date)];
  const chip = catChip(cats, p.type);
  if (chip) meta.push(chip);
  if (p.location) meta.push(esc(p.location));
  const photos = photosOf(p);
  let h = head(s, 'Blog', { base: '../', docTitle: stripTags(p.title), desc: postSummary(p), path: `blog/${postId(p)}.html`, image: photos.length ? photos[0].url : null, type: 'article' });
  h += `
\t<div class="section blog">
\t\t<p class="crumb"><a href="blog.html">&larr; ${esc(blogLabel(s))}</a></p>
\t\t<article class="post single" id="${esc(postId(p))}">
\t\t\t<p class="post-meta">${meta.join(' &middot; ')}</p>
\t\t\t<h2 class="post-title">${p.title}</h2>
${p.titleKr ? `\t\t\t<p class="post-kr">${p.titleKr}</p>\n` : ''}${p.text ? `\t\t\t<div class="post-body">${p.text}</div>\n` : ''}`;
  if (photos.length) {
    h += `\t\t\t<div class="gallery n${Math.min(photos.length, 3)}">\n`;
    for (const ph of photos) {
      h += `\t\t\t\t<figure><a href="${esc(ph.url)}" target="_blank" rel="noopener"><img src="${esc(ph.url)}" alt="${esc(ph.caption || p.title)}" loading="lazy"></a>${ph.caption ? `<figcaption>${ph.caption}</figcaption>` : ''}</figure>\n`;
    }
    h += `\t\t\t</div>\n`;
  }
  const links = (p.links || []).filter(x => x && x.url);
  if (links.length) {
    h += `\t\t\t<div class="post-links">\n\t\t\t\t<h5>References</h5>\n\t\t\t\t<ul>\n`;
    for (const l of links) {
      h += `\t\t\t\t\t<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || l.url)}</a></li>\n`;
    }
    h += `\t\t\t\t</ul>\n\t\t\t</div>\n`;
  }
  h += `\t\t</article>\n\t</div>\n`;
  return h + foot(s);
}

// Feeds and crawler files ---------------------------------------------------

function rfc822(date) {
  const [y, m, d] = String(date).split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 9)).toUTCString();
}

function feedXml(data) {
  const s = data.site;
  const items = sortedPosts(data).map(p => `\t<item>
\t\t<title>${esc(stripTags(p.title))}</title>
\t\t<link>${esc(abs(s, 'blog/' + postId(p) + '.html'))}</link>
\t\t<guid isPermaLink="true">${esc(abs(s, 'blog/' + postId(p) + '.html'))}</guid>
\t\t<pubDate>${rfc822(p.date)}</pubDate>
\t\t<description>${esc(postSummary(p))}</description>
\t</item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
\t<title>${esc(stripTags(s.title))} — ${esc(blogLabel(s))}</title>
\t<link>${esc(abs(s, 'blog.html'))}</link>
\t<atom:link href="${esc(abs(s, 'feed.xml'))}" rel="self" type="application/rss+xml"/>
\t<description>${esc(stripTags((s.blog && s.blog.intro) || s.title))}</description>
\t<language>ko</language>
${items}
</channel>
</rss>
`;
}

function sitemapXml(data, pageFiles) {
  const s = data.site;
  const postDate = {};
  for (const p of (data.blog || [])) postDate['blog/' + postId(p) + '.html'] = p.date;
  const urls = pageFiles.map(f => {
    const lastmod = postDate[f] ? `\n\t\t<lastmod>${postDate[f]}</lastmod>` : '';
    return `\t<url>\n\t\t<loc>${esc(abs(s, f))}</loc>${lastmod}\n\t</url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function robotsTxt(data) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${abs(data.site, 'sitemap.xml')}\n`;
}

function build() {
  CSS_VERSION = fileVersion('style.css');
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  // Citation counts are refreshed separately (fetch-citations.js) and are optional.
  try { data.citations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'citations.json'), 'utf8')).works; } catch (e) { data.citations = null; }
  const pages = {
    'index.html': pageIndex,
    'team.html': pageTeam,
    'research.html': pageResearch,
    'projects.html': pageProjects,
    'publications.html': pagePublications,
    'courses.html': pageCourses,
    'news.html': pageNews,
    'blog.html': pageBlog,
  };
  for (const [file, fn] of Object.entries(pages)) {
    fs.writeFileSync(path.join(ROOT, file), fn(data), 'utf8');
  }
  // One static page per blog post under blog/. Stale post pages are removed.
  const dir = path.join(ROOT, 'blog');
  fs.mkdirSync(dir, { recursive: true });
  const keep = new Set();
  for (const p of (data.blog || [])) {
    const name = postId(p) + '.html';
    keep.add(name);
    fs.writeFileSync(path.join(dir, name), pagePost(data, p), 'utf8');
  }
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.html') && !keep.has(f)) fs.unlinkSync(path.join(dir, f));
  }
  const html = Object.keys(pages).concat([...keep].map(f => 'blog/' + f));
  const extra = [];
  fs.writeFileSync(path.join(ROOT, 'felab.bib'), bibFile(data), 'utf8');
  extra.push('felab.bib');
  if (data.site.url) {
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml(data, html), 'utf8');
    fs.writeFileSync(path.join(ROOT, 'robots.txt'), robotsTxt(data), 'utf8');
    fs.writeFileSync(path.join(ROOT, 'feed.xml'), feedXml(data), 'utf8');
    extra.push('sitemap.xml', 'robots.txt', 'feed.xml');
  }
  return html.concat(extra);
}

module.exports = { build };

if (require.main === module) {
  const files = build();
  console.log('built', files.join(', '));
}
