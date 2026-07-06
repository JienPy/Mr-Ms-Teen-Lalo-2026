ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_admin';

CREATE OR REPLACE FUNCTION public.is_chairman()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text = 'chairman'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_content_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text = 'content_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_content_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_chairman()
$$;

CREATE OR REPLACE FUNCTION public.can_manage_public_content()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_chairman() OR public.is_content_admin()
$$;

DROP POLICY IF EXISTS "public read active candidates" ON public.candidates;
CREATE POLICY "public read active candidates"
ON public.candidates FOR SELECT
USING (is_active OR public.is_content_manager());

DROP POLICY IF EXISTS "admin write candidates" ON public.candidates;
CREATE POLICY "admin write candidates"
ON public.candidates FOR ALL
TO authenticated
USING (public.is_content_manager())
WITH CHECK (public.is_content_manager());

DROP POLICY IF EXISTS "admin write candidate photos" ON public.candidate_photos;
CREATE POLICY "admin write candidate photos"
ON public.candidate_photos FOR ALL
TO authenticated
USING (public.is_content_manager())
WITH CHECK (public.is_content_manager());

DROP POLICY IF EXISTS "admin write announcements" ON public.announcements;
CREATE POLICY "admin write announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.can_manage_public_content())
WITH CHECK (public.can_manage_public_content());

DROP POLICY IF EXISTS "admin write albums" ON public.albums;
CREATE POLICY "admin write albums"
ON public.albums FOR ALL
TO authenticated
USING (public.can_manage_public_content())
WITH CHECK (public.can_manage_public_content());

DROP POLICY IF EXISTS "admin write photos" ON public.photos;
CREATE POLICY "admin write photos"
ON public.photos FOR ALL
TO authenticated
USING (public.can_manage_public_content())
WITH CHECK (public.can_manage_public_content());

DROP POLICY IF EXISTS "admin write videos" ON public.videos;
CREATE POLICY "admin write videos"
ON public.videos FOR ALL
TO authenticated
USING (public.can_manage_public_content())
WITH CHECK (public.can_manage_public_content());

DROP POLICY IF EXISTS "Admins can manage sponsors" ON public.sponsors;
CREATE POLICY "Admins can manage sponsors"
ON public.sponsors FOR ALL
TO authenticated
USING (public.is_content_manager())
WITH CHECK (public.is_content_manager());

DROP POLICY IF EXISTS "Admins can manage pageant people" ON public.pageant_people;
CREATE POLICY "Admins can manage pageant people"
ON public.pageant_people FOR ALL
TO authenticated
USING (public.is_content_manager())
WITH CHECK (public.is_content_manager());

DROP POLICY IF EXISTS "admin write settings" ON public.site_settings;
CREATE POLICY "admin write settings"
ON public.site_settings FOR ALL
TO authenticated
USING (public.is_content_manager())
WITH CHECK (public.is_content_manager());

DROP POLICY IF EXISTS "admin upload pageant" ON storage.objects;
CREATE POLICY "admin upload pageant"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pageant'
  AND (
    public.is_content_manager()
    OR (
      public.is_content_admin()
      AND (
        name LIKE 'announcements/%'
        OR name LIKE 'albums/%'
        OR name LIKE 'videos/%'
      )
    )
  )
);

DROP POLICY IF EXISTS "admin update pageant" ON storage.objects;
CREATE POLICY "admin update pageant"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pageant'
  AND (
    public.is_content_manager()
    OR (
      public.is_content_admin()
      AND (
        name LIKE 'announcements/%'
        OR name LIKE 'albums/%'
        OR name LIKE 'videos/%'
      )
    )
  )
)
WITH CHECK (
  bucket_id = 'pageant'
  AND (
    public.is_content_manager()
    OR (
      public.is_content_admin()
      AND (
        name LIKE 'announcements/%'
        OR name LIKE 'albums/%'
        OR name LIKE 'videos/%'
      )
    )
  )
);

DROP POLICY IF EXISTS "admin delete pageant" ON storage.objects;
CREATE POLICY "admin delete pageant"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pageant'
  AND (
    public.is_content_manager()
    OR (
      public.is_content_admin()
      AND (
        name LIKE 'announcements/%'
        OR name LIKE 'albums/%'
        OR name LIKE 'videos/%'
      )
    )
  )
);

GRANT EXECUTE ON FUNCTION public.is_content_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_public_content() TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
