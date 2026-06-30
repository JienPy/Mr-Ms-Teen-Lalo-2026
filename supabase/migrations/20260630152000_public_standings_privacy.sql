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
      COALESCE(SUM(t.quantity), 0)::NUMERIC AS qty
    FROM public.candidates c
    LEFT JOIN public.ticket_entries t
      ON t.candidate_id = c.id
      AND t.is_published = true
      AND t.entry_date BETWEEN week_start_date AND week_end_date
    WHERE c.is_active
    GROUP BY c.id, c.name, c.division, c.sitio, c.photo_url
  ),
  qualified AS (
    SELECT
      p.*,
      ROW_NUMBER() OVER (PARTITION BY p.cdiv ORDER BY p.qty DESC, p.cname ASC) AS private_rank
    FROM per_candidate p
    WHERE p.qty > 0
  ),
  public_top AS (
    SELECT
      q.*,
      md5(week_start_date::TEXT || ':' || q.cdiv::TEXT || ':' || q.cid::TEXT) AS public_sort
    FROM qualified q
    WHERE q.private_rank <= 7
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.cdiv ASC, p.public_sort)::INT AS rank,
    p.cid,
    p.cname,
    p.cdiv,
    p.csitio,
    p.cphoto,
    1::NUMERIC AS percentage,
    'Week of ' || week_start_date::TEXT,
    week_start_date,
    week_end_date
  FROM public_top p
  ORDER BY p.cdiv ASC, p.public_sort;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_standings() TO anon, authenticated;
