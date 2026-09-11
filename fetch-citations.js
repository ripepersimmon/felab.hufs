// Refreshes citation counts for the publications listed in data/site.json.
// Counts come from OpenAlex (https://openalex.org), which is free and needs no key.
// Run:  node fetch-citations.js
//
// Output goes to data/citations.json, keyed by DOI or arXiv id. build.js reads
// that file if it exists; with no file the pages simply show no counts, so a
// failed or skipped fetch never breaks a build.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data', 'site.json');
const OUT = path.join(ROOT, 'data', 'citations.json');

// OpenAlex asks for a contact address so they can get in touch about heavy use.
const MAILTO = 'gho3283@hufs.ac.kr';

function idsFor(pub) {
  const out = [];
  for (const l of (pub.links || [])) {
    const doi = (l.url.match(/doi\.org\/(.+)$/) || [])[1];
    if (doi) out.push({ key: doi.toLowerCase(), api: 'https://api.openalex.org/works/doi:' + encodeURIComponent(doi) });
    const arx = (l.url.match(/arxiv\.org\/(?:abs|pdf)\/([\d.]+)/) || [])[1];
    if (arx) out.push({ key: arx.toLowerCase(), api: 'https://api.openalex.org/works/doi:' + encodeURIComponent('10.48550/arXiv.' + arx) });
  }
  return out;
}

async function getJson(url) {
  const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'mailto=' + encodeURIComponent(MAILTO), {
    headers: { 'User-Agent': `felab-hufs-site (mailto:${MAILTO})` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchCitations() {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const works = {};
  let found = 0, missing = 0;
  for (const pub of data.publications) {
    for (const { key, api } of idsFor(pub)) {
      let w = null;
      try { w = await getJson(api); } catch (e) { w = null; }
      if (!w || typeof w.cited_by_count !== 'number') {
        missing++;
        console.log(`  no record   ${key}`);
        continue;
      }
      works[key] = {
        count: w.cited_by_count,
        url: w.id ? w.id.replace('https://openalex.org/', 'https://openalex.org/works/') : 'https://openalex.org/',
        title: w.title || pub.title,
      };
      found++;
      console.log(`  ${String(w.cited_by_count).padStart(4)}  ${key}`);
    }
  }
  return { updated: new Date().toISOString().slice(0, 10), source: 'OpenAlex', works, found, missing };
}

async function updateSite() {
  const result = await fetchCitations();
  // Never replace a good file with an empty one: a network blip would silently
  // wipe every count off the site.
  if (!result.found) {
    console.log('No citation records resolved; leaving data/citations.json as it is.');
    return result;
  }
  fs.writeFileSync(OUT, JSON.stringify({ updated: result.updated, source: result.source, works: result.works }, null, 2) + '\n', 'utf8');
  const total = Object.values(result.works).reduce((n, w) => n + w.count, 0);
  console.log(`Wrote data/citations.json: ${result.found} works, ${total} citations.`);
  return result;
}

module.exports = { updateSite };

if (require.main === module) {
  updateSite().catch(e => { console.error('Failed:', e.message); process.exit(1); });
}
