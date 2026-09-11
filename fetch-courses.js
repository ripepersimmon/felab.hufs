// Pulls the professor's courses from the HUFS timetable system (wis.hufs.ac.kr)
// into data/site.json and rebuilds the pages.
// Run:  node fetch-courses.js
'use strict';
const fs = require('fs');
const path = require('path');
const { build } = require('./build.js');

const DATA = path.join(__dirname, 'data', 'site.json');
const API = 'https://wis.hufs.ac.kr/hufs';
const REFERER = 'https://wis.hufs.ac.kr/src08/jsp/lecture/LECTURE2020L.jsp';

// Search settings. Change these if the professor or department changes.
const INSTRUCTOR = '공형우';
const DEPARTMENT = 'A9B01';           // Finance & AI융합전공 (Global campus)
const CAMPUS = 'H2';                  // H1 = Seoul, H2 = Global
const FIRST_YEAR = 2025;

const SEMESTER = { '1': 'Spring', '2': 'Summer', '3': 'Fall', '4': 'Winter' };
const YEAR_LABEL = { '1': '1st year', '2': '2nd year', '3': '3rd year', '4': '4th year' };

function form(o) { return Object.entries(o).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&'); }

async function post(params) {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0', 'Referer': REFERER },
    body: form(params),
  });
  const s = await r.text();
  let t; try { t = decodeURIComponent(s); } catch (e) { t = s; }
  return JSON.parse(t);
}

async function listCourses(year, sessn) {
  const p = {
    mName: 'getDataLssnLista', cName: 'hufs.stu1.STU1_C009',
    org_sect: 'A', ledg_year: String(year), ledg_sessn: sessn, campus: CAMPUS,
    crs_strct_cd: DEPARTMENT, gubun: '1', subjt_nm: '', won: '', cyber: '', emp_nm: INSTRUCTOR, pf: '%',
  };
  for (const k of ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12']) p[k] = 'N';
  const r = await post(p);
  if (r.dataCount == 0) return [];
  return r.dataCount == 1 ? [r.data] : r.data;
}

async function fetchCourses() {
  const thisYear = new Date().getFullYear();
  const out = [];
  for (let y = FIRST_YEAR; y <= thisYear + 1; y++) {
    for (const s of ['1', '3']) {
      let rows;
      try { rows = await listCourses(y, s); } catch (e) { throw new Error(`HUFS timetable query failed for ${y}-${s}: ${e.message}`); }
      const seen = new Set();
      for (const c of rows) {
        if (seen.has(c.lssnCd)) continue;
        seen.add(c.lssnCd);
        out.push({
          semester: `${SEMESTER[s] || s} ${y}`,
          title: `${(c.subjtNaEng || '').trim()} (${(c.subjtNaKr || '').trim()})`,
          level: `Undergraduate, ${YEAR_LABEL[c.dstGrad] || ''}`.replace(/, $/, ''),
          code: c.lssnCd,
          sort: y * 10 + Number(s),
        });
      }
    }
  }
  out.sort((a, b) => b.sort - a.sort);
  return out.map(({ sort, ...c }) => c);
}

async function updateSite() {
  const courses = await fetchCourses();
  const d = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  d.courses = courses;
  fs.writeFileSync(DATA, JSON.stringify(d, null, 2) + '\n', 'utf8');
  build();
  return courses;
}

module.exports = { updateSite };

if (require.main === module) {
  updateSite().then(c => {
    console.log(`${c.length} courses written to data/site.json and pages rebuilt:`);
    c.forEach(x => console.log(`  ${x.semester} | ${x.title} | ${x.level}`));
  }).catch(e => { console.error(e.message); process.exit(1); });
}
