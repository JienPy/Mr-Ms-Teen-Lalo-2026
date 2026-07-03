ALTER TABLE public.candidate_photos
  ALTER COLUMN top7_zoom SET DEFAULT 1,
  ALTER COLUMN top7_offset_x SET DEFAULT 0,
  ALTER COLUMN top7_offset_y SET DEFAULT 0;
