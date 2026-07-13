# Ticket inventory Google Sheets backup

This standalone Google Apps Script creates the backup spreadsheet in the Google
account running the script, then receives ticket inventory events from the
Supabase database trigger.

`SK Lalo 2026 - Ticket Inventory Backup`

## Google Apps Script setup

1. Sign in to the intended Google account and open `script.google.com/create`.
2. Replace the default code with this directory's `Code.gs`.
3. Run `setupTicketBackup` once and approve the requested Google Sheets access.
4. Copy the spreadsheet URL and webhook secret from the execution log.
5. Deploy as a Web app, execute as the owner, and allow access to anyone.
6. Store the deployment URL and webhook secret in Supabase Vault as
   `ticket_backup_webhook_url` and `ticket_backup_webhook_secret`.

Running `setupTicketBackup` again reuses the same spreadsheet. Run
`getTicketBackupSetup` whenever the URL or secret needs to be shown again.

Never commit the shared secret or paste it into browser-side application code.

## Supabase setup

Run `supabase/migrations/20260713000000_ticket_google_sheets_backup.sql`, then
replace the placeholders and run `configure-supabase.sql`. To mirror existing
ticket entries after setup, that script finishes by running:

```sql
select private.backfill_ticket_google_sheets_backup();
```

The `Ticket Inventory` tab keeps one current row per ticket ID. The `Audit Log`
tab keeps every insert, update, delete, and backfill event for recovery.
