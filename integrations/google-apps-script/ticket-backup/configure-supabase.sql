-- Run the migration first:
-- supabase/migrations/20260713000000_ticket_google_sheets_backup.sql
--
-- Then replace both placeholders below with the values from Apps Script.

SELECT vault.create_secret(
  'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE',
  'ticket_backup_webhook_url',
  'SK Lalo ticket backup web app URL'
);

SELECT vault.create_secret(
  'PASTE_WEBHOOK_SECRET_HERE',
  'ticket_backup_webhook_secret',
  'SK Lalo ticket backup shared secret'
);

-- Queue all existing ticket entries after the connection is configured.
SELECT private.backfill_ticket_google_sheets_backup();
