# Setup: Gmail sign-in and the Quiz Records sheet

This takes about 10 minutes, and you only do it once.

## 1. Make the Google Sheet and its script
1. Open the records sheet: https://docs.google.com/spreadsheets/d/1mm6mCNhvse0DnForcc1HuOCLWsllwakb39i-a2Uuv60/edit (its ID is already in Code.gs).
2. In the sheet, open **Extensions › Apps Script**. Delete the starter code, then paste in all of `apps-script/Code.gs`.
3. Leave the script open. You'll paste the Client ID into it in step 2.

## 2. Create a Google sign-in Client ID
1. Go to https://console.cloud.google.com/ and create a project (any name).
2. Open **APIs & Services › OAuth consent screen**. Choose **External**, fill in the app name and your email, then save. Under **Audience**, click **Publish app** so any student's Gmail account can sign in.
3. Open **APIs & Services › Credentials › Create credentials › OAuth client ID**:
   - Application type: **Web application**
   - Authorised JavaScript origins: `https://brainmind2047.github.io`
4. Copy the **Client ID**. It ends with `.apps.googleusercontent.com`.
5. In the Apps Script editor, paste the Client ID into `CLIENT_ID` on line 15. Save.
6. `ADMIN_EMAIL` is already set to **ankitagarwal5986@gmail.com**, so the records sheet is shared with that account. In the editor, pick **setup** in the function menu and click **Run** once. This creates the "Quiz Records" tab and adds that account as an editor. If you create the sheet while signed in as ankitagarwal5986@gmail.com, you already own it and nothing extra is added.

## 3. Deploy the script
1. In Apps Script, click **Deploy › New deployment › Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
2. Click **Deploy** and allow the permissions it asks for. Copy the **Web app URL**. It ends with `/exec`.

## 4. Fill in the site config
1. Open `sopaan-config.js` in this repo and paste in both values:
   ```js
   window.SOPAAN_CONFIG = {
     googleClientId: '1234-abc.apps.googleusercontent.com',
     recordsUrl: 'https://script.google.com/macros/s/XXXX/exec'
   };
   ```
2. Commit the file.

## 5. Turn on GitHub Pages
In the repo, open **Settings › Pages**. Set Source to **Deploy from a branch**, Branch to **main**, folder **/ (root)**, then save.

The site appears at `https://brainmind2047.github.io/SOPAAN_CBSE_IX_MATH/`.

## Using it
- **Students:** they sign in with Gmail, then open a chapter. Each 30-minute LO test can be taken **once**. When a student submits, a row is added to **Quiz Records** with these columns:
  - User Name
  - Quiz Name
  - Completion Status
  - Completion Date
  - Completion Time
  - Email
  - Quiz Key
  - Score
  - Total
- **To allow a retake:** delete that student's row for that test in the sheet.
- **To limit sign-in to some accounts:** set `ALLOWED_DOMAINS` in Code.gs, for example `['yourschool.in']`, then deploy again (**Deploy › Manage deployments › Edit › New version**).
- **Why a student can't fake it:** the student's name always comes from their verified Google sign-in, and the server checks for an existing record before it accepts a submission.
- **Practice** (Learning mode) works without signing in to the sheet. Practice progress is saved in each student's browser.
