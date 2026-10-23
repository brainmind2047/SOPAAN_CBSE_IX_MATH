# Sopaan Practice Series — Class 9 Mathematics (NCERT Ganita Manjari) — Master Prompt

Use this prompt to produce one interactive chapter sheet for **NCERT Ganita Manjari, Grade 9**
(Part I: Chapters 1–8, Part II: Chapters 9–14). The sheet runs on the Sopaan engine
(sign-in, Learning Sheet mode, Quiz mode, theory notes, question palette, on-screen keyboard,
scratchpad, whiteboard, calculator, celebrations and teacher's observations). The builder turns your
data files into the finished HTML page, so you author **content only**, never page code.

---

## 1. What one chapter sheet contains

```
📖 Theory tab
   • Hub: notes for each topic · practice sheet for each LO · 30-minute test for each LO · LO report
   • "About this chapter": intro + LO map
   • One notes section per topic (LO list, subtopics, definitions, key boxes, labelled SVG figures,
     common mistakes, worked examples, links to that topic's practice and test)
PRACTICE (one tab per learning objective, LO 1 … LO n)
   Book 1 · 📗 NCERT Ganita Manjari — EVERY textbook exercise question that tests this LO
            (Exercise Sets x.y, End-of-chapter exercises, starred * problems, and
             answerable "Think and Reflect" / in-text questions), in book order
   Book 2 · 📙 Extra practice — new questions written for the same LO (easy → hard)
LO TESTS (after all practice tabs; one per LO)
   🧪 Test · LO k — 10–18 questions, standard time 30 minutes, always Quiz mode,
      timer starts on "Start", auto-submits at 00:00, one attempt, score + key + solutions after
📊 LO report — pie charts of test marks per LO, practice accuracy, mastery band per LO
```

The same learning objective is kept for the topic it belongs to: every practice question and every
test question sits under exactly one LO, and the LO's colour is used for its tab, cards and report.

## 2. Learning objectives

* 3–8 LOs per chapter (5–6 is typical). Each LO is one measurable skill, written as
  **"I can …"** (e.g. "I can find the distance between two points using the Baudhāyana–Pythagoras theorem").
* LOs follow the chapter's own section order. Each LO belongs to one topic (a topic = a textbook
  section or a group of sections). A topic can hold several LOs.
* Every textbook exercise question must be placed under the LO it tests most directly. If a question
  spans two LOs, put it under the later one (or split its parts across both).

## 3. Writing rules

* **Coverage:** include *all* exercise questions of the chapter. A question with parts (i), (ii), (iii)
  can become one stepped `blank` slide (one step per part) or several slides. Open-ended or
  "discuss / draw / reflect" questions are converted into an answerable form (a decision with
  reasons as MCQ, a numerical consequence, a yes/no + justification choice) — never dropped. Put a
  short note in `src` such as `"Exercise Set 1.2 · Q3 (adapted)"`.
* **Own words:** re-word every question and all notes in your own words. Keep the mathematical data
  (numbers, coordinates, shapes, names of people) so students recognise the textbook question, but do
  not copy the book's sentences. Notes are written fresh, never copied.
* **Figures:** the textbook's figures are not available as images. If a question depends on a figure,
  state the needed data in the question and draw your own SVG (classes in §6). Never invent data that
  contradicts the book.
* **Correctness first:** solve every question yourself and double-check arithmetic by running it
  (python). Every answer must pass the validator (§8). Distractors in MCQs must be plausible mistakes
  (sign slips, wrong formula, adding instead of subtracting), never silly.
* **Solutions:** every slide has a worked solution in `sol` — short lines separated by `\n`,
  each line one step of reasoning. Mention the common mistake when useful.
* **Difficulty:** within each book group order easy → hard. Extra practice: 5–10 per LO, including
  at least one real-life context and one error-analysis or reasoning item.
* **Tests:** 10–18 questions per LO, sized for 30 minutes for a typical Grade 9 student. Mix MCQ,
  Assertion–Reason and stepped fill-in questions; include 2–3 harder multi-step items. Test questions
  are new (not copies of the practice questions) but test the same LO.
