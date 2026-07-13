# Ticket inventory Google Sheets backup

This Google Apps Script receives ticket inventory events from the Supabase
database trigger and writes them to the native Google Sheet:

`SK Lalo 2026 - Ticket Inventory Backup`

## Google Apps Script setup

1. Open the backup spreadsheet and create a bound Apps Script project.
2. Replace `Code.gs` with this directory's `Code.gs`.
3. Add a Script Property named `TICKET_BACKUP_SECRET` with a strong random value.
4. Deploy as a Web app, execute as the owner, and allow access to anyone.
5. Store the deployment URL and the same secret in Supabase Vault as
   `ticket_backup_webhook_url` and `ticket_backup_webhook_secret`.

Never commit the shared secret or paste it into browser-side application code.

## Supabase setup

Run `supabase/migrations/20260713000000_ticket_google_sheets_backup.sql`, then
create the two Vault secrets. To mirror existing ticket entries after setup:

```sql
select private.backfill_ticket_google_sheets_backup();
```

The `Ticket Inventory` tab keeps one current row per ticket ID. The `Audit Log`
tab keeps every insert, update, delete, and backfill event for recovery.
