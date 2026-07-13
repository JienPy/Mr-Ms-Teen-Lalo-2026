const TICKET_BACKUP = Object.freeze({
  spreadsheetName: "SK Lalo 2026 - Ticket Inventory Backup",
  guideSheet: "Guide",
  inventorySheet: "Ticket Inventory",
  auditSheet: "Audit Log",
  secretProperty: "TICKET_BACKUP_SECRET",
  spreadsheetIdProperty: "TICKET_BACKUP_SPREADSHEET_ID",
});

const INVENTORY_HEADERS = Object.freeze([
  "Ticket ID",
  "Sync Status",
  "Candidate ID",
  "Candidate Name",
  "Division",
  "Sitio",
  "Quantity Issued",
  "Serial From",
  "Serial To",
  "Entry Date",
  "Published",
  "Published At",
  "Remitted Quantity",
  "Remaining Quantity",
  "Remittance Date",
  "Remittance Note",
  "General Note",
  "Created At",
  "Last Synced At",
  "Deleted At",
  "Last Event ID",
]);

const AUDIT_HEADERS = Object.freeze([
  "Event ID",
  "Operation",
  "Ticket ID",
  "Candidate ID",
  "Candidate Name",
  "Division",
  "Sitio",
  "Quantity Issued",
  "Serial From",
  "Serial To",
  "Entry Date",
  "Published",
  "Published At",
  "Remitted Quantity",
  "Remaining Quantity",
  "Remittance Date",
  "Remittance Note",
  "General Note",
  "Created At",
  "Received At",
  "Record JSON",
]);

function setupTicketBackup() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheet = null;
  const savedSpreadsheetId = properties.getProperty(
    TICKET_BACKUP.spreadsheetIdProperty,
  );

  if (savedSpreadsheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(savedSpreadsheetId);
    } catch (error) {
      console.warn("Saved spreadsheet is unavailable; creating a new one.");
    }
  }

  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create(TICKET_BACKUP.spreadsheetName);
  }

  buildBackupWorkbook(spreadsheet);

  const secret =
    properties.getProperty(TICKET_BACKUP.secretProperty) ||
    `${Utilities.getUuid().replace(/-/g, "")}${Utilities.getUuid().replace(/-/g, "")}`;

  properties.setProperties({
    [TICKET_BACKUP.spreadsheetIdProperty]: spreadsheet.getId(),
    [TICKET_BACKUP.secretProperty]: secret,
  });

  const setup = {
    spreadsheet_url: spreadsheet.getUrl(),
    spreadsheet_id: spreadsheet.getId(),
    webhook_secret: secret,
  };

  console.log(JSON.stringify(setup, null, 2));
  return setup;
}

function getTicketBackupSetup() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty(
    TICKET_BACKUP.spreadsheetIdProperty,
  );
  const secret = properties.getProperty(TICKET_BACKUP.secretProperty);

  if (!spreadsheetId || !secret) {
    throw new Error("Run setupTicketBackup first");
  }

  const setup = {
    spreadsheet_url: SpreadsheetApp.openById(spreadsheetId).getUrl(),
    spreadsheet_id: spreadsheetId,
    webhook_secret: secret,
  };
  console.log(JSON.stringify(setup, null, 2));
  return setup;
}

function buildBackupWorkbook(spreadsheet) {
  const sheets = spreadsheet.getSheets();
  let guide = spreadsheet.getSheetByName(TICKET_BACKUP.guideSheet);

  if (!guide && sheets.length === 1 && sheets[0].getLastRow() === 0) {
    guide = sheets[0].setName(TICKET_BACKUP.guideSheet);
  }
  if (!guide) guide = spreadsheet.insertSheet(TICKET_BACKUP.guideSheet, 0);

  const inventory =
    spreadsheet.getSheetByName(TICKET_BACKUP.inventorySheet) ||
    spreadsheet.insertSheet(TICKET_BACKUP.inventorySheet);
  const audit =
    spreadsheet.getSheetByName(TICKET_BACKUP.auditSheet) ||
    spreadsheet.insertSheet(TICKET_BACKUP.auditSheet);

  setupGuideSheet(guide);
  setupDataSheet(inventory, INVENTORY_HEADERS);
  setupDataSheet(audit, AUDIT_HEADERS);
}

function setupGuideSheet(sheet) {
  sheet.clear();
  sheet.setHiddenGridlines(true);
  sheet.getRange("A1:F1").breakApart().merge();
  sheet
    .getRange("A1")
    .setValue("SK Lalo Ticket Inventory Backup")
    .setFontWeight("bold")
    .setFontSize(16)
    .setFontColor("#111827")
    .setBackground("#e5e7eb");
  sheet.setRowHeight(1, 34);
  sheet.getRange("A3:B7").setValues([
    [
      "Purpose",
      "Automatic backup of the admin ticket inventory from Supabase.",
    ],
    [
      "Ticket Inventory",
      "Latest state of every ticket entry, one row per Ticket ID.",
    ],
    ["Audit Log", "Append-only history of INSERT, UPDATE, and DELETE events."],
    ["Recovery", "Use Ticket ID as the unique key when restoring records."],
    ["Important", "Do not rename the two data tabs or their header columns."],
  ]);
  sheet
    .getRange("A3:A7")
    .setFontWeight("bold")
    .setFontColor("#111827")
    .setBackground("#f3f4f6");
  sheet.getRange("A3:B7").setWrap(true);
  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 520);
}

