-- Enable storage RLS policies for atendimentos_media
-- NOTE: bucket must exist before these policies are applied. 
-- Since I just called storage_create_bucket, I'll assume it exists or will exist.

-- Create storage policies for the 'atendimentos_media' bucket
-- Allow public uploads
CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'atendimentos_media');

-- Allow public reads
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'atendimentos_media');
