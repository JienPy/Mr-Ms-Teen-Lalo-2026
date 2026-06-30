ALTER TABLE public.ticket_entries
  ADD COLUMN IF NOT EXISTS remitted_quantity INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remittance_date DATE,
  ADD COLUMN IF NOT EXISTS remittance_note TEXT;

UPDATE public.ticket_entries
SET remitted_quantity = GREATEST(0, LEAST(COALESCE(remitted_quantity, 0), quantity))
WHERE remitted_quantity IS NULL
   OR remitted_quantity < 0
   OR remitted_quantity > quantity;

ALTER TABLE public.ticket_entries
  DROP CONSTRAINT IF EXISTS ticket_entries_remitted_quantity_check;

ALTER TABLE public.ticket_entries
  ADD CONSTRAINT ticket_entries_remitted_quantity_check
  CHECK (remitted_quantity >= 0 AND remitted_quantity <= quantity);
