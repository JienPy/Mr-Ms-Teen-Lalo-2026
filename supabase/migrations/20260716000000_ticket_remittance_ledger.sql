CREATE TABLE IF NOT EXISTS public.ticket_remittances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  remittance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  legacy_ticket_entry_id UUID UNIQUE REFERENCES public.ticket_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_remittances_candidate_date
  ON public.ticket_remittances (candidate_id, remittance_date DESC, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_remittances TO authenticated;
GRANT ALL ON public.ticket_remittances TO service_role;

ALTER TABLE public.ticket_remittances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin only ticket remittances"
  ON public.ticket_remittances;

CREATE POLICY "admin only ticket remittances"
  ON public.ticket_remittances
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Preserve payments previously encoded as a number of remitted tickets.
INSERT INTO public.ticket_remittances (
  candidate_id,
  amount,
  remittance_date,
  note,
  legacy_ticket_entry_id,
  created_at
)
SELECT
  candidate_id,
  remitted_quantity * 45,
  COALESCE(remittance_date, entry_date),
  remittance_note,
  id,
  created_at
FROM public.ticket_entries
WHERE remitted_quantity > 0
ON CONFLICT (legacy_ticket_entry_id) DO NOTHING;

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
  entity_type TEXT := CASE
    WHEN ticket_record ? 'amount' AND NOT ticket_record ? 'quantity'
      THEN 'ticket_remittance'
    ELSE 'ticket_entry'
  END;
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
      'schema_version', 2,
      'entity_type', entity_type,
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

DROP TRIGGER IF EXISTS ticket_remittance_google_sheets_backup
ON public.ticket_remittances;

CREATE TRIGGER ticket_remittance_google_sheets_backup
AFTER INSERT OR UPDATE OR DELETE
ON public.ticket_remittances
FOR EACH ROW
EXECUTE FUNCTION private.ticket_google_sheets_backup_trigger();

CREATE OR REPLACE FUNCTION private.backfill_ticket_google_sheets_backup()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  backup_record RECORD;
  queued_count INTEGER := 0;
BEGIN
  FOR backup_record IN
    SELECT to_jsonb(t.*) AS payload
    FROM public.ticket_entries AS t
    ORDER BY t.created_at, t.id
  LOOP
    PERFORM private.send_ticket_google_sheets_backup(
      'BACKFILL',
      backup_record.payload
    );
    queued_count := queued_count + 1;
  END LOOP;

  FOR backup_record IN
    SELECT to_jsonb(r.*) AS payload
    FROM public.ticket_remittances AS r
    ORDER BY r.created_at, r.id
  LOOP
    PERFORM private.send_ticket_google_sheets_backup(
      'BACKFILL',
      backup_record.payload
    );
    queued_count := queued_count + 1;
  END LOOP;

  RETURN queued_count;
END;
$$;

REVOKE ALL ON FUNCTION private.backfill_ticket_google_sheets_backup()
FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
