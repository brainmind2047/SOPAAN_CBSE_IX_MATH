# Sopaan Class 9: logins, locks and records

This works the same way as the Class 10 program:
- You give each student a **Login ID and PIN**.
- The student opens the site, picks a chapter and signs in.
- The server checks the login and sends that chapter's sheet.

## Rules
- **One attempt per chapter, on one device.** If the student closes the page, they can sign in again on the same device and carry on. Their answers are saved on that device.
- **Each 30-minute LO test can be submitted once.** When every LO test of the chapter is submitted, the attempt is **finished**, and that login can't open the chapter again.
- **Name:** the student's name comes from your Logins tab, never from what they type.

## Where things live
| What | Where |
|---|---|
| Logins, attempts, records | Google Sheet https://docs.google.com/spreadsheets/d/1mm6mCNhvse0DnForcc1HuOCLWsllwakb39i-a2Uuv60/edit, in the tabs **Logins**, **Attempts**, **Quiz Records** and **Products** |
| Server | Apps Script bound to that sheet (`apps-script/Server.gs`), deployed as a Web app: Execute as **Me** · Who has access **Anyone** |
| Chapter sheets | Google Drive folder **Sopaan Class 9 Maths · chapter files** (`ch01.html` … `ch14.html`) |
| Login page | `index.html` in this repo, on GitHub Pages |

## Teacher guide (in the Google Sheet, use the **Sopaan** menu)
- **Create logins:** choose Sopaan › 2 · Create logins…, enter how many, then which chapters they open (for example `ch01, ch02`, or `ALL`). Type each student's name in column C before you hand out the ID and PIN. You can also type logins in by hand.
- **See progress:** check the **Attempts** tab. It shows one row per login per chapter, with Status, Device, Last seen, Progress and Test marks.
- **See results:** check the **Quiz Records** tab. It gets one row per LO test submitted: User Name · Quiz Name · Completion Status · Completion Date · Completion Time · Login ID · Quiz Key · Score · Total.
- **Allow a new attempt:** in the Attempts tab, click the student's row, then choose Sopaan › Reset the selected attempt. They can then start that chapter again on any device, and its LO tests open again.
- **Block a login:** delete the row from Logins, or change its PIN.
- **Update the chapter files:** choose Sopaan › Import chapter files… and enter the commit code Claude gives you, or replace the files in the Drive folder by hand.
