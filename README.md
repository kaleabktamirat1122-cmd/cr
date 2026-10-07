# Champion Properties Client Recognition System

**How it works:** Client scans QR → Netlify page opens → page sends the client ID to Google Apps Script → script looks up the Google Sheet → page shows Platinum, Gold or Bronze → client taps **VISIT CHAMPION PROPERTIES**.

The QR code and URL contain **only the client ID** (never the level). The backend decides the level, so editing the URL cannot change it.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page (loading screen, recognition card, invalid screen) |
| `css/style.css` | Design and the Platinum / Gold / Bronze colour themes |
| `js/main.js` | `API_URL`, level wording, API call and page logic |
| `assets/*-badge.svg` | Placeholder badges (replace with real artwork, keep filenames) |
| `apps-script/Code.gs` | Backend code for Google Apps Script |
| `qr-generator.html` | QR maker. Use on your computer only |
| `netlify.toml` | Netlify settings and security headers |

---

## Step 1. Create the Google Sheet
1. Go to https://sheets.google.com and create a new blank sheet. Name it `Champion Clients`.
2. Look at the browser address bar. The URL looks like:
   `https://docs.google.com/spreadsheets/d/1AbCdEfGh...XyZ/edit`
3. Copy the long part between `/d/` and `/edit`. This is your **Sheet ID**. Keep it for Step 2.

## Step 2. Add the backend code
1. In the sheet, click **Extensions → Apps Script**.
2. Delete everything in the editor.
3. Open `apps-script/Code.gs`, copy all of it, and paste it in.
4. At the top, replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with your Sheet ID (keep the quotes).
5. Leave `SHEET_NAME` as `"Clients"` unless you want a different tab name.
6. Click the **Save** icon.

## Step 3. Create the Clients tab
1. In the function dropdown at the top of the editor, choose **setupSheet**.
2. Click **Run**.
3. Click **Review permissions**, choose your Google account, then **Advanced → Go to project (unsafe) → Allow**. This is normal for your own scripts.
4. Go back to your sheet. You now have a **Clients** tab with these columns:
   Client ID, Client Name, Phone, Email, Level, Status, Created Date, Last Scan, Scan Count, Notes.
5. Three example clients are added:

| Client ID | Name | Level | Status |
|---|---|---|---|
| CP001 | Abebe Kebede | platinum | active |
| CP002 | Hana Tesfaye | gold | active |
| CP003 | Dawit Alemu | bronze | active |

Level only accepts `platinum`, `gold`, `bronze`. Status only accepts `active`, `inactive`.

## Step 4. Deploy the backend as a Web App
1. In Apps Script, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set **Execute as: Me**.
4. Set **Who has access: Anyone**.
5. Click **Deploy** and copy the **Web app URL**. It ends with `/exec`.

## Step 5. Test the backend
1. Paste this in a browser, using your URL:
   `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?client=CP001`
2. You should see:
   `{"success":true,"clientId":"CP001","clientName":"Abebe Kebede","level":"platinum"}`
3. Try `?client=ZZZ999`. You should see `{"success":false,"error":"CLIENT_NOT_FOUND"}`.
4. Check the sheet. CP001's **Scan Count** and **Last Scan** should have updated.

If you get an error page instead of JSON, redo Step 4 and check the access is set to **Anyone**.

## Step 6. Connect the website to the backend
1. Open `js/main.js`.
2. On line 2, replace the whole URL with your Web app URL:
   `const API_URL = "https://script.google.com/macros/s/xxxxxxxx/exec";`
3. Save. This is the only place the URL is stored.

## Step 7. Put the project on GitHub
1. Create a new repository on https://github.com (private is fine).
2. **Delete `qr-generator.html` from the project folder first** (or keep it out of the repo) so it is not public.
3. Upload all other files and folders, keeping the structure.

## Step 8. Deploy on Netlify
1. Go to https://app.netlify.com and click **Add new site → Import an existing project**.
2. Connect GitHub and choose your repository.
3. Leave **Build command** empty. Set **Publish directory** to `.` (already set in `netlify.toml`).
4. Click **Deploy**.
5. When it finishes, copy your site URL, for example `https://champion-clients.netlify.app`. You can rename it under **Site configuration → Change site name**.

## Step 9. Test the live site
Open these in your browser and on a phone:
- `https://YOUR-SITE.netlify.app/?client=CP001` shows **Platinum**
- `https://YOUR-SITE.netlify.app/?client=CP002` shows **Gold**
- `https://YOUR-SITE.netlify.app/?client=CP003` shows **Bronze**
- `https://YOUR-SITE.netlify.app/?client=ZZZ999` shows **CLIENT NOT FOUND**
- `https://YOUR-SITE.netlify.app/?client=CP001&level=bronze` still shows **Platinum**, because the URL level is ignored

Each page should have a **VISIT CHAMPION PROPERTIES** button that opens https://championpropertieset.com/ in a new tab.

## Step 10. Create the QR codes
1. On your computer, open `qr-generator.html` in a browser (double-click it).
2. Enter your Netlify URL (no trailing slash).
3. Type one client ID per line, for example `CP001`, `CP002`, `CP003`.
4. Click **Generate**. Right-click each QR and choose **Save image as**.
5. Scan each with a phone camera to confirm it opens the right page.

Each QR contains only `https://YOUR-SITE.netlify.app/?client=CP001`. No level is inside it.

## Managing clients
- **Add a client:** add a new row in the Clients tab with a unique Client ID, name, level (`platinum`/`gold`/`bronze`) and status `active`. Then generate their QR in Step 10.
- **Change level:** change the **Level** cell. It applies at the next scan.
- **Deactivate:** set **Status** to `inactive`. Their QR then shows CLIENT NOT FOUND.
- **Search and statistics:** use Ctrl+F in the sheet. **Scan Count** and **Last Scan** update automatically.
- Share the sheet only with trusted staff. There is no public admin page.

## Updating after changes
- **Backend code changed:** Apps Script → **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.
- **Website changed:** push to GitHub and Netlify redeploys automatically.

## Customising the brand
- Wording per level: `LEVELS` at the top of `js/main.js`.
- Colours: the `.theme-platinum`, `.theme-gold` and `.theme-bronze` lines at the top of `css/style.css`.
- Badges: replace the files in `assets/`.
- Fonts: the Google Fonts link in `index.html` and `--serif` / `--sans` in `style.css`.

## Troubleshooting
| Problem | Fix |
|---|---|
| Every QR shows CLIENT NOT FOUND | `API_URL` in `js/main.js` is still the placeholder, or the Step 4 access is not **Anyone** |
| Backend test returns a Google sign-in page | Redeploy with **Who has access: Anyone** |
| Sheet changes do not show | Level/Status must be exactly `platinum`/`gold`/`bronze` and `active` |
| Code edits have no effect | Create a **New version** in Manage deployments |
| Page stuck on loading | Check the browser console. The API times out after 10 seconds and shows CLIENT NOT FOUND |

## Security notes
- No keys or sheet credentials are in the frontend. The sheet is never exposed.
- The API returns only client ID, name and level. It never returns phone, email, notes or other clients.
- Client IDs are validated (letters, numbers, `-`, `_`, 2 to 20 characters) in both the page and the script.
- Names are displayed as plain text, not HTML.
- Simple IDs like `CP001` are guessable. For more privacy use longer IDs like `CP001-K7Q2X9`.
