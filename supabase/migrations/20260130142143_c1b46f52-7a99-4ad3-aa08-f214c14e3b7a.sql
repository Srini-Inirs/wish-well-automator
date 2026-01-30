-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('wish-documents', 'wish-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for documents bucket
CREATE POLICY "Users can upload documents to wish-documents bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wish-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view documents in wish-documents bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'wish-documents');

CREATE POLICY "Users can update their own documents in wish-documents bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'wish-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents in wish-documents bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'wish-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add document_url column to wishes table (replacing audio_url concept)
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS document_url TEXT;

-- We can keep audio_url for legacy data but new uploads will use document_url