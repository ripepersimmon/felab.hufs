# Graph Report - felab.hufs  (2026-09-11)

## Corpus Check
- 51 files · ~450,170 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 298 nodes · 563 edges · 16 communities (10 shown, 6 thin omitted)
- Extraction: 85% EXTRACTED · 14% INFERRED · 1% AMBIGUOUS · INFERRED: 77 edges (avg confidence: 0.85)
- Token cost: 1,667,848 input · 0 output

## Community Hubs (Navigation)
- Student Awards & KIIE Conference
- Static Site Build Pipeline
- Admin Server Backend
- Team & Publications Pages
- Blog & AAAI Conference Trip
- Interactive Globe Visualization
- ICAIF 2025 Singapore Trip
- Admin Panel Content Sections
- Citation Fetching & Deployment
- Course Schedule Fetching
- SEO Files
- Research Topic: ML for Finance
- Research Topic: Multivariate Anomaly Detection
- Research Topic: Urban Property Valuation
- Research Topic: In-Context Learning Theory
- Research Topic: Univariate Anomaly Detection

## God Nodes (most connected - your core abstractions)
1. `Financial Engineering Lab.` - 25 edges
2. `handle()` - 24 edges
3. `build()` - 20 edges
4. `Hyeongwoo Kong (공형우)` - 19 edges
5. `esc()` - 18 edges
6. `stripTags()` - 14 edges
7. `Sahong Park (박사홍)` - 14 edges
8. `2026 춘계공동학술대회 (KIIE/KORMS Spring Joint Conference)` - 14 edges
9. `head()` - 13 edges
10. `ICAIF 2025 (6th ACM International Conference on AI in Finance)` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Four Conference Attendees (2 women, 2 men) posing with peace signs and thumbs-up` --conceptually_related_to--> `Financial Engineering Lab.`  [AMBIGUOUS]
  images/blog/2511icaif/1_ICAIF.jpg → team.html
- `Three lab members posing at AAAI venue` --conceptually_related_to--> `Financial Engineering Lab.`  [INFERRED]
  images/blog/2601AAAI/aaai.jpg → team.html
- `Decision-Focused Learning Talk Photo` --conceptually_related_to--> `Financial Engineering Lab.`  [AMBIGUOUS]
  images/blog/2601AAAI/dflagain.jpg → team.html
- `AAAI Conference Venue Photo (root copy, likely duplicate)` --conceptually_related_to--> `Financial Engineering Lab.`  [AMBIGUOUS]
  images/blog/aaai.jpg → team.html
- `Award Photo (greatkoo.jpg)` --references--> `Hyeongwoo Kong (공형우)`  [INFERRED]
  images/blog/251106/greatkoo.jpg → team.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Admin-edited data drives the CI build and the published Blog** — admin_admin_admin_panel, github_workflows_pages_site_json, build, blog_blog [INFERRED 0.85]
- **Lab conference trips: ICAIF 2025, AAAI-26, KIIE 2026** — event_icaif_2025, event_aaai_2026, event_kiie_2026, person_sahong_park, person_hyeongwoo_kong [EXTRACTED 1.00]
- **Financial Engineering Lab roster** — org_fe_lab, person_hyeongwoo_kong, person_sahong_park, person_hyunmo_goo, person_gakyung_kwon, person_jongmin_lee [EXTRACTED 1.00]

## Communities (16 total, 6 thin omitted)

### Community 0 - "Student Awards & KIIE Conference"
Cohesion: 0.05
Nodes (54): 구현모 학부연구생, 학과특성화 프로그램 학생연구 최우수상 (blog post), Meta-XGBoost: A Robust Ensemble for Molecular Solubility Prediction, GerberShrink Covariance Estimation for Portfolio Optimization, HUFS Student Research Program Top Prize (Nov 2025), 2026 춘계공동학술대회 (KIIE/KORMS Spring Joint Conference), Apple Touch Icon, Globe-and-Arrow Motif, Helmeted Warrior Profile Emblem (+46 more)

### Community 1 - "Static Site Build Pipeline"
Cohesion: 0.11
Nodes (52): authorsHtml(), bibEntry(), bibFile(), bibKey(), bibName(), blogMenuItem(), build(), catChip() (+44 more)

### Community 2 - "Admin Server Backend"
Cohesion: 0.08
Nodes (36): ADMIN_HTML, BASE_HEADERS, { build }, checkPassword(), CONFIG, crypto, DATA, fs (+28 more)

### Community 3 - "Team & Publications Pages"
Cohesion: 0.12
Nodes (28): General section, Members section, 2026 춘계공동학술대회 참가 (blog post), GerberShrink: Correlation-based Portfolio Optimization, Gakyung Kwon Portrait Photo, Hyeongwoo Kong Portrait, Home page, Selected Publications (Home) (+20 more)

### Community 4 - "Blog & AAAI Conference Trip"
Cohesion: 0.09
Nodes (28): ICAIF 2025 견학 (blog post), AAAI-26 견학 (blog post), Lab website goes live (blog post), Blog page, Globe (conference trips visualization), Merlion / Singapore Backdrop, AAAI-26 (40th AAAI Conference on Artificial Intelligence), Lab website launch (Sep 2026) (+20 more)

### Community 5 - "Interactive Globe Visualization"
Cohesion: 0.16
Nodes (26): arrowhead(), count(), draw(), el(), frame(), hidePhotos(), hit(), layout() (+18 more)

### Community 6 - "ICAIF 2025 Singapore Trip"
Cohesion: 0.15
Nodes (17): Bak Kut Teh (Pork Rib Soup) Dish, Bridge Session (conference presentation session), Decision-Focused Learning for Portfolio Optimization (slide topic), Song Fa Bak Kut Teh Restaurant, ICAIF 2025 (6th ACM International Conference on AI in Finance), Four Conference Attendees (2 women, 2 men) posing with peace signs and thumbs-up, ICAIF 2025 Group Photo, ICAIF 2025 Sponsor Step-and-Repeat Backdrop (+9 more)

### Community 7 - "Admin Panel Content Sections"
Cohesion: 0.13
Nodes (15): Admin Panel, Blog section, Contact & Footer section, Courses section, News section, Password section, Professor section, Projects section (+7 more)

### Community 8 - "Citation Fetching & Deployment"
Cohesion: 0.19
Nodes (13): OpenAlex, Publications section, DATA, fetchCitations(), fs, getJson(), idsFor(), OUT (+5 more)

### Community 9 - "Course Schedule Fetching"
Cohesion: 0.23
Nodes (11): { build }, DATA, fetchCourses(), form(), fs, listCourses(), path, post() (+3 more)

## Ambiguous Edges - Review These
- `Hyunmo Goo (구현모)` → `Student Research Presentation Photo (Nicekoo)`  [AMBIGUOUS]
  images/blog/251106/nicekoo.jpg · relation: references
- `Financial Engineering Lab.` → `Four Conference Attendees (2 women, 2 men) posing with peace signs and thumbs-up`  [AMBIGUOUS]
  images/blog/2511icaif/1_ICAIF.jpg · relation: conceptually_related_to
- `Financial Engineering Lab.` → `Decision-Focused Learning Talk Photo`  [AMBIGUOUS]
  images/blog/2601AAAI/dflagain.jpg · relation: conceptually_related_to
- `Financial Engineering Lab.` → `AAAI Conference Venue Photo (root copy, likely duplicate)`  [AMBIGUOUS]
  images/blog/aaai.jpg · relation: conceptually_related_to
- `ICAIF 2025 Bridge Session Photo` → `KAIST`  [AMBIGUOUS]
  images/blog/2511icaif/2_bridgesession.jpg · relation: references
- `ICAIF 2025 Bridge Session Photo` → `UNIST`  [AMBIGUOUS]
  images/blog/2511icaif/2_bridgesession.jpg · relation: references
- `FE Lab Students Group Photo at 2026 Joint Academic Conference` → `Conference Venue (HICO Convention Center, partial banner text)`  [AMBIGUOUS]
  images/blog/26060304/students-group.jpg · relation: references

## Knowledge Gaps
- **90 isolated node(s):** `http`, `fs`, `path`, `crypto`, `{ build }` (+85 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 96 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Hyunmo Goo (구현모)` and `Student Research Presentation Photo (Nicekoo)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Financial Engineering Lab.` and `Four Conference Attendees (2 women, 2 men) posing with peace signs and thumbs-up`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Financial Engineering Lab.` and `Decision-Focused Learning Talk Photo`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Financial Engineering Lab.` and `AAAI Conference Venue Photo (root copy, likely duplicate)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `ICAIF 2025 Bridge Session Photo` and `KAIST`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `ICAIF 2025 Bridge Session Photo` and `UNIST`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `FE Lab Students Group Photo at 2026 Joint Academic Conference` and `Conference Venue (HICO Convention Center, partial banner text)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._