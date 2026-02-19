
/**
 * OFFICIAL ATTENDANCE & DYNAMIC SUMMARY SCRIPT v16.6
 * 
 * CORE RULES:
 * 1. Sign-In <= 09:10 IST -> "P" (Present)
 * 2. Sign-In 09:11 - 09:30 -> "Late"
 * 3. Sign-In > 09:30 -> "Half Day"
 * 4. Absent (A) = 2 Days Deduction in Salary Days (SD).
 * 5. PL Carry Forward: 1 PL added per month + Carry from previous month.
 * 6. Dynamic Summary: Rows 14-21 auto-calculate from rows 4-11 status.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // FORCE IST TIMEZONE
    var now = new Date();
    var timeStr = Utilities.formatDate(now, "Asia/Kolkata", "HH:mm");
    
    // Match Sheet for Current Month
    var monthNames = ["JANUARY", "FEBURARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    var targetMonth = monthNames[now.getMonth()];
    var sheets = ss.getSheets();
    var sheet = null;
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().toUpperCase().indexOf(targetMonth) !== -1) {
        sheet = sheets[i]; break;
      }
    }
    if (!sheet) sheet = sheets[0];

    // Previous Month for RPL Carry Forward
    var prevMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    var prevSheet = ss.getSheetByName(monthNames[prevMonthIdx] + " " + (now.getMonth() === 0 ? now.getFullYear()-1 : now.getFullYear()));

    var dateHeader = data.dateHeader; // e.g., "18-Feb"
    var employeeName = (data.employee || "").trim();

    // LOCATE ANCHOR (Sign In Column for given Date)
    var lastCol = sheet.getLastColumn();
    var dateRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var subHeaders = sheet.getRange(3, 1, 1, lastCol).getValues()[0];
    var anchorCol = -1;

    for (var c = 0; c < lastCol; c++) {
      var cellVal = dateRow[c];
      var fmt = (cellVal instanceof Date) ? Utilities.formatDate(cellVal, "Asia/Kolkata", "dd-MMM") : cellVal;
      if (fmt === dateHeader) {
        // Confirm "Sign In" subheader to avoid column drift
        for (var k = c; k < c + 4; k++) {
          if (subHeaders[k] && subHeaders[k].toString().toLowerCase().includes("sign in")) {
            anchorCol = k + 1; break;
          }
        }
        if (anchorCol !== -1) break;
      }
    }

    // LOCATE EMPLOYEE ROW
    var names = sheet.getRange("B4:B11").getValues();
    var rowIndex = -1;
    for (var r = 0; r < names.length; r++) {
      if (names[r][0].toString().trim().toLowerCase() === employeeName.toLowerCase()) {
        rowIndex = r + 4; break;
      }
    }

    // PROCESS ACTIONS
    if (anchorCol !== -1 && rowIndex !== -1) {
      var colIn = anchorCol;
      var colOut = anchorCol + 1;
      var colTT = anchorCol + 2;
      var colStatus = anchorCol + 3;

      if (data.action === "signIn") {
        sheet.getRange(rowIndex, colIn).setValue(timeStr);
        // Automatic Status Determination
        var parts = timeStr.split(':');
        var m = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        var status = "P";
        if (m > 9 * 60 + 30) status = "Half Day";
        else if (m > 9 * 60 + 10) status = "Late";
        
        sheet.getRange(rowIndex, colStatus).setValue(status);
        sheet.getRange(rowIndex, colOut).clearContent();
        sheet.getRange(rowIndex, colTT).clearContent();
      } 
      else if (data.action === "signOut") {
        sheet.getRange(rowIndex, colOut).setValue(timeStr);
        var signInTime = sheet.getRange(rowIndex, colIn).getValue();
        if (signInTime) {
          sheet.getRange(rowIndex, colTT).setValue(calculateDiff(signInTime, timeStr));
        }
      } 
      else if (data.action === "adminMarkLeave") {
        // ADMIN DIRECT OVERRIDE: Must ONLY update Status column
        sheet.getRange(rowIndex, colStatus).setValue(data.status);
        // Clear misplaced data if any
        sheet.getRange(rowIndex, colIn).clearContent();
        sheet.getRange(rowIndex, colOut).clearContent();
        sheet.getRange(rowIndex, colTT).clearContent();
      }
    }

    // REFRESH FULL DYNAMIC SUMMARY (Rows 14-21)
    refreshDynamicSummary(sheet, prevSheet);

    return ContentService.createTextOutput("Success");
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message);
  }
}

function calculateDiff(start, end) {
  try {
    var s = start.toString().split(':');
    var e = end.toString().split(':');
    var d1 = new Date(0,0,0, s[0], s[1], 0);
    var d2 = new Date(0,0,0, e[0], e[1], 0);
    var diff = d2.getTime() - d1.getTime();
    if (diff < 0) diff += 24*60*60*1000;
    var h = Math.floor(diff/1000/60/60);
    var m = Math.floor((diff/1000/60)%60);
    return h + ":" + (m < 10 ? "0" + m : m);
  } catch(e) { return "0:00"; }
}

function refreshDynamicSummary(sheet, prevSheet) {
  var lastCol = sheet.getLastColumn();
  var subHeaders = sheet.getRange(3, 1, 1, lastCol).getValues()[0];
  var attendance = sheet.getRange(4, 1, 8, lastCol).getValues();
  var summaryTable = [];
  
  // Get RPL from Prev Month (Col J, Rows 14-21)
  var prevRPL = prevSheet ? prevSheet.getRange("J14:J21").getValues() : [];

  for (var r = 0; r < 8; r++) {
    var counts = { P: 0, A: 0, PL: 0, UL: 0, SL: 0, OH: 0, WEH: 0, HD: 0, LATE: 0 };
    
    // FULL SCAN of Row 3 for Status columns
    for (var col = 0; col < lastCol; col++) {
      if (subHeaders[col] && subHeaders[col].toString().toLowerCase().includes("status")) {
        var status = (attendance[r][col] || "").toString().trim().toUpperCase();
        
        // Match status code
        if (status === "P" || status === "PRESENT") counts.P++;
        else if (status === "A" || status === "ABSENT") counts.A++;
        else if (status === "PL" || status === "PAID LEAVE") counts.PL++;
        else if (status === "UL" || status === "UNPAID LEAVE") counts.UL++;
        else if (status === "SL" || status === "SICK LEAVE") counts.SL++;
        else if (status === "OH" || status === "OFFICE HOLIDAY") counts.OH++;
        else if (status === "WEH" || status === "WEEKEND OFF" || status === "WEEK-END OFF") counts.WEH++;
        else if (status === "HD" || status === "HALF DAY") counts.HD++;
        else if (status === "LATE") counts.LATE++;
      }
    }

    // 1 PL per month + Carry forward
    var carry = (prevRPL.length > 0 && !isNaN(prevRPL[r][0])) ? prevRPL[r][0] : 0;
    var rpl = (1 + carry) - counts.PL;
    
    // Salary Days (SD): Absent (A) counts as 2 days deduction
    var sd = 30 - (counts.A * 2) - counts.UL - (counts.HD * 0.5);
    
    // Total Salary Days (TSD)
    var tsd = sd + counts.OH + counts.WEH;

    summaryTable.push([
      counts.P, counts.A, counts.PL, counts.UL, counts.SL, rpl, sd, counts.OH, tsd, counts.HD, counts.LATE
    ]);
  }
  
  // Write result back to Summary Table: E14:O21
  sheet.getRange(14, 5, 8, 11).setValues(summaryTable);
}
