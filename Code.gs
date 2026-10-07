// ====== CONFIGURE ======
const SHEET_ID   = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE"; // from the sheet URL: /d/<THIS PART>/edit
const SHEET_NAME = "Clients";
// =======================
const LEVELS = ["platinum", "gold", "bronze"];
const ID_RE  = /^[A-Za-z0-9_-]{2,20}$/;
const COL = { ID:1, NAME:2, PHONE:3, EMAIL:4, LEVEL:5, STATUS:6, CREATED:7, LAST_SCAN:8, SCANS:9, NOTES:10 };

function doGet(e) {
  const id = e && e.parameter && e.parameter.client ? String(e.parameter.client).trim() : "";
  return json_(lookup_(id));
}

function lookup_(id) {
  if (!ID_RE.test(id)) return { success: false, error: "INVALID_CLIENT_ID" };
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const last = sheet.getLastRow();
    if (last < 2) return { success: false, error: "CLIENT_NOT_FOUND" };
    const ids = sheet.getRange(2, COL.ID, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim().toUpperCase() !== id.toUpperCase()) continue;
      const row = i + 2;
      const r = sheet.getRange(row, 1, 1, COL.NOTES).getValues()[0];
      const status = String(r[COL.STATUS - 1]).trim().toLowerCase();
      const level  = String(r[COL.LEVEL - 1]).trim().toLowerCase();
      if (status !== "active") return { success: false, error: "CLIENT_INACTIVE" };
      if (LEVELS.indexOf(level) === -1) return { success: false, error: "INVALID_LEVEL" };
      sheet.getRange(row, COL.LAST_SCAN).setValue(new Date());
      sheet.getRange(row, COL.SCANS).setValue((Number(r[COL.SCANS - 1]) || 0) + 1);
      // Return ONLY what the page needs.
      return { success: true, clientId: String(r[0]).trim(), clientName: String(r[COL.NAME - 1]).trim(), level: level };
    }
    return { success: false, error: "CLIENT_NOT_FOUND" };
  } catch (err) {
    return { success: false, error: "SERVER_ERROR" };
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

// ContentService JSON is readable cross-origin by fetch() from the Netlify site.
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor: creates headers, dropdown validation and 3 sample clients.
function setupSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, 10).setValues([["Client ID","Client Name","Phone","Email","Level","Status","Created Date","Last Scan","Scan Count","Notes"]]).setFontWeight("bold");
  sh.getRange("E2:E1000").setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["platinum","gold","bronze"], true).build());
  sh.getRange("F2:F1000").setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["active","inactive"], true).build());
  if (sh.getLastRow() < 2) {
    const now = new Date();
    sh.getRange(2, 1, 3, 10).setValues([
      ["CP001","Abebe Kebede","09XXXXXXXX","example@email.com","platinum","active",now,"",0,""],
      ["CP002","Hana Tesfaye","09XXXXXXXX","example@email.com","gold","active",now,"",0,""],
      ["CP003","Dawit Alemu","09XXXXXXXX","example@email.com","bronze","active",now,"",0,""]]);
  }
}
