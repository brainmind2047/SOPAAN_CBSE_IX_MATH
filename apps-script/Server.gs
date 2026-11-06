/**
 * Sopaan · CBSE Class 9 Mathematics · locked sheets server (Google Apps Script, bound to a Google Sheet).
 * Works the same way as the Class 10 server: the teacher gives each student a Login ID and PIN.
 *
 * Tabs:   Logins    Login ID | PIN | Student name | Sheets (e.g. ch05 or ALL) | Notes
 *         Attempts  Login ID | Sheet | Status | Device | Started | Last seen | Progress | Test marks | Finished | Token | Test data
 *         Quiz Records  User Name | Quiz Name | Completion Status | Completion Date | Completion Time | Login ID | Quiz Key | Score | Total
 * Content: one HTML file per chapter (ch01.html … ch14.html) in a Drive folder (menu: Sopaan › Import chapter files).
 *
 * Rules: one attempt per login per chapter, on one device. Each LO test can be submitted once.
 *        When every LO test of the chapter is submitted, the attempt is finished and the login cannot open that chapter again.
 *        To allow a new attempt: Attempts tab › click the row › Sopaan › Reset the selected attempt.
 * Deploy: Deploy › New deployment › Web app › Execute as: Me · Who has access: Anyone. The /exec link goes in the login page.
 */
var CONTENT_FOLDER_NAME = 'Sopaan Class 9 Maths · chapter files';
var CONTENT_SOURCE = 'https://raw.githubusercontent.com/brainmind2047/SOPAAN_CBSE_IX_MATH/'; // + <commit>/content/chNN.html
var SHEET_IDS = ['ch01','ch02','ch03','ch04','ch05','ch06','ch07','ch08','ch09','ch10','ch11','ch12','ch13','ch14'];
var NAMES = {ch01:'Ch 1 Orienting Yourself: The Use of Coordinates',ch02:'Ch 2 Introduction to Linear Polynomials',ch03:'Ch 3 The World of Numbers',ch04:'Ch 4 Exploring Algebraic Identities',ch05:"Ch 5 I'm Up and Down, and Round and Round",ch06:'Ch 6 Measuring Space: Perimeter and Area',ch07:'Ch 7 The Mathematics of Maybe: Introduction to Probability',ch08:'Ch 8 Predicting What Comes Next: Exploring Sequences and Progressions',ch09:'Ch 9 Propositions and their Converses',ch10:'Ch 10 How Quantities Combine: Understanding Data',ch11:'Ch 11 The World of Algorithms',ch12:'Ch 12 Quadrilaterals',ch13:'Ch 13 Two Variables, One Line',ch14:'Ch 14 Math of Space: Surface Area and Volume'};
var A = {LOGIN:0, SHEET:1, STATUS:2, DEVICE:3, STARTED:4, LAST:5, PROGRESS:6, TESTS:7, FINISHED:8, TOKEN:9, DATA:10};

/* ---------------- web API ---------------- */
function doPost(e) {
  var out;
  try { out = handle_(JSON.parse(e.postData.contents)); }
  catch (err) { out = {ok: false, code: 'error', msg: 'Server error: ' + err}; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput('Sopaan Class 9 server is running.'); }

function handle_(r) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if (r.action === 'start') return start_(r);
    if (r.action === 'save') return touch_(r, false);
    if (r.action === 'status') return status_(r);
    if (r.action === 'submit') return submit_(r);
    if (r.action === 'finish') return touch_(r, true);
    return {ok: false, code: 'bad', msg: 'Unknown request.'};
  } finally { lock.releaseLock(); }
}

