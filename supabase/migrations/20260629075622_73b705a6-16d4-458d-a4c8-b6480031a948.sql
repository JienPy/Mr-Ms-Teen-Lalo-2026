
CREATE POLICY "public read pageant" ON storage.objects FOR SELECT USING (bucket_id = 'pageant');
CREATE POLICY "admin upload pageant" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pageant' AND public.is_admin());
CREATE POLICY "admin update pageant" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'pageant' AND public.is_admin());
CREATE POLICY "admin delete pageant" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pageant' AND public.is_admin());
