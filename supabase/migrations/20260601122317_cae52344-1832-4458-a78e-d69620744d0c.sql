
DROP POLICY IF EXISTS "Users can delete their own document files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own document files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload technical docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own document files" ON storage.objects;

CREATE POLICY "Users can upload their own technical docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'technical_docs'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
