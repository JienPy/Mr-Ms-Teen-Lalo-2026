ALTER TABLE public.candidate_photos
  ADD COLUMN IF NOT EXISTS top7_crop_url TEXT;
