# Setup: Gmail sign-in and the Quiz Records sheet

This setup is already done. Your links are in `sopaan-config.js`. This page records how it works and how to redo it. No Google Cloud project or Client ID is needed.

## The pieces
| Piece | Where it lives | Deployed as |
|---|---|---|
| **Quiz Records** sheet | https://docs.google.com/spreadsheets/d/1mm6mCNhvse0DnForcc1HuOCLWsllwakb39i-a2Uuv60/edit | – |
| **Records script** (`apps-script/Code.gs`) | Apps Script project bound to the sheet | Web app · Execute as **Me** · Access **Anyone** |
| **Sopaan Sign-in** (`apps-script/Signin.gs`) | Separate Apps Script project "Sopaan Sign-in" | Two web-app deployments: **Sign-in** (Execute as **User accessing the web app** · Access **Anyone with Google account**) and **Lookup** (Execute as **Me** · Access **Anyone**) |

## How sign-in works
1. A student presses **Sign in with Google** on the site. That opens the Sign-in link.
2. Google confirms which Gmail account they are using. The first time, Google asks the student to allow "see your email address".
3. The student presses **Continue to Sopaan**. They return to the site with a one-time session code that lasts 6 hours.
4. When a test is started or submitted, the records script asks the Lookup link which Gmail account the code belongs to, then writes or reads that student's rows. A name typed into a form is never used. The name in the sheet comes from the student's Gmail address.

## Records
- Each LO test can be taken once.
- When a test is submitted, a row is added to the **Quiz Records** tab with these columns: User Name · Quiz Name · Completion Status · Completion Date · Completion Time · Email · Quiz Key · Score · Total.
- **To allow a retake:** delete that student's row for that test.
- **To limit sign-in to some accounts:** set `ALLOWED_DOMAINS` in the records script, for example `['yourschool.in']`, then go to **Deploy › Manage deployments › Edit › New version**.

## Changing a script later
Edit the script, then go to **Deploy › Manage deployments › ✏️ › Version: New version › Deploy**. The links stay the same.

## GitHub Pages
Open **Settings › Pages** in the repo. Set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**.

The site is at `https://brainmind2047.github.io/sopaan_cbse_ix_math/`.
