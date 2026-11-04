/**
 * Sopaan Class 9 Maths — quiz records (Google Apps Script, bound to a Google Sheet)
 *
 * Keeps one row per student per LO test in the sheet "Quiz Records":
 *   User Name | Quiz Name | Completion Status | Completion Date | Completion Time | Email | Quiz Key | Score | Total
 *
 * - The student is identified by the "Sopaan Sign-in" script (Signin.gs), which reads the Gmail
 *   account straight from Google. A name typed into a form is never used.
 * - A second attempt is refused while that student's row for the test exists.
 * - To allow a retake, delete that row in the sheet.
 *
 * Setup: see SETUP.md. Paste the Sopaan Sign-in "Lookup" link below, then Deploy > Web app,
 * Execute as: Me, Who has access: Anyone.
 */
// The "Lookup" deployment link of the Sopaan Sign-in script (Execute as Me, Anyone).
const SIGNIN_LOOKUP_URL = 'https://script.google.com/macros/s/AKfycbyBHnwvnAfHKj1VW1hcZAoxTvlaEDOvvSsS4XnW35yhFyXRAvGRr8yCgdhgXoc61hpg/exec';
// The Google Sheet that keeps the records:
// https://docs.google.com/spreadsheets/d/1mm6mCNhvse0DnForcc1HuOCLWsllwakb39i-a2Uuv60/edit
const SPREADSHEET_ID = '1mm6mCNhvse0DnForcc1HuOCLWsllwakb39i-a2Uuv60';
const SHEET_NAME = 'Quiz Records';
const HEADERS = ['User Name', 'Quiz Name', 'Completion Status', 'Completion Date', 'Completion Time', 'Email', 'Quiz Key', 'Score', 'Total'];
// Leave empty to accept any Google account, or list domains, e.g. ['gmail.com', 'yourschool.in'].
const ALLOWED_DOMAINS = [];
// Teacher / records owner: the Quiz Records sheet is shared with this Google account (edit access).
const ADMIN_EMAIL = 'ankitagarwal5986@gmail.com';

/** Run once from the Apps Script editor (select "setup" > Run): creates the "Quiz Records" tab
 *  and shares the spreadsheet with ADMIN_EMAIL. */
function setup() {
  sheet_();
  shareWithAdmin_();
  Logger.log('Quiz Records is ready and shared with ' + ADMIN_EMAIL);
}

function shareWithAdmin_() {
  if (!ADMIN_EMAIL) return;
  const ss = ss_();
  const owner = ss.getOwner() && ss.getOwner().getEmail().toLowerCase();
  if (owner === ADMIN_EMAIL.toLowerCase()) return;
  const editors = ss.getEditors().map(function (u) { return u.getEmail().toLowerCase(); });
  if (editors.indexOf(ADMIN_EMAIL.toLowerCase()) < 0) ss.addEditor(ADMIN_EMAIL);
}

function doPost(e) {
  let out;
  try {
    const req = JSON.parse(e.postData.contents);
    const user = sessionUser_(req.session);
    out = handle_(req, user);
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: 'Sopaan quiz records' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Finds the Gmail account behind a sign-in session code (asks the Sopaan Sign-in script once, then remembers it). */
function sessionUser_(code) {
  code = String(code || '').replace(/[^a-f0-9]/g, '').slice(0, 64);
  if (code.length < 32) throw new Error('not_signed_in');
  const cache = CacheService.getScriptCache(), hit = cache.get('u_' + code);
  let u = hit ? JSON.parse(hit) : null;
  if (!u) {
    const res = UrlFetchApp.fetch(SIGNIN_LOOKUP_URL + '?lookup=' + code, { muteHttpExceptions: true, followRedirects: true });
    const j = JSON.parse(res.getContentText());
    if (!j.ok || !j.email) throw new Error('session_expired');
    u = { email: String(j.email).toLowerCase(), name: j.name || j.email };
    cache.put('u_' + code, JSON.stringify(u), 21000);
  }
  if (ALLOWED_DOMAINS.length && ALLOWED_DOMAINS.indexOf(u.email.split('@')[1]) < 0) throw new Error('domain_not_allowed');
  return u;
}

function ss_() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

/** The "Quiz Records" sheet, created with headers if missing. */
function sheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange('A1:I1').setFontWeight('bold');
    sh.getRange('D:E').setNumberFormat('@'); // keep date and time exactly as written
    try { shareWithAdmin_(); } catch (e) {}
  }
  return sh;
}

function rowsFor_(sh, email) {
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, HEADERS.length).getDisplayValues()
    .filter(function (r) { return String(r[5]).toLowerCase() === email; });
}

function record_(r) {
  return { quiz: r[1], status: r[2], date: r[3], time: r[4], score: r[7], total: r[8] };
}

function handle_(req, user) {
  const sh = sheet_();
  if (req.action === 'status') {
    const map = {};
    rowsFor_(sh, user.email).forEach(function (r) { if (r[2] === 'Completed') map[r[6]] = record_(r); });
    return { ok: true, user: user, records: map };
  }
  if (req.action === 'submit') {
    const key = String(req.quizKey || '').slice(0, 40);
    if (!/^ch\d{2}_lo\d+$/.test(key)) throw new Error('bad_quiz');
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const existing = rowsFor_(sh, user.email).filter(function (r) { return r[6] === key; });
      if (existing.length) return { ok: true, duplicate: true, record: record_(existing[0]) };
      const now = new Date(), tz = Session.getScriptTimeZone();
      const row = [user.name, String(req.quizName || key).slice(0, 120), 'Completed',
        Utilities.formatDate(now, tz, 'yyyy-MM-dd'), Utilities.formatDate(now, tz, 'HH:mm:ss'),
        user.email, key, Number(req.score) || 0, Number(req.total) || 0];
      sh.appendRow(row);
      return { ok: true, record: record_(row.map(String)) };
    } finally {
      lock.releaseLock();
    }
  }
  throw new Error('unknown_action');
}
