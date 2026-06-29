ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS card_order INT,
  ADD COLUMN IF NOT EXISTS belief TEXT;

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_from TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS show_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_candidates_public_order ON public.candidates (division, card_order, candidate_number, name);
CREATE INDEX IF NOT EXISTS idx_announcements_public_schedule ON public.announcements (is_hidden, is_pinned, show_from, show_until, published_at);
CREATE INDEX IF NOT EXISTS idx_ticket_entries_candidate_date ON public.ticket_entries (candidate_id, entry_date);

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
  w RECORD;
BEGIN
  SELECT * INTO w FROM public.weeks WHERE is_current = true ORDER BY start_date DESC LIMIT 1;
  IF w IS NULL THEN RETURN; END IF;

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
      ON t.candidate_id = c.id AND t.entry_date BETWEEN w.start_date AND w.end_date
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
    w.label,
    w.start_date,
    w.end_date
  FROM per_candidate p
  ORDER BY p.qty DESC, p.cdiv ASC, COALESCE(p.corder, p.cnum, 999), p.cname ASC
  LIMIT 24;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_standings() TO anon, authenticated;

WITH seed_candidates (division, card_order, candidate_number, name, sitio, belief) AS (
  VALUES
    ('mr'::division_type, 1, 1, 'Ken Brian P. Edrad', 'Ilaya', 'Ang tunay na lakas ay nagsisimula sa kabutihang loob.'),
    ('mr'::division_type, 2, 2, 'Carlos Jose Z. Labaquis', 'Greenheights', 'Disiplina at respeto ang pundasyon ng pagkatao.'),
    ('mr'::division_type, 3, 3, 'Kave Izzy D. Oates', 'Centro', 'Manindigan nang may tapang at maglingkod nang may puso.'),
    ('mr'::division_type, 4, 4, 'Raven Zian T. Leones', 'Centro', 'Ang pangarap ay mas makapangyarihan kapag may kasamang gawa.'),
    ('mr'::division_type, 5, 5, 'Kurt Rafanan', 'Whitehouse', 'Maging inspirasyon sa salita, gawa, at pakikitungo.'),
    ('mr'::division_type, 6, 6, 'Symon D. Pabularcon', 'Sambat', 'Ang tiwala sa sarili ay mas kumikinang kapag may pagpapakumbaba.'),
    ('mr'::division_type, 7, 7, 'Rieven V. Villa', 'Whitehouse', 'Kabataan ang pag-asa kapag handang umaksyon.'),
    ('mr'::division_type, 8, 8, 'Chris Daniel L. Dadis', 'Whitehouse', 'Mamuno sa sarili bago mamuno para sa iba.'),
    ('mr'::division_type, 9, 9, 'Kian Ezekiel V. Edrad', 'Pinagpala', 'Ang tagumpay ay bunga ng sipag, dasal, at malasakit.'),
    ('mr'::division_type, 10, 10, 'Tyron P. Veloso', 'Centro', 'Ang bawat hakbang ay pagkakataong maging mas mabuti.'),
    ('mr'::division_type, 11, 11, 'Adrian N. Sta. Ana', 'Centro', 'Gamitin ang talento para magbigay saya at serbisyo.'),
    ('mr'::division_type, 12, 12, 'Jonas R. Javin', 'Pinagpala', 'Ang kabutihan ay laging may puwang sa tunay na tagumpay.'),
    ('ms'::division_type, 1, 1, 'Kyla Mae Ecal', 'Pinagpala', 'Ang ganda ay mas makabuluhan kapag may paninindigan.'),
    ('ms'::division_type, 2, 2, 'Janine Crisibelle S. Lopez', 'Whitehouse', 'Maging tinig ng pag-asa at halimbawa ng kabutihan.'),
    ('ms'::division_type, 3, 3, 'Joyce Anne Rose B. Cena', 'Whitehouse', 'Ang kumpiyansa ay nagsisimula sa pagtanggap sa sarili.'),
    ('ms'::division_type, 4, 4, 'Hannah Grace D. Lesma', 'Pinagpala', 'Kapag may malasakit, may liwanag na naibabahagi.'),
    ('ms'::division_type, 5, 5, 'Princess Loren L. Ricamata', 'Sambat', 'Maging matatag, magalang, at may pusong handang tumulong.'),
    ('ms'::division_type, 6, 6, 'Cielo Mae S. Caagbay', 'Don Elpidio', 'Ang tunay na korona ay kabutihang dala sa komunidad.'),
    ('ms'::division_type, 7, 7, 'Mirence Felicity E. Javin', 'Centro', 'Maniwala sa sarili at gamitin ang boses para sa mabuti.'),
    ('ms'::division_type, 8, 8, 'Criza Jen C. Capistrano', 'Centro', 'Ang lakas ng babae ay nasa tapang, talino, at puso.'),
    ('ms'::division_type, 9, 9, 'Emerald A. Delgado', 'Sambat', 'Kuminang hindi para mapansin, kundi para makapagbigay inspirasyon.'),
    ('ms'::division_type, 10, 10, 'Reese Denielle Nuqui', 'Don Elpidio', 'Ang respeto at kababaang-loob ay kailanman hindi naluluma.'),
    ('ms'::division_type, 11, 11, 'Britney Armocilla', 'Pinagpala', 'Ang pangarap ay abot-kamay kung may sipag at pananampalataya.'),
    ('ms'::division_type, 12, 12, 'Precious Nicole Guevarra', 'Pinagpala', 'Gamitin ang ganda at talino para sa makabuluhang pagbabago.')
)
INSERT INTO public.candidates (division, card_order, candidate_number, name, sitio, belief, motto, is_active)
SELECT division, card_order, candidate_number, name, sitio, belief, belief, true
FROM seed_candidates
WHERE NOT EXISTS (
  SELECT 1
  FROM public.candidates c
  WHERE c.division = seed_candidates.division
    AND c.name = seed_candidates.name
);

