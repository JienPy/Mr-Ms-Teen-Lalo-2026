ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_number TEXT;

ALTER TABLE public.pageant_people
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
  facebook_url = contacts.facebook_url,
  contact_number = contacts.contact_number
FROM contacts
WHERE lower(c.name) = lower(contacts.name);

WITH contacts(name, facebook_url) AS (
  VALUES
    ('Angel Del Mundo', 'https://www.facebook.com/angel.delmundo.56'),
    ('Cedrick Abuel', 'https://www.facebook.com/ced.abuel94'),
    ('Mystica Labner', 'https://www.facebook.com/ian.ansay.1'),
    ('Keissy Palma Rayel', 'https://www.facebook.com/keissyofficial'),
    ('Vercie Edrad', 'https://www.facebook.com/vercie.baer')
)
UPDATE public.pageant_people p
SET facebook_url = contacts.facebook_url
FROM contacts
WHERE lower(p.name) = lower(contacts.name);