function setupDataSheet(sheet, headers) {
  const existingHeaders = sheet
    .getRange(1, 1, 1, headers.length)
    .getDisplayValues()[0];
  const hasExistingData = sheet.getLastRow() > 1;
  const headersMatch = headers.every(
    (header, index) =>
      !existingHeaders[index] || existingHeaders[index] === header,
  );

  if (!headersMatch && hasExistingData) {
    throw new Error(`Unexpected headers in ${sheet.getName()}`);
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet
    .getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setFontColor("#111827")
    .setBackground("#e5e7eb")
    .setWrap(true)
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 34);
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, headers.length, 130);
  sheet.setColumnWidth(
    headers.length,
    sheet.getName() === TICKET_BACKUP.auditSheet ? 360 : 250,
  );
}

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    if (!lock.tryLock(10000)) {
      return jsonResponse({ ok: false, error: "backup_busy" });
    }

    const payload = JSON.parse(event?.postData?.contents || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      TICKET_BACKUP.secretProperty,
    );

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "unauthorized" });
    }

    const eventId = requiredText(payload.event_id, "event_id");
    const operation = requiredText(
      payload.operation,
      "operation",
    ).toUpperCase();
    const record = payload.record || {};
    const candidate = payload.candidate || {};
    const ticketId = requiredText(record.id, "record.id");

    if (!["INSERT", "UPDATE", "DELETE", "BACKFILL"].includes(operation)) {
      throw new Error("Unsupported operation");
    }

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty(
      TICKET_BACKUP.spreadsheetIdProperty,
    );
    if (!spreadsheetId) throw new Error("Missing backup spreadsheet ID");

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const inventorySheet = requiredSheet(
      spreadsheet,
      TICKET_BACKUP.inventorySheet,
    );
    const auditSheet = requiredSheet(spreadsheet, TICKET_BACKUP.auditSheet);

    if (eventAlreadyRecorded(auditSheet, eventId)) {
      return jsonResponse({ ok: true, duplicate: true, event_id: eventId });
    }

    const receivedAt = new Date();
    auditSheet.appendRow(
      auditRow(eventId, operation, record, candidate, receivedAt),
    );
    upsertInventory(
      inventorySheet,
      eventId,
      operation,
      record,
      candidate,
      receivedAt,
    );
    SpreadsheetApp.flush();

    return jsonResponse({ ok: true, event_id: eventId, ticket_id: ticketId });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: String(error.message || error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function eventAlreadyRecorded(sheet, eventId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  return Boolean(
    sheet
      .getRange(2, 1, lastRow - 1, 1)
      .createTextFinder(eventId)
      .matchEntireCell(true)
      .findNext(),
  );
}

function upsertInventory(
  sheet,
  eventId,
  operation,
  record,
  candidate,
  receivedAt,
) {
  const ticketId = requiredText(record.id, "record.id");
  const lastRow = sheet.getLastRow();
  let targetRow = lastRow + 1;

  if (lastRow >= 2) {
    const existing = sheet
      .getRange(2, 1, lastRow - 1, 1)
      .createTextFinder(ticketId)
      .matchEntireCell(true)
      .findNext();
    if (existing) targetRow = existing.getRow();
  }

  sheet
    .getRange(targetRow, 1, 1, 21)
    .setValues([
      inventoryRow(eventId, operation, record, candidate, receivedAt),
    ]);
}

function inventoryRow(eventId, operation, record, candidate, receivedAt) {
  const deleted = operation === "DELETE";
  const quantity = numberOrZero(record.quantity);
  const remitted = numberOrZero(record.remitted_quantity);

  return sanitizeRow([
    record.id,
    deleted ? "DELETED" : "ACTIVE",
    record.candidate_id,
    candidate.name,
    candidate.division,
    candidate.sitio,
    quantity,
    record.serial_from,
    record.serial_to,
    record.entry_date,
    Boolean(record.is_published),
    record.published_at,
    remitted,
    Math.max(quantity - remitted, 0),
    record.remittance_date,
    record.remittance_note,
    record.note,
    record.created_at,
    receivedAt,
    deleted ? receivedAt : "",
    eventId,
  ]);
}

function auditRow(eventId, operation, record, candidate, receivedAt) {
  const quantity = numberOrZero(record.quantity);
  const remitted = numberOrZero(record.remitted_quantity);

  return sanitizeRow([
    eventId,
    operation,
    record.id,
    record.candidate_id,
    candidate.name,
    candidate.division,
    candidate.sitio,
    quantity,
    record.serial_from,
    record.serial_to,
    record.entry_date,
    Boolean(record.is_published),
    record.published_at,
    remitted,
    Math.max(quantity - remitted, 0),
    record.remittance_date,
    record.remittance_note,
    record.note,
    record.created_at,
    receivedAt,
    JSON.stringify(record),
  ]);
}

function sanitizeRow(values) {
  return values.map((value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" && /^[=+\-@]/.test(value)) return `'${value}`;
    return value;
  });
}

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function requiredText(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${name}`);
  }
  return value.trim();
}

function requiredSheet(spreadsheet, name) {
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error(`Missing sheet: ${name}`);
  return sheet;
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
