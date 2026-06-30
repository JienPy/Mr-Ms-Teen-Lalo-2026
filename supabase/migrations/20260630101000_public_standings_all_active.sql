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
  ORDER BY p.qty DESC, p.cdiv ASC, COALESCE(p.corder, p.cnum, 999), p.cname ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_standings() TO anon, authenticated;