function start_(r) {
  var id = String(r.login || '').trim().toUpperCase(), pin = String(r.pin || '').trim(), sheet = String(r.sheet || '').trim(), dev = String(r.device || '');
  if (!id || !pin || SHEET_IDS.indexOf(sheet) < 0) return {ok: false, code: 'bad', msg: 'Please enter your login ID and PIN.'};
  var L = findLogin_(id);
  if (!L || String(L[1]).trim() !== pin) return {ok: false, code: 'pin', msg: 'Login ID or PIN is not correct.'};
  var allowed = String(L[3] || '').toLowerCase().split(/[\s,]+/).filter(String);
  if (allowed.indexOf('all') < 0 && allowed.indexOf(sheet) < 0) return {ok: false, code: 'notassigned', msg: 'This login is not assigned to ' + NAMES[sheet] + '. Please contact your teacher.'};
  var sh = tab_('Attempts'), rows = sh.getDataRange().getValues(), now = new Date(), rowNo = -1;
  for (var i = 1; i < rows.length; i++) if (String(rows[i][A.LOGIN]).toUpperCase() === id && rows[i][A.SHEET] === sheet) { rowNo = i + 1; break; }
  var token;
  if (rowNo > 0) {
    var row = rows[rowNo - 1];
    if (row[A.STATUS] === 'finished') return {ok: false, code: 'used', msg: 'This login has already been used for ' + NAMES[sheet] + '. Each login works for one attempt only.'};
    if (row[A.DEVICE] && row[A.DEVICE] !== dev) return {ok: false, code: 'device', msg: 'This attempt was started on another device. Continue on that device, or ask your teacher to reset it.'};
    token = row[A.TOKEN] || Utilities.getUuid();
    sh.getRange(rowNo, A.DEVICE + 1).setValue(dev); sh.getRange(rowNo, A.LAST + 1).setValue(now); sh.getRange(rowNo, A.TOKEN + 1).setValue(token);
  } else {
    token = Utilities.getUuid();
    sh.appendRow([id, sheet, 'in progress', dev, now, now, '', '', '', token, '{}']);
  }
  var html = content_(sheet);
  if (!html) return {ok: false, code: 'nocontent', msg: 'This sheet is not available yet. Please contact your teacher.'};
  return {ok: true, token: token, name: String(L[2] || id), login: id, sheet: sheet, title: NAMES[sheet], html: html};
}

function rowByToken_(token) {
  if (!token) return null;
  var sh = tab_('Attempts'), rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][A.TOKEN] && rows[i][A.TOKEN] === token) return {sh: sh, n: i + 1, row: rows[i]};
  return null;
}
function data_(row) { try { return JSON.parse(row[A.DATA] || '{}') || {}; } catch (e) { return {}; } }

function touch_(r, finish) {
  var R = rowByToken_(r.token);
  if (!R) return {ok: false, code: 'token', msg: 'Session not found.'};
  if (R.row[A.STATUS] === 'finished') return {ok: true, finished: true};
  R.sh.getRange(R.n, A.LAST + 1).setValue(new Date());
  if (r.progress) R.sh.getRange(R.n, A.PROGRESS + 1).setValue(String(r.progress).slice(0, 500));
  if (finish) { R.sh.getRange(R.n, A.STATUS + 1).setValue('finished'); R.sh.getRange(R.n, A.FINISHED + 1).setValue(new Date()); }
  return {ok: true, finished: !!finish};
}

/** The LO tests this attempt has already submitted. */
function status_(r) {
  var R = rowByToken_(r.token);
  if (!R) return {ok: false, code: 'token', msg: 'Session not found.'};
  return {ok: true, finished: R.row[A.STATUS] === 'finished', records: data_(R.row)};
}

