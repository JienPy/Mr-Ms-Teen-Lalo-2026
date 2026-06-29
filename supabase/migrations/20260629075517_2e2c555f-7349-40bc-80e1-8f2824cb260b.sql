
-- ============== ROLES ==============
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- ============== CANDIDATES ==============
CREATE TYPE public.division_type AS ENUM ('mr', 'ms');

CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  division division_type NOT NULL,
  sitio TEXT,
  candidate_number INT,
  motto TEXT,
  photo_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.candidates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.candidates TO authenticated;
GRANT ALL ON public.candidates TO service_role;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active candidates" ON public.candidates FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "admin write candidates" ON public.candidates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============== WEEKS ==============
CREATE TABLE public.weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.weeks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.weeks TO authenticated;
GRANT ALL ON public.weeks TO service_role;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read weeks" ON public.weeks FOR SELECT USING (true);
CREATE POLICY "admin write weeks" ON public.weeks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============== TICKET ENTRIES (admin-only; raw counts NEVER exposed to anon) ==============
CREATE TABLE public.ticket_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  serial_from TEXT,
  serial_to TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- NO grant to anon. Admin-only.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_entries TO authenticated;
GRANT ALL ON public.ticket_entries TO service_role;
ALTER TABLE public.ticket_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin only ticket entries" ON public.ticket_entries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Public leaderboard RPC: returns ONLY percentages for top 7 of the current week
CREATE OR REPLACE FUNCTION public.get_weekly_top7()
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
  total NUMERIC;
BEGIN
  SELECT * INTO w FROM public.weeks WHERE is_current = true ORDER BY start_date DESC LIMIT 1;
  IF w IS NULL THEN RETURN; END IF;

  CREATE TEMP TABLE _top7 ON COMMIT DROP AS
  SELECT c.id AS cid, c.name AS cname, c.division AS cdiv, c.sitio AS csitio, c.photo_url AS cphoto,
         COALESCE(SUM(t.quantity), 0)::NUMERIC AS qty
  FROM public.candidates c
  LEFT JOIN public.ticket_entries t
    ON t.candidate_id = c.id AND t.entry_date BETWEEN w.start_date AND w.end_date
  WHERE c.is_active
  GROUP BY c.id, c.name, c.division, c.sitio, c.photo_url
  ORDER BY qty DESC, c.name ASC
  LIMIT 7;

  SELECT COALESCE(SUM(qty), 0) INTO total FROM _top7;
  IF total = 0 THEN RETURN; END IF;

  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY qty DESC, cname ASC)::INT AS rank,
    cid, cname, cdiv, csitio, cphoto,
    ROUND((qty / total) * 100, 2) AS percentage,
    w.label, w.start_date, w.end_date
  FROM _top7
  WHERE qty > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_weekly_top7() TO anon, authenticated;

-- Admin-only full standings (includes raw totals)
CREATE OR REPLACE FUNCTION public.get_admin_standings(_week_id UUID DEFAULT NULL)
RETURNS TABLE (
  candidate_id UUID, name TEXT, division division_type, sitio TEXT,
  total_tickets BIGINT, week_tickets BIGINT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  w RECORD;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _week_id IS NULL THEN
    SELECT * INTO w FROM public.weeks WHERE is_current = true ORDER BY start_date DESC LIMIT 1;
  ELSE
    SELECT * INTO w FROM public.weeks WHERE id = _week_id;
  END IF;

  RETURN QUERY
  SELECT c.id, c.name, c.division, c.sitio,
    COALESCE((SELECT SUM(quantity) FROM public.ticket_entries WHERE candidate_id = c.id), 0)::BIGINT AS total_tickets,
    COALESCE((SELECT SUM(quantity) FROM public.ticket_entries WHERE candidate_id = c.id
              AND (w IS NULL OR entry_date BETWEEN w.start_date AND w.end_date)), 0)::BIGINT AS week_tickets
  FROM public.candidates c
  WHERE c.is_active
  ORDER BY week_tickets DESC, total_tickets DESC, c.name ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_admin_standings(UUID) TO authenticated;

-- ============== ANNOUNCEMENTS ==============
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "admin write announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============== ALBUMS / PHOTOS ==============
CREATE TYPE public.album_type AS ENUM ('past', 'upcoming');

CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type album_type NOT NULL DEFAULT 'past',
  cover_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.albums TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.albums TO authenticated;
GRANT ALL ON public.albums TO service_role;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "admin write albums" ON public.albums FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.photos TO authenticated;
GRANT ALL ON public.photos TO service_role;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "admin write photos" ON public.photos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============== VIDEOS ==============
CREATE TYPE public.video_source AS ENUM ('upload', 'url');

CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_type video_source NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "admin write videos" ON public.videos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============== SITE SETTINGS ==============
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admin write settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER tg_candidates_updated BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER tg_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
