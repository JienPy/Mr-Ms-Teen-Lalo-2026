CREATE TABLE IF NOT EXISTS public.candidate_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_main_portrait BOOLEAN NOT NULL DEFAULT false,
  show_in_profile BOOLEAN NOT NULL DEFAULT false,
  show_in_top7 BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_photos_candidate_order
  ON public.candidate_photos (candidate_id, sort_order, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_photos_one_main_portrait
  ON public.candidate_photos (candidate_id)
  WHERE is_main_portrait = true;

GRANT SELECT ON public.candidate_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.candidate_photos TO authenticated;
GRANT ALL ON public.candidate_photos TO service_role;

ALTER TABLE public.candidate_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read candidate photos" ON public.candidate_photos;
CREATE POLICY "public read candidate photos"
  ON public.candidate_photos
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin write candidate photos" ON public.candidate_photos;
CREATE POLICY "admin write candidate photos"
  ON public.candidate_photos
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
