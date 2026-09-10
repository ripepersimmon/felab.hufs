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

// Short hash of style.css so browsers fetch a fresh copy whenever it changes.
let CSS_VERSION = '';
try {
  CSS_VERSION = require('crypto').createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'style.css'))).digest('hex').slice(0, 8);
} catch (e) { CSS_VERSION = String(Date.now()); }

const esc = s => String(s == null ? '' : s)
  .replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LINK_ICONS = {
  linkedin: '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="LinkedIn"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
  github: '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="GitHub"><path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/></svg>',
  scholar: '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="Google Scholar"><path fill="currentColor" d="M12 2 1 9l11 7 9-5.7V17h2V9L12 2zm0 16.5L5.5 14.4v4.3c0 1.8 3 3.3 6.5 3.3s6.5-1.5 6.5-3.3v-4.3L12 18.5z"/></svg>',
  website: '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="Website"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15.5 15.5 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4zM4.3 14a8 8 0 0 1 0-4h3.4a16 16 0 0 0 0 4H4.3zm.8 2h3a15.5 15.5 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.4-3.6C8.9 5.5 8.4 6.7 8.1 8zM12 20c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4zm2.3-6H9.7a14 14 0 0 1 0-4h4.6a14 14 0 0 1 0 4zm.2 5.6c.6-1.1 1.1-2.3 1.4-3.6h3a8 8 0 0 1-4.4 3.6zm1.8-5.6a16 16 0 0 0 0-4h3.4a8 8 0 0 1 0 4h-3.4z"/></svg>',
};

function linksHtml(links) {
  if (!links || !links.length) return '';
  const a = links.map(l => {
    const icon = LINK_ICONS[l.type] || LINK_ICONS.website;
    const names = { linkedin: 'LinkedIn', github: 'GitHub', scholar: 'Google Scholar', website: 'Website' };
    const title = names[l.type] || 'Link';
    return `<a href="${esc(l.url)}" target="_blank" title="${esc(title)}">${icon}</a>`;
  }).join('');
  return `<p class="links">${a}</p>`;
}