* Language: clear Indian-English school register; use ₹, metres, cm, Indian names and contexts.
  Use proper symbols: −, ×, ÷, √, π, °, ≤, ≥, ≠, ∠, △, ∥, ⊥.

## 4. Output files (one folder per chapter: `chapters/chNN/`)

| File | Content |
|---|---|
| `meta.json` | chapter number, part, title, short title, intro HTML, topics, LOs |
| `notes_<topicId>.html` | inner HTML of that topic's notes (no `<section>` wrapper, no `<h2>` — the builder adds the heading and the LO list) |
| `lo<k>_practice.json` | array of slides: Book 1 (`gm`/`gmx`) first, then Book 2 (`xp`) |
| `lo<k>_test.json` | array of 10–18 slides, all with `"book":"test"` |

### meta.json
```json
{
  "num": 1, "part": "I",
  "title": "Orienting Yourself: The Use of Coordinates",
  "short": "Coordinates",
  "intro_html": "<p>…two or three sentences on what the chapter is about and why it matters…</p>",
  "topics": [
    {"id": "t1", "num": "1.3", "title": "The 2-D Cartesian coordinate system",
     "subtopics": ["Axes and origin", "Quadrants and signs", "Points on the axes"]}
  ],
  "los": [
    {"id": "lo1", "topic": "t1", "short": "Plotting & reading points",
     "text": "I can plot a point from its coordinates and read the coordinates of a plotted point."}
  ]
}
```

## 5. Slide schema (practice and test)

Common fields: `kind`, `book`, `src`, `sol`, optional `fig` (inline SVG/HTML string), optional `tag` (leave "").
`book`: `gm` = textbook exercise question · `gmx` = textbook in-text / Think-and-Reflect / example
question · `xp` = extra practice · `test` = LO test.
`src`: where it comes from, e.g. `"Exercise Set 1.1 · Q(ii)"`, `"End-of-chapter · Q6*"`,
`"Think and Reflect · p.7"`, `"Extra practice · real life"`, `"Test"`.