/** Records one LO test (once). Finishes the attempt when every LO test of the chapter is in. */
function submit_(r) {
  var R = rowByToken_(r.token);
  if (!R) return {ok: false, code: 'token', msg: 'Session not found.'};
  var key = String(r.quizKey || '').slice(0, 40);
  if (!/^ch\d{2}_lo\d+$/.test(key) || key.slice(0, 4) !== R.row[A.SHEET]) return {ok: false, code: 'bad', msg: 'Unknown test.'};
  var d = data_(R.row);
  if (d[key]) return {ok: true, duplicate: true, record: d[key]};
  var now = new Date(), tz = Session.getScriptTimeZone();
  var rec = {quiz: String(r.quizName || key).slice(0, 120), status: 'Completed',
    date: Utilities.formatDate(now, tz, 'yyyy-MM-dd'), time: Utilities.formatDate(now, tz, 'HH:mm:ss'),
    score: Number(r.score) || 0, total: Number(r.total) || 0};
  d[key] = rec;
  var keys = Object.keys(d).sort(function (a, b) { return parseInt(a.split('_lo')[1], 10) - parseInt(b.split('_lo')[1], 10); });
  var marks = keys.map(function (k) { return 'LO' + k.split('_lo')[1] + ' ' + d[k].score + '/' + d[k].total; }).join(' · ');
  R.sh.getRange(R.n, A.DATA + 1).setValue(JSON.stringify(d));
  R.sh.getRange(R.n, A.TESTS + 1).setValue(marks);
  R.sh.getRange(R.n, A.LAST + 1).setValue(now);
  var total = Math.max(1, Number(r.totalTests) || 0), finished = keys.length >= total;
  if (finished) { R.sh.getRange(R.n, A.STATUS + 1).setValue('finished'); R.sh.getRange(R.n, A.FINISHED + 1).setValue(now); }
  var L = findLogin_(String(R.row[A.LOGIN]).toUpperCase()) || [];
  var q = tab_('Quiz Records');
  if (q) q.appendRow([String(L[2] || R.row[A.LOGIN]), rec.quiz, rec.status, rec.date, rec.time, String(R.row[A.LOGIN]), key, rec.score, rec.total]);
  return {ok: true, record: rec, finished: finished};
}

/* ---------------- helpers ---------------- */
function tab_(name) { return SpreadsheetApp.getActive().getSheetByName(name); }
function findLogin_(id) {
  var v = tab_('Logins').getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][0]).trim().toUpperCase() === id) return v[i];
  return null;
}
function folder_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('CONTENT_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var it = DriveApp.getFoldersByName(CONTENT_FOLDER_NAME), f = it.hasNext() ? it.next() : DriveApp.createFolder(CONTENT_FOLDER_NAME);
  p.setProperty('CONTENT_FOLDER_ID', f.getId());
  return f;
}
function content_(sheet) {
  var c = CacheService.getScriptCache(), key = 'c_' + sheet, parts = c.get(key + '_n');
  if (parts) { var s = ''; for (var k = 0; k < +parts; k++) { var p = c.get(key + '_' + k); if (p === null) { s = null; break; } s += p; } if (s) return s; }
  var it = folder_().getFilesByName(sheet + '.html');
  if (!it.hasNext()) return null;
  var html = it.next().getBlob().getDataAsString('UTF-8'), size = 90000, n = Math.ceil(html.length / size);
  try { var obj = {}; for (var j = 0; j < n; j++) obj[key + '_' + j] = html.substr(j * size, size); obj[key + '_n'] = String(n); c.putAll(obj, 21600); } catch (e) {}
  return html;
}