UPDATE public.candidates c
SET
  card_order = s.card_order,
  candidate_number = s.candidate_number,
  sitio = s.sitio,
  belief = s.belief,
  motto = COALESCE(NULLIF(c.motto, ''), s.belief)
FROM (
  VALUES
    ('mr'::division_type, 1, 1, 'Ken Brian P. Edrad', 'Ilaya', 'Ang tunay na lakas ay nagsisimula sa kabutihang loob.'),
    ('mr'::division_type, 2, 2, 'Carlos Jose Z. Labaquis', 'Greenheights', 'Disiplina at respeto ang pundasyon ng pagkatao.'),
    ('mr'::division_type, 3, 3, 'Kave Izzy D. Oates', 'Centro', 'Manindigan nang may tapang at maglingkod nang may puso.'),
    ('mr'::division_type, 4, 4, 'Raven Zian T. Leones', 'Centro', 'Ang pangarap ay mas makapangyarihan kapag may kasamang gawa.'),
    ('mr'::division_type, 5, 5, 'Kurt Rafanan', 'Whitehouse', 'Maging inspirasyon sa salita, gawa, at pakikitungo.'),
    ('mr'::division_type, 6, 6, 'Symon D. Pabularcon', 'Sambat', 'Ang tiwala sa sarili ay mas kumikinang kapag may pagpapakumbaba.'),
    ('mr'::division_type, 7, 7, 'Rieven V. Villa', 'Whitehouse', 'Kabataan ang pag-asa kapag handang umaksyon.'),
    ('mr'::division_type, 8, 8, 'Chris Daniel L. Dadis', 'Whitehouse', 'Mamuno sa sarili bago mamuno para sa iba.'),
    ('mr'::division_type, 9, 9, 'Kian Ezekiel V. Edrad', 'Pinagpala', 'Ang tagumpay ay bunga ng sipag, dasal, at malasakit.'),
    ('mr'::division_type, 10, 10, 'Tyron P. Veloso', 'Centro', 'Ang bawat hakbang ay pagkakataong maging mas mabuti.'),
    ('mr'::division_type, 11, 11, 'Adrian N. Sta. Ana', 'Centro', 'Gamitin ang talento para magbigay saya at serbisyo.'),
    ('mr'::division_type, 12, 12, 'Jonas R. Javin', 'Pinagpala', 'Ang kabutihan ay laging may puwang sa tunay na tagumpay.'),
    ('ms'::division_type, 1, 1, 'Kyla Mae Ecal', 'Pinagpala', 'Ang ganda ay mas makabuluhan kapag may paninindigan.'),
    ('ms'::division_type, 2, 2, 'Janine Crisibelle S. Lopez', 'Whitehouse', 'Maging tinig ng pag-asa at halimbawa ng kabutihan.'),
    ('ms'::division_type, 3, 3, 'Joyce Anne Rose B. Cena', 'Whitehouse', 'Ang kumpiyansa ay nagsisimula sa pagtanggap sa sarili.'),
    ('ms'::division_type, 4, 4, 'Hannah Grace D. Lesma', 'Pinagpala', 'Kapag may malasakit, may liwanag na naibabahagi.'),
    ('ms'::division_type, 5, 5, 'Princess Loren L. Ricamata', 'Sambat', 'Maging matatag, magalang, at may pusong handang tumulong.'),
    ('ms'::division_type, 6, 6, 'Cielo Mae S. Caagbay', 'Don Elpidio', 'Ang tunay na korona ay kabutihang dala sa komunidad.'),
    ('ms'::division_type, 7, 7, 'Mirence Felicity E. Javin', 'Centro', 'Maniwala sa sarili at gamitin ang boses para sa mabuti.'),
    ('ms'::division_type, 8, 8, 'Criza Jen C. Capistrano', 'Centro', 'Ang lakas ng babae ay nasa tapang, talino, at puso.'),
    ('ms'::division_type, 9, 9, 'Emerald A. Delgado', 'Sambat', 'Kuminang hindi para mapansin, kundi para makapagbigay inspirasyon.'),
    ('ms'::division_type, 10, 10, 'Reese Denielle Nuqui', 'Don Elpidio', 'Ang respeto at kababaang-loob ay kailanman hindi naluluma.'),
    ('ms'::division_type, 11, 11, 'Britney Armocilla', 'Pinagpala', 'Ang pangarap ay abot-kamay kung may sipag at pananampalataya.'),
    ('ms'::division_type, 12, 12, 'Precious Nicole Guevarra', 'Pinagpala', 'Gamitin ang ganda at talino para sa makabuluhang pagbabago.')
) AS s(division, card_order, candidate_number, name, sitio, belief)
WHERE c.division = s.division AND c.name = s.name;
