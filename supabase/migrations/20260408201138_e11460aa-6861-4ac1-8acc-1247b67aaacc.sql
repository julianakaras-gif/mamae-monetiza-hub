INSERT INTO storage.buckets (id, name, public) VALUES ('depoimentos', 'depoimentos', true);

CREATE POLICY "Public read depoimentos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'depoimentos');
