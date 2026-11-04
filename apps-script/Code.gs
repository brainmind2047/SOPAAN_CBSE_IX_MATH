/**
 * Sopaan Class 9 Maths — quiz records (Google Apps Script, bound to a Google Sheet)
 *
 * Keeps one row per student per LO test in the sheet "Quiz Records":
 *   User Name | Quiz Name | Completion Status | Completion Date | Completion Time | Email | Quiz Key | Score | Total
 *
 * - The student is identified from their Google sign-in, verified here on Google's side.
 *   The name typed into a form is never used.
 * - A second attempt is refused while that student's row for the test exists.
 * - To allow a retake, delete that row in the sheet.
 *
 * Setup: see SETUP.md. Paste your OAuth Client ID below, then Deploy > New deployment > Web app,
 * Execute as: Me, Who has access: Anyone.
 */
const CLIENT_ID = 'PASTE_YOUR_CLIENT_ID.apps.googleusercontent.com';
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const owner = ss.getOwner() && ss.getOwner().getEmail().toLowerCase();
  if (owner === ADMIN_EMAIL.toLowerCase()) return;
  const editors = ss.getEditors().map(function (u) { return u.getEmail().toLowerCase(); });
  if (editors.indexOf(ADMIN_EMAIL.toLowerCase()) < 0) ss.addEditor(ADMIN_EMAIL);
}

function doPost(e) {
  let out;
  try {
    const req = JSON.parse(e.postData.contents);
    const user = verifyUser_(req.idToken);
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

/** Checks the Google ID token with Google and returns the signed-in student. */
function verifyUser_(idToken) {
  if (!idToken) throw new Error('not_signed_in');
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('token_invalid');
  const p = JSON.parse(res.getContentText());
  if (p.aud !== CLIENT_ID) throw new Error('token_wrong_app');
  if (String(p.email_verified) !== 'true') throw new Error('email_not_verified');
  if (Number(p.exp) * 1000 < Date.now()) throw new Error('token_expired');
  const email = String(p.email).toLowerCase();
  if (ALLOWED_DOMAINS.length && ALLOWED_DOMAINS.indexOf(email.split('@')[1]) < 0) throw new Error('domain_not_allowed');
  return { email: email, name: p.name || email };
}

/** The "Quiz Records" sheet, created with headers if missing. */
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
