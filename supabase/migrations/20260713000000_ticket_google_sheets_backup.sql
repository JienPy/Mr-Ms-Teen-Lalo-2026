CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.send_ticket_google_sheets_backup(
  operation_name TEXT,
  ticket_record JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  webhook_url TEXT;
  webhook_secret TEXT;
  candidate_record JSONB;
  event_id UUID := gen_random_uuid();
  request_id BIGINT;
BEGIN
  SELECT decrypted_secret
  INTO webhook_url
  FROM vault.decrypted_secrets
  WHERE name = 'ticket_backup_webhook_url'
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT decrypted_secret
  INTO webhook_secret
  FROM vault.decrypted_secrets
  WHERE name = 'ticket_backup_webhook_secret'
  ORDER BY created_at DESC
  LIMIT 1;

  IF webhook_url IS NULL OR webhook_secret IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'division', c.division,
    'sitio', c.sitio
  )
  INTO candidate_record
  FROM public.candidates AS c
  WHERE c.id = (ticket_record ->> 'candidate_id')::UUID;

  SELECT net.http_post(
    url := webhook_url,
    body := jsonb_build_object(
      'schema_version', 1,
      'event_id', event_id,
      'operation', upper(operation_name),
      'occurred_at', now(),
      'record', ticket_record,
      'candidate', COALESCE(candidate_record, '{}'::JSONB),
      'secret', webhook_secret
    ),
    headers := '{"Content-Type":"application/json"}'::JSONB,
    timeout_milliseconds := 5000
  )
  INTO request_id;

  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION private.send_ticket_google_sheets_backup(TEXT, JSONB)
FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.ticket_google_sheets_backup_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM private.send_ticket_google_sheets_backup(TG_OP, to_jsonb(OLD));
    RETURN OLD;
  END IF;

  PERFORM private.send_ticket_google_sheets_backup(TG_OP, to_jsonb(NEW));
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Ticket backup enqueue failed: %', SQLERRM;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.ticket_google_sheets_backup_trigger()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS ticket_google_sheets_backup
ON public.ticket_entries;

CREATE TRIGGER ticket_google_sheets_backup
AFTER INSERT OR UPDATE OR DELETE
ON public.ticket_entries
FOR EACH ROW
EXECUTE FUNCTION private.ticket_google_sheets_backup_trigger();

CREATE OR REPLACE FUNCTION private.backfill_ticket_google_sheets_backup()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  ticket_record RECORD;
  queued_count INTEGER := 0;
BEGIN
  FOR ticket_record IN
    SELECT to_jsonb(t.*) AS payload
    FROM public.ticket_entries AS t
    ORDER BY t.created_at, t.id
  LOOP
    PERFORM private.send_ticket_google_sheets_backup(
      'BACKFILL',
      ticket_record.payload
    );
    queued_count := queued_count + 1;
  END LOOP;

  RETURN queued_count;
END;
$$;

REVOKE ALL ON FUNCTION private.backfill_ticket_google_sheets_backup()
FROM PUBLIC, anon, authenticated;
