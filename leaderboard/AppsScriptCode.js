function doGet() {
  // Replace with your actual Spreadsheet ID if not attached directly
  // const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  
  // If attached to the spreadsheet directly:
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Total');
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Sheet 'Total' not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Assuming the data is in columns A and B, starting from row 1 to row 4
  // as per the provided screenshot (A1: BMC, B1: 100, etc.)
  const dataRange = sheet.getRange("A1:B4");
  const values = dataRange.getValues();
  
  const result = values.map(row => {
    return {
      campus: row[0],
      points: row[1]
    };
  });
  
  // Add CORS headers to allow the React app to fetch the data
  const output = ContentService.createTextOutput(JSON.stringify(result));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // To handle CORS in Apps Script, you usually don't need extra headers for GET
  // if you use JSONP or handle it client side, but returning JSON is standard.
  return output;
}
