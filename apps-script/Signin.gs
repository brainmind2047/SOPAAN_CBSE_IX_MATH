/**
 * Sopaan Sign-in — a small, separate Apps Script project.
 *
 * It tells the Sopaan site which Gmail account the student is signed in with.
 * Deploy it twice (Deploy > New deployment > Web app):
 *   1. Sign-in:  Execute as "User accessing the web app", Who has access "Anyone with Google account".
 *   2. Lookup:   Execute as "Me", Who has access "Anyone".
 * The student opens the Sign-in link; Google shows who they are; they get a one-time session code
 * (kept here for 6 hours). The records script asks the Lookup link which account a code belongs to.
 * This script asks the student only for permission to see their email address.
 */
const RETURN_PREFIX = 'https://brainmind2047.github.io/';
const SESSION_SECONDS = 21600; // 6 hours (the longest Apps Script's cache keeps anything)

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.lookup) {
    const v = CacheService.getScriptCache().get('s_' + String(p.lookup).replace(/[^a-f0-9]/g, '').slice(0, 64));
    const out = v ? Object.assign({ ok: true }, JSON.parse(v)) : { ok: false, error: 'session_expired' };
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  }
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  const ret = String(p.return || '');
  if (!email) return page_('Sign-in is not available here', '<p>Open the Sopaan site and press <b>Sign in with Google</b>.</p>');
  if (ret.indexOf(RETURN_PREFIX) !== 0) return page_('Wrong address', '<p>This sign-in only works from the Sopaan site.</p>');
  const code = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put('s_' + code, JSON.stringify({ email: email, name: nameFrom_(email) }), SESSION_SECONDS);
  const url = ret.split('#')[0] + '#sopaan=' + code;
  return page_('Signed in as ' + esc_(email),
    '<p>You are signed in with Google.</p><p><a class="go" target="_top" href="' + esc_(url) + '">Continue to Sopaan →</a></p>' +
    '<p class="small">Not you? Switch to the right Gmail account in this browser, then sign in again from the Sopaan site.</p>');
}

function nameFrom_(email) {
  return email.split('@')[0].replace(/[0-9]+/g, ' ').split(/[._\-+\s]+/).filter(String)
    .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ') || email;
}
function esc_(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function page_(title, body) {
  return HtmlService.createHtmlOutput('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>' +
    'body{font:17px/1.5 system-ui,sans-serif;background:#F5F3FF;color:#1E2235;margin:0;padding:32px 16px}' +
    '.c{max-width:460px;margin:0 auto;background:#fff;border-radius:18px;padding:24px;box-shadow:0 6px 24px rgba(76,29,149,.12)}' +
    'h1{font-size:22px;margin:0 0 8px;color:#5B21B6}.go{display:inline-block;background:#7C3AED;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px}' +
    '.small{font-size:14px;color:#555}</style></head><body><div class="c"><h1>' + title + '</h1>' + body + '</div></body></html>')
    .setTitle('Sopaan Sign-in').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
