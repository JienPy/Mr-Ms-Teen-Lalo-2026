ALTER TABLE public.pageant_people
  DROP CONSTRAINT IF EXISTS pageant_people_group_type_check;

ALTER TABLE public.pageant_people
  ADD CONSTRAINT pageant_people_group_type_check
  CHECK (group_type IN ('sk', 'organizer', 'master_of_ceremony'));

NOTIFY pgrst, 'reload schema';