function head(site, pageTitle) {
  const t = pageTitle ? `${pageTitle} — ${site.title}, ${site.titleSuffix}` : `${site.title} — ${site.titleSuffix}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title>
<link rel="stylesheet" href="style.css?v=${CSS_VERSION}">
</head>
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

function blogMenuItem(site, pageTitle) {
  const b = site.blog || {};
  if (b.enabled === false) return '';
  const label = b.label || 'Blog';
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
\t\t<div class="footer-logo"><a href="${esc(f.logoUrl)}" target="_blank"><img src="${esc(f.logo)}" alt="Hankuk University of Foreign Studies"></a></div>
\t\t<div class="footer-text">
\t\t\t<p>${f.lines.join('<br>\n\t\t\t')}<br>
\t\t\tEmail. <a href="mailto:${esc(f.email)}">${esc(f.email)}</a></p>
\t\t\t<p>${f.copyright}</p>
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

function pubLi(p, data) {
  const venue = p.type === 'thesis' ? p.venue : `<i>${p.venue}</i>`;
  const note = p.note ? ` (${p.note})` : '';
  const links = (p.links || []).map(l => ` [<a href="${esc(l.url)}" target="_blank">${esc(l.label || 'paper')}</a>]`).join('');
  return `<li>${authorsHtml(p.authors, data)} (${p.year}). ${p.title}. ${venue}${note}.${links}</li>`;
}

const LEGEND = '<p class="legend"><b>Bold</b>: lab director &middot; <u>Underlined</u>: lab members &middot; &dagger;: corresponding author</p>';

// News ---------------------------------------------------------------------

function monthLong(d) { const [y, m] = d.split('-'); return `${MONTHS[+m - 1] || m} ${y}`; }
function monthShort(d) { const [y, m] = d.split('-'); return `${(MONTHS[+m - 1] || m).slice(0, 3)} ${y}`; }

// Pages --------------------------------------------------------------------

function pageIndex(data) {
  const s = data.site;
  const selected = data.publications.filter(p => p.selected);
  const recent = data.news.slice(0, s.recentCount || 3);
  let h = head(s, '');
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
${recent.map(n => `\t\t\t\t<p>${monthShort(n.date)} &mdash; ${n.short || n.text}</p>`).join('\n')}
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
    if (p.role) lines.push(`<p>${esc(p.role)}</p>`);
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
  let h = head(s, 'Team');
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
  let h = head(s, 'Research');
  h += `
\t<div class="section">
\t\t<h2>Research Areas</h2>
${data.research.map(r => `\n\t\t<h3>${r.title}</h3>\n\t\t<p>${r.text}</p>`).join('\n')}
\t</div>
`;
  return h + foot(s);
}

function pageProjects(data) {
  const s = data.site;
  let h = head(s, 'Projects');
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
  let h = head(s, 'Publications');
  h += `
\t<div class="section">
\t\t<h2>Publications</h2>
\t\t${LEGEND}
`;
  for (const y of years) {
    h += `
\t\t<h3 class="year-heading">${y}</h3>
\t\t<ul class="pub-list">
${pubs.filter(p => p.year === y).map(p => '\t\t\t' + pubLi(p, data)).join('\n')}
\t\t</ul>
`;
  }
  if (theses.length) {
    h += `
\t\t<h3 class="year-heading">Thesis</h3>
\t\t<ul class="pub-list">
${theses.map(p => '\t\t\t' + pubLi(p, data)).join('\n')}
\t\t</ul>
`;
  }
  h += `\t</div>\n`;
  return h + foot(s);
}

function pageCourses(data) {
  const s = data.site;
  let h = head(s, 'Courses');
  h += `
\t<div class="section">
\t\t<h2>Courses</h2>
\t\t<p>${data.coursesIntro || ''}</p>
\t\t<table class="plain">
\t\t\t<tr><th>Semester</th><th>Course</th><th>Level</th></tr>
${data.courses.map(c => `\t\t\t<tr><td>${esc(c.semester)}</td><td>${esc(c.title)}</td><td>${esc(c.level)}</td></tr>`).join('\n')}
\t\t</table>
\t</div>
`;
  return h + foot(s);
}

function pageNews(data) {
  const s = data.site;
  let h = head(s, 'News');
  h += `
\t<div class="section">
\t\t<h2>News</h2>
\t\t<dl class="news">
`;
  let last = null;
  for (const n of data.news) {
    if (n.date !== last) { h += `\t\t\t<dt>${monthLong(n.date)}</dt>\n`; last = n.date; }
    h += `\t\t\t<dd>${n.text}</dd>\n`;
  }
  h += `\t\t</dl>
\t</div>
`;
  return h + foot(s);
}

// Blog ---------------------------------------------------------------------

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'post';
}

function dateLong(d) {
  const [y, m, day] = String(d).split('-');
  return `${MONTHS[+m - 1] || m} ${day ? +day + ', ' : ''}${y}`;
}

function pageBlog(data) {
  const s = data.site;
  const cats = data.blogCategories || {};
  const posts = (data.blog || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const intro = (s.blog && s.blog.intro) ? `\t\t<p class="blog-intro">${s.blog.intro}</p>\n` : '';
  let h = head(s, 'Blog');
  h += `
\t<div class="section blog">
\t\t<h2>${esc((s.blog && s.blog.label) || 'Blog')}</h2>
${intro}`;
  if (!posts.length) {
    h += `\t\t<p>No posts yet.</p>\n`;
  }
  const years = [...new Set(posts.map(p => (p.date || '').slice(0, 4)))];
  if (years.length > 1) {
    h += `\t\t<p class="blog-years">${years.map(y => `<a href="#y${y}">${y}</a>`).join(' &middot; ')}</p>\n`;
  }
  let lastYear = null;
  for (const p of posts) {
    const year = (p.date || '').slice(0, 4);
    if (year !== lastYear) { h += `\t\t<h3 class="year-heading" id="y${year}">${year}</h3>\n`; lastYear = year; }
    const cat = cats[p.type];
    const id = p.id || `${p.date}-${slug(p.title)}`;
    const meta = [dateLong(p.date)];
    if (cat) meta.push(`<span class="tag">${cat.icon ? cat.icon + ' ' : ''}${esc(cat.name)}</span>`);
    if (p.location) meta.push(esc(p.location));
    h += `
\t\t<article class="post" id="${esc(id)}">
\t\t\t<p class="post-meta">${meta.join(' &middot; ')}</p>
\t\t\t<h4><a href="#${esc(id)}">${p.title}</a></h4>
${p.titleKr ? `\t\t\t<p class="post-kr">${p.titleKr}</p>\n` : ''}${p.text ? `\t\t\t<div class="post-body">${p.text}</div>\n` : ''}`;
    const photos = (p.photos || []).filter(x => x && x.url);
    if (photos.length) {
      h += `\t\t\t<div class="gallery n${Math.min(photos.length, 3)}">\n`;
      for (const ph of photos) {
        h += `\t\t\t\t<figure><a href="${esc(ph.url)}" target="_blank"><img src="${esc(ph.url)}" alt="${esc(ph.caption || p.title)}" loading="lazy"></a>${ph.caption ? `<figcaption>${ph.caption}</figcaption>` : ''}</figure>\n`;
      }
      h += `\t\t\t</div>\n`;
    }
    h += `\t\t</article>\n`;
  }
  h += `\t</div>\n`;
  return h + foot(s);
}

function build() {
  try { CSS_VERSION = require('crypto').createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'style.css'))).digest('hex').slice(0, 8); } catch (e) {}
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
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
  return Object.keys(pages);
}

module.exports = { build };

if (require.main === module) {
  const files = build();
  console.log('built', files.join(', '));
}