/* ---------------- teacher menu ---------------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Sopaan')
    .addItem('1 · Set up tabs', 'setupTabs')
    .addItem('2 · Create logins…', 'createLogins')
    .addItem('Reset the selected attempt', 'resetAttempt')
    .addSeparator()
    .addItem('Import chapter files…', 'importContentPrompt')
    .addToUi();
}
function setupTabs() {
  var ss = SpreadsheetApp.getActive();
  function mk(name, head) { var s = ss.getSheetByName(name) || ss.insertSheet(name); if (!s.getRange(1, 1).getValue()) { s.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#4C1D95').setFontColor('#ffffff'); s.setFrozenRows(1); } return s; }
  mk('Logins', ['Login ID', 'PIN', 'Student name', 'Sheets (e.g. ch05, ch06 or ALL)', 'Notes']).getRange('B:B').setNumberFormat('@');
  mk('Attempts', ['Login ID', 'Sheet', 'Status', 'Device', 'Started', 'Last seen', 'Progress', 'Test marks', 'Finished', 'Token', 'Test data']);
  var q = mk('Quiz Records', ['User Name', 'Quiz Name', 'Completion Status', 'Completion Date', 'Completion Time', 'Login ID', 'Quiz Key', 'Score', 'Total']);
  q.getRange('D:E').setNumberFormat('@');
  var p = mk('Products', ['Sheet code', 'Name']);
  if (p.getLastRow() < 2) p.getRange(2, 1, SHEET_IDS.length, 2).setValues(SHEET_IDS.map(function (s) { return [s, NAMES[s]]; }));
  folder_();
  try { SpreadsheetApp.getUi().alert('Tabs are ready. Add logins in the Logins tab, or use Sopaan › Create logins.'); } catch (e) {}
}
function createLogins() {
  var ui = SpreadsheetApp.getUi();
  var a = ui.prompt('Create logins', 'How many logins?', ui.ButtonSet.OK_CANCEL); if (a.getSelectedButton() !== ui.Button.OK) return;
  var n = Math.min(500, Math.max(1, parseInt(a.getResponseText(), 10) || 0));
  var b = ui.prompt('Create logins', 'Which chapters do they open? Use codes separated by commas (ch01 … ch14, see the Products tab), or ALL.', ui.ButtonSet.OK_CANCEL); if (b.getSelectedButton() !== ui.Button.OK) return;
  var sheets = b.getResponseText().trim() || 'ALL';
  var s = tab_('Logins'), have = {}; s.getDataRange().getValues().forEach(function (r) { have[String(r[0]).toUpperCase()] = 1; });
  var rows = [], chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  while (rows.length < n) {
    var id = 'S9'; for (var k = 0; k < 6; k++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    if (have[id]) continue; have[id] = 1;
    rows.push([id, String(Math.floor(1000 + Math.random() * 9000)), '', sheets, 'created ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')]);
  }
  s.getRange(s.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
  s.getRange(2, 2, s.getLastRow() - 1, 1).setNumberFormat('@');
  ui.alert(n + ' logins added to the Logins tab. Type each student\'s name in column C when you hand out a login.');
}
function resetAttempt() {
  var s = SpreadsheetApp.getActiveSheet(), ui = SpreadsheetApp.getUi();
  if (s.getName() !== 'Attempts') { ui.alert('Open the Attempts tab and click a cell in the row you want to reset.'); return; }
  var r = s.getActiveCell().getRow(); if (r < 2) return;
  var v = s.getRange(r, 1, 1, 2).getValues()[0];
  if (ui.alert('Reset attempt', 'Delete the attempt of ' + v[0] + ' for ' + v[1] + '? The login can then start this chapter again on any device, and its LO tests open again.', ui.ButtonSet.YES_NO) === ui.Button.YES) s.deleteRow(r);
}

/** Copies ch01.html … ch14.html into the Drive folder from one commit of the GitHub repo. */
function importContentPrompt() {
  var ui = SpreadsheetApp.getUi();
  var a = ui.prompt('Import chapter files', 'Commit code to import from (leave as given by Claude):', ui.ButtonSet.OK_CANCEL); if (a.getSelectedButton() !== ui.Button.OK) return;
  ui.alert(importContent(a.getResponseText().trim()));
}
function importContent(commit) {
  if (!/^[0-9a-f]{7,40}$/.test(commit || '')) return 'That is not a commit code.';
  var f = folder_(), done = [];
  SHEET_IDS.forEach(function (s) {
    var res = UrlFetchApp.fetch(CONTENT_SOURCE + commit + '/content/' + s + '.html', {muteHttpExceptions: true});
    if (res.getResponseCode() !== 200) return;
    var old = f.getFilesByName(s + '.html'); while (old.hasNext()) old.next().setTrashed(true);
    f.createFile(s + '.html', res.getContentText('UTF-8'), MimeType.HTML);
    CacheService.getScriptCache().remove('c_' + s + '_n');
    done.push(s);
  });
  return 'Imported ' + done.length + ' of ' + SHEET_IDS.length + ' chapter files into "' + CONTENT_FOLDER_NAME + '"' + (done.length ? ': ' + done.join(', ') : '.');
}