**MCQ**
```json
{"kind":"mcq","book":"gm","src":"End-of-chapter · Q1",
 "text":"Where do the x-axis and the y-axis meet?",
 "opts":["(0, 0)","(1, 1)","(0, 1)","(1, 0)"],"correct":0,
 "sol":"The axes cross at the origin O.\nBoth coordinates of O are 0, so O = (0, 0)."}
```
**Assertion–Reason** (options are fixed by the engine; `correct` 0–3 = A&R true, R explains · both true, R doesn't explain · A true R false · A false R true)
```json
{"kind":"ar","book":"test","src":"Test","a":"(3, −2) lies in Quadrant IV.","r":"In Quadrant IV, x > 0 and y < 0.","correct":0,"sol":"…"}
```
**Stepped fill-in** — each step is one line with one or more blanks `__B1__`, `__B2__` …
```json
{"kind":"blank","book":"gm","src":"Exercise Set 1.1 · Q(i)–(iii)",
 "p":"Reiaan's door runs from D₁(9, 0) to R₁(11.5, 0) on the x-axis (1 unit = 1 foot).",
 "flat":[
   {"t":"Distance of D₁ from the y-axis = __B1__ ft","a":{"B1":"9"}},
   {"t":"Coordinates of D₁: (__B1__, __B2__)","a":{"B1":"9","B2":"0"}},
   {"t":"Width of the door = __B1__ ft","a":{"B1":"2.5"}},
   {"t":"Is that wide enough for a wheelchair (needs about 3 ft)? __B1__ (yes / no)","a":{"B1":"no"},"expr":"words","accept":["n"]}
 ],
 "sol":"D₁ lies on the x-axis 9 units right of O.\nSo D₁ = (9, 0).\nWidth = 11.5 − 9 = 2.5 ft.\n2.5 ft < 3 ft, so a wheelchair would find it tight."}
```
A **case** slide is the same as blank but uses `"title"` and `"body"` instead of `"p"` (for a passage-based case study with several steps).
Optional on a step: `"partLabel":"(ii)"` to show a sub-part heading, `"fig"` for a step figure.

### Answer types (`expr` on a step) — choose the one that accepts every correct way of writing the answer
| expr | use for | example answer |
|---|---|---|
| *(omit)* | a number (decimals, negatives, simple fractions accepted numerically, ±0.001) or a short exact token | `"12"`, `"-3.5"`, `"3/4"` |
| `"approx"` | rounded measurement, accepted within 1 % | `"7.07"` |
| `"words"` | a word / phrase / yes-no; letters only compared | `"yes"`, `"Quadrant II"` |
| `true` | algebraic expression; any equivalent form accepted | `"2x+5"`, `"x^2-9"`, `"(a+b)^2"` |
| `"coord"` | an ordered pair | `"(3, -4)"` |
| `"list"` | numbers in order | `"2, 3, 5"` |
| `"set"` | numbers in any order | `"-2, 3"` |
| `"fv"` | a fraction value (any equivalent form) | `"3/4"` |
| `"fl"` | a fraction that must be in lowest terms (or mixed) | `"5/8"` |
| `"fm"` | a mixed number | `"2 1/3"` |
| `"dec"` | must be written as a decimal | `"0.375"` |
| `"angle"` | name of an angle / segment by letters (reverse accepted) | `"ABC"` |
| `"pow"` | powers like `2^5`, `3^2×5` | `"2^3x3^2"` |
| `"primes"` | prime factorisation (order free) | `"2^2x3x5"` |
| `"glist"` | letters/labels in any order | `"A, C, D"` |

Rules: put `accept` (array) for other acceptable spellings. **Avoid answers containing √**
(students can't type it easily): ask for the number under the root instead, e.g. `"AD = √__B1__"` with answer `"29"`,
or ask for the decimal with `approx`. For fractions in text use `{3/4}`, mixed numbers `{2 1/3}`.
Allowed inline tags in text/opts/p/sol: `<b> <i> <sup> <sub>`. In step `t` any simple HTML is allowed.

## 6. Figures (inline SVG)

Wrap a figure like this (width ≤ 360px, light/dark safe because it uses classes):
```html
<div style="width:100%;max-width:340px;margin:0 auto"><svg class="figsvg" viewBox="0 0 320 200" role="img">…</svg></div>
```
Classes: `ln` line · `arm` coloured line · `pt` point (circle r=2.8) · `lb` label text · `al` accent label ·
`tk` grid/tick line · `po` small axis numbers · `sh` `sh2` `sh3` filled shapes (gold tints) · `wg` light fill ·
`ra` right-angle mark · `hid` dashed line · `shd` accent fill · `cell` table cell · `dr` red dot · `pr` pale fill.
Arrowheads: define `<marker id="ah">` with a `<path class="ahd">`. Use `text-anchor="middle" dominant-baseline="middle"`.
For a coordinate grid draw `tk` lines every unit, `ln` axes with arrowheads, `po` numbers. No `<script>`, no event attributes, no external images.

## 7. Notes HTML (per topic)

Write rich, friendly notes (aim 3–8 KB of HTML per topic):
* `<h4>` subheadings for each subtopic, `<p>`, `<ul><li>` lists.
* `<div class="keybox"><b>Key idea</b><br>…</div>` for definitions, theorems, formulas.
  `<div class="keybox warn"><b>Common mistake</b><br>…</div>` · `<div class="keybox tip"><b>Tip</b><br>…</div>`.
* Worked examples: `<div class="ex"><div class="exh">Worked example 1 · title</div><div class="exl">line<br>line<br>…</div></div>` — at least two per topic.
* Tables: `<div class="tscroll"><table class="ttab"><tr><th>…</th></tr><tr><td>…</td></tr></table></div>`.
* Labelled SVG figures as in §6. Fractions `{a/b}` work in notes too.
* Mention the textbook's Indian heritage notes briefly where the book does (e.g. Baudhāyana, Brahmagupta) in your own words.

## 8. Checks before you finish

Run `node /home/claude/sopaan9/validate.js chapters/chNN` until it prints **OK — no errors**.
It runs every answer through the sheet's own answer-checker, checks MCQ indexes, blanks, sizes and
book order. Then run with `--sources` and confirm that every exercise question of the chapter
appears at least once. Fix warnings where sensible.

## 9. Engine behaviour (for reference — implemented by the builder)

* Learning Sheet mode: two tries per step, then the answer is revealed; solution shown after.
* Quiz mode: no feedback until the tab is finished; LO tests are always Quiz mode.
* LO tests: start gate → 30:00 countdown (amber under 5 min, red under 1 min) → auto-submit,
  one attempt, record saved with time used.
* Accuracy meter: large dial (red < 50 %, amber 50–74 %, green ≥ 75 %) with first-try / second-try /
  revealed counts and the chapter accuracy.
* LO report: donut of test marks per LO + per-LO cards (test %, practice %, mastery band).
* Progress is saved per student on the device; every chapter page shares the same sign-in.

---

## 10. Book-wise practice sheets under each LO

Each LO can hold several practice sheets, one per book, shown as book tabs inside that LO:

| Sheet | book code | file | source |
|---|---|---|---|
| 📗 NCERT Ganita Manjari + 📙 own extra practice | `gm`/`gmx` then `xp` | `lo<k>_practice.json` | NCERT textbook (all exercise questions) + newly written practice |
| 📕 Goyal Brothers (A Complete Course in Mathematics IX) | `gy` | `lo<k>_gy.json` | the matching Goyal chapter |
| 📒 Arihant All in One (CBSE Mathematics 9) | `aio` | `lo<k>_aio.json` | the matching All in One chapter |
| 📘 R S Aggarwal (Mathematics for Class IX) | `rsa` | `lo<k>_rsa.json` | the matching R S Aggarwal chapter (older syllabus — only topics that this chapter's LOs cover) |

Rules for the book sheets:
* Keep the LOs exactly as in `meta.json` — never add or rename LOs; map every book question to the LO it tests.
  Questions on topics outside the chapter's LOs are left out (list them in your final report).
* Try to include all exercise / practice questions of the matching book chapter (exercises, MCQs, assertion–reason,
  case-study and competency questions). Solved examples are not needed.
* `src` names the book's own label, e.g. `"Exercise 5A · Q7"`, `"MCQ · Q12"`, `"Case study 2"`, `"Competency Q.53"`.
* Re-word each question in your own words, keeping its numbers and data; write your own worked solution.
* Order inside each file: easy → hard, keeping the book's exercise order where it already does that.
* Scanned books are available as OCR text (symbols, powers and minus signs are often garbled). Check every
  question against the page image before writing it (see helper below); never guess a garbled number.

### Source files
* NCERT text: `/home/claude/sopaan9/src/iemh1NN.txt` (Part I ch 1–8), `/home/claude/sopaan9/src/iemh20N.txt` (Part II ch 9–14).
* CBSE syllabus 2026-27 (competencies and learning outcomes): `/home/claude/sopaan9/src/syllabus.txt`.
* Goyal Part I OCR: `/home/claude/sopaan9/src/ocr/goyal_p1/pNNNN.txt` (one file per PDF page).
* All in One OCR: `/home/claude/sopaan9/src/ocr/allinone/pNNNN.txt`.
* R S Aggarwal text layer: `/home/claude/sopaan9/src/rsa.txt` (pages separated by form-feed; PDF page = book page + 12).
* Page images to check figures and garbled maths: `bash /home/claude/sopaan9/src/page.sh <book> <pdfPage>`
  prints a PNG path; open it with the Read tool. `<book>` = ncert1 | ncert2-9 … ncert2-14 | goyal | aio | rsa.
  NCERT Part I: PDF page = textbook page + 20.

## 11. Publishing and backup

* All 14 chapter pages plus the main page are published as ONE artifact. The main page opens each chapter
  in a full-screen reader, so every chapter shares the same sign-in and the same backup store.
* Backup: when a student opens the sheets signed in to Claude with Contributor access or higher, their
  records are saved to the artifact database:
  `results/<account>` (roster: name, roll, per-chapter LO test %, practice accuracy) and
  `results/<account>/sheets/<chapter>__<student>` (full record). Students can only write their own;
  only the owner and editors can read everyone's. The main page shows owners/editors a "Class results" table.
  Without that access, progress is kept on the student's device only (as before).
* Rebuild: `python3 build.py chapters dist` → validate every chapter → republish `dist/index.html` with the
  chapter files to the same artifact.
