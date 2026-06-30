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
  SELECT 1 FROM public.pageant_people p
  WHERE p.group_type = seed.group_type AND lower(p.name) = lower(seed.name)
);

INSERT INTO public.pageant_people (group_type, name, role, facebook_url, sort_order, is_visible)
SELECT *
FROM (VALUES
  ('organizer', 'Keissy Palma Rayel', 'Organizer', 'https://www.facebook.com/keissyofficial', 1, true),
  ('organizer', 'Vercie Edrad', 'Organizer', 'https://www.facebook.com/vercie.baer', 2, true),
  ('organizer', 'Mystica Labner', 'Organizer', 'https://www.facebook.com/ian.ansay.1', 3, true),
  ('organizer', 'Angel Del Mundo', 'Organizer', 'https://www.facebook.com/angel.delmundo.56', 4, true),
  ('organizer', 'Cedrick Abuel', 'Organizer', 'https://www.facebook.com/ced.abuel94', 5, true)
) AS seed(group_type, name, role, facebook_url, sort_order, is_visible)
WHERE NOT EXISTS (
  SELECT 1 FROM public.pageant_people p
  WHERE p.group_type = seed.group_type AND lower(p.name) = lower(seed.name)
);

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_number TEXT;

WITH contacts(name, facebook_url, contact_number) AS (
  VALUES
    ('Adrian N. Sta. Ana', 'https://www.facebook.com/adrian.sta.ana.460022', '09386724590'),
    ('Britney Armocilla', 'https://www.facebook.com/BritneyArmocilla', '09663771668'),
    ('Carlos Jose Z. Labaquis', 'https://www.facebook.com/carlosjose.labaguis.3', '09106384061'),
    ('Criza Jen C. Capistrano', 'https://www.facebook.com/crishyy12', '09706611140'),
    ('Joyce Anne Rose B. Cena', 'https://www.facebook.com/joyceannerose.cena.1', '09483896610'),
    ('Kave Izzy D. Oates', 'https://www.facebook.com/kaveizzy.oates', '09481869497'),
    ('Ken Brian P. Edrad', 'https://www.facebook.com/bryan.edrad.2024', '09939928649'),
    ('Chris Daniel L. Dadis', 'https://www.facebook.com/daniel.dadis.2025', '09512357325'),
    ('Rieven V. Villa', 'https://www.facebook.com/profile.php?id=100084121066177', '09386442223'),
    ('Emerald A. Delgado', 'https://www.facebook.com/emerald.delgado.509', '09423381995'),
    ('Kian Ezekiel V. Edrad', 'https://www.facebook.com/ezekiel.edrad', '09703388110'),
    ('Hannah Grace D. Lesma', 'https://www.facebook.com/hannah.grace.durante.lesma', '09945821769'),
    ('Janine Crisibelle S. Lopez', 'https://www.facebook.com/ichaaqx', '09853155822'),
    ('Jonas R. Javin', 'https://www.facebook.com/jonas.javin', NULL),
    ('Kurt Rafanan', 'https://www.facebook.com/txrkzzzzz', '09483532352'),
    ('Kyla Mae Ecal', 'https://www.facebook.com/kyla.mae.ecal.2025', '09817340863'),
    ('Princess Loren L. Ricamata', 'https://www.facebook.com/princesslorenricamata4', '09855500466'),
    ('Cielo Mae S. Caagbay', 'https://www.facebook.com/caagbaycielo', '09564975048'),
    ('Mirence Felicity E. Javin', 'https://www.facebook.com/mirencefelicity.javin', '09308275923'),
    ('Precious Nicole Guevarra', 'https://www.facebook.com/preciousnicole.guevarra.5', '09854400950'),
    ('Raven Zian T. Leones', 'https://www.facebook.com/raven.zian.leones', '09183206200'),
    ('Reese Denielle Nuqui', 'https://www.facebook.com/reese.nuqui.58', '09637873136'),
    ('Symon D. Pabularcon', 'https://www.facebook.com/symon.pabularcon.71', '09187728994'),
    ('Tyron P. Veloso', 'https://www.facebook.com/tyron.veloso.73', '09469590669')
)
UPDATE public.candidates c
SET
  facebook_url = COALESCE(c.facebook_url, contacts.facebook_url),
  contact_number = COALESCE(c.contact_number, contacts.contact_number)
FROM contacts
WHERE lower(c.name) = lower(contacts.name);

NOTIFY pgrst, 'reload schema';
