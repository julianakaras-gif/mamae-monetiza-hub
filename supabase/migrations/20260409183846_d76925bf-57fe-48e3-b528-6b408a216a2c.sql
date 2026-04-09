INSERT INTO storage.buckets (id, name, public)
SELECT 'robos', 'robos', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'robos'
);

CREATE POLICY "Robos images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'robos');

CREATE POLICY "Authenticated users can upload robos images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'robos');

CREATE POLICY "Authenticated users can update robos images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'robos')
WITH CHECK (bucket_id = 'robos');

CREATE POLICY "Authenticated users can delete robos images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'robos');