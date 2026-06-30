CREATE TABLE IF NOT EXISTS public.pageant_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('sk', 'organizer')),
  name TEXT NOT NULL,
  role TEXT,
  photo_url TEXT,
  facebook_url TEXT,
  contact_number TEXT,
  sort_order INT NOT NULL DEFAULT 100,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pageant_people_public_order
  ON public.pageant_people (is_visible, group_type, sort_order, name);

GRANT SELECT ON public.pageant_people TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pageant_people TO authenticated;
GRANT ALL ON public.pageant_people TO service_role;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_pageant_people_updated_at ON public.pageant_people;
CREATE TRIGGER update_pageant_people_updated_at
BEFORE UPDATE ON public.pageant_people
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.pageant_people ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible pageant people" ON public.pageant_people;
CREATE POLICY "Public can view visible pageant people"
ON public.pageant_people FOR SELECT
USING (is_visible = true);

DROP POLICY IF EXISTS "Admins can manage pageant people" ON public.pageant_people;
CREATE POLICY "Admins can manage pageant people"
ON public.pageant_people FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

INSERT INTO public.pageant_people (group_type, name, role, sort_order, is_visible)
SELECT *
FROM (VALUES
  ('sk', 'Aldwin C. Castro', 'SK Chairman', 1, true),
  ('sk', 'Kim Durante', 'SK Kagawad', 2, true),
  ('sk', 'Girlie Javin', 'SK Kagawad', 3, true),
  ('sk', 'Reymart Javin', 'SK Kagawad', 4, true),
  ('sk', 'Harvey Clado', 'SK Kagawad', 5, true),
  ('sk', 'Kenneth Leo Zafranco', 'SK Kagawad', 6, true),
  ('sk', 'Darrian Edrad', 'SK Kagawad', 7, true),
  ('sk', 'Monica Palma', 'SK Secretary', 8, true),
  ('sk', 'Jien Claude Valancio', 'SK Treasurer', 9, true)
) AS seed(group_type, name, role, sort_order, is_visible)
WHERE NOT EXISTS (
  SELECT 1 FROM public.pageant_people WHERE group_type = 'sk'
);

INSERT INTO public.pageant_people (group_type, name, role, sort_order, is_visible)
SELECT *
FROM (VALUES
  ('organizer', 'Keissy Palma Rayel', 'Organizer', 1, true),
  ('organizer', 'Vercie Edrad', 'Organizer', 2, true),
  ('organizer', 'Mystica Labner', 'Organizer', 3, true),
  ('organizer', 'Angel Del Mundo', 'Organizer', 4, true),
  ('organizer', 'Cedrick Abuel', 'Organizer', 5, true)
) AS seed(group_type, name, role, sort_order, is_visible)
WHERE NOT EXISTS (
  SELECT 1 FROM public.pageant_people WHERE group_type = 'organizer'
);
