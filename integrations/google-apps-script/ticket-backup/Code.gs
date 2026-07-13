const TICKET_BACKUP = Object.freeze({
  spreadsheetId: "1klO9b_CLxcZpW6iwB3cBQypycLb90GMyG4mN-Zaq52s",
  inventorySheet: "Ticket Inventory",
  auditSheet: "Audit Log",
  secretProperty: "TICKET_BACKUP_SECRET",
});

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

    const spreadsheet = SpreadsheetApp.openById(TICKET_BACKUP.spreadsheetId);
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
