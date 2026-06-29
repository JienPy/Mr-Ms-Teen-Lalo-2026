
-- Allow RLS policies to call the helpers; helpers themselves stay safe (they only read user_roles).
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

-- Rewrite get_weekly_top7 without CREATE TEMP TABLE (STABLE-safe)
CREATE OR REPLACE FUNCTION public.get_weekly_top7()
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
  w RECORD;
BEGIN
  SELECT * INTO w FROM public.weeks WHERE is_current = true ORDER BY start_date DESC LIMIT 1;
  IF w IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH per_candidate AS (
    SELECT c.id AS cid, c.name AS cname, c.division AS cdiv, c.sitio AS csitio, c.photo_url AS cphoto,
           COALESCE(SUM(t.quantity), 0)::NUMERIC AS qty
    FROM public.candidates c
    LEFT JOIN public.ticket_entries t
      ON t.candidate_id = c.id AND t.entry_date BETWEEN w.start_date AND w.end_date
    WHERE c.is_active
    GROUP BY c.id, c.name, c.division, c.sitio, c.photo_url
  ),
  top7 AS (
    SELECT * FROM per_candidate WHERE qty > 0 ORDER BY qty DESC, cname ASC LIMIT 7
  ),
  total AS (SELECT COALESCE(SUM(qty), 0) AS s FROM top7)
  SELECT
    ROW_NUMBER() OVER (ORDER BY t.qty DESC, t.cname ASC)::INT AS rank,
    t.cid, t.cname, t.cdiv, t.csitio, t.cphoto,
    ROUND((t.qty / NULLIF((SELECT s FROM total), 0)) * 100, 2) AS percentage,
    w.label, w.start_date, w.end_date
  FROM top7 t;
END;
$$;
