
-- Add photo columns to residents
ALTER TABLE public.residents ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.residents ADD COLUMN IF NOT EXISTS car_photo_url text;

-- Create storage bucket for resident photos
INSERT INTO storage.buckets (id, name, public) VALUES ('resident-photos', 'resident-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view resident photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'resident-photos');

CREATE POLICY "Authenticated users can upload resident photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resident-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update resident photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resident-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete resident photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'resident-photos' AND auth.role() = 'authenticated');
