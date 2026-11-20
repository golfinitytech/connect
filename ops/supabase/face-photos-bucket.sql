-- Private Supabase Storage bucket for user face photos.
-- Run once per Supabase project (SQL editor). The API reads/writes it with SUPABASE_SERVICE_ROLE_KEY.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('face-photos', 'face-photos', false, 2500000, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;
