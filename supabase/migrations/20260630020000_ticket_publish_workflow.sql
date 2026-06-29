ALTER TABLE public.ticket_entries
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

UPDATE public.ticket_entries
SET
  is_published = true,
  published_at = COALESCE(published_at, created_at, now())
WHERE is_published = true
  AND published_at IS NULL;

ALTER TABLE public.ticket_entries
  ALTER COLUMN is_published SET DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_ticket_entries_public_week
  ON public.ticket_entries (is_published, entry_date, candidate_id);

CREATE OR REPLACE FUNCTION public.get_public_standings()
RETURNS TABLE (
  rank INT,
  candidate_id UUID,
  name TEXT,
  division division_type,
  sitio TEXT,
  photo_url TEXT,
  percentage NUMERIC,
  week_label TEXT,
  week_start DATE,
  week_end DATE
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::DATE;
  week_start_date DATE;
  week_end_date DATE;
BEGIN
  week_start_date := today - (EXTRACT(ISODOW FROM today)::INT - 1);
  week_end_date := week_start_date + 6;

  RETURN QUERY
  WITH per_candidate AS (
    SELECT
      c.id AS cid,
      c.name AS cname,
      c.division AS cdiv,
      c.sitio AS csitio,
      c.photo_url AS cphoto,
      c.card_order AS corder,
      c.candidate_number AS cnum,
      COALESCE(SUM(t.quantity), 0)::NUMERIC AS qty
    FROM public.candidates c
    LEFT JOIN public.ticket_entries t
      ON t.candidate_id = c.id
      AND t.is_published = true
      AND t.entry_date BETWEEN week_start_date AND week_end_date
    WHERE c.is_active
    GROUP BY c.id, c.name, c.division, c.sitio, c.photo_url, c.card_order, c.candidate_number
  ),
  total AS (
    SELECT COALESCE(SUM(qty), 0) AS s FROM per_candidate
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.qty DESC, p.cdiv ASC, COALESCE(p.corder, p.cnum, 999), p.cname ASC)::INT AS rank,
    p.cid,
    p.cname,
    p.cdiv,
    p.csitio,
    p.cphoto,
    CASE
      WHEN (SELECT s FROM total) = 0 THEN 0
      ELSE ROUND((p.qty / NULLIF((SELECT s FROM total), 0)) * 100, 2)
    END AS percentage,
    'Week of ' || week_start_date::TEXT,
    week_start_date,
    week_end_date
  FROM per_candidate p
  ORDER BY p.qty DESC, p.cdiv ASC, COALESCE(p.corder, p.cnum, 999), p.cname ASC
  LIMIT 24;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_standings() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_standings(_week_id UUID DEFAULT NULL)
RETURNS TABLE (
  candidate_id UUID, name TEXT, division division_type, sitio TEXT,
  total_tickets BIGINT, week_tickets BIGINT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::DATE;
  week_start_date DATE;
  week_end_date DATE;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;

  week_start_date := today - (EXTRACT(ISODOW FROM today)::INT - 1);
  week_end_date := week_start_date + 6;

  RETURN QUERY
  SELECT c.id, c.name, c.division, c.sitio,
    COALESCE((SELECT SUM(quantity) FROM public.ticket_entries WHERE candidate_id = c.id AND is_published = true), 0)::BIGINT AS total_tickets,
    COALESCE((SELECT SUM(quantity) FROM public.ticket_entries WHERE candidate_id = c.id
              AND is_published = true
              AND entry_date BETWEEN week_start_date AND week_end_date), 0)::BIGINT AS week_tickets
  FROM public.candidates c
  WHERE c.is_active
  ORDER BY week_tickets DESC, total_tickets DESC, c.name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_standings(UUID) TO authenticated;
