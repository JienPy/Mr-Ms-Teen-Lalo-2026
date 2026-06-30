INSERT INTO public.sponsors (name, tier, sort_order, is_visible)
SELECT *
FROM (VALUES
  ('Jun Baretto Tabi', 'community', 1, true),
  ('Doris Obciana Maeda', 'community', 2, true),
  ('LA Imperial', 'community', 3, true),
  ('Banahaw Glass Villa', 'community', 4, true)
) AS seed(name, tier, sort_order, is_visible)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sponsors
);
