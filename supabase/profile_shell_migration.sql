-- BayDesk: profile fields + avatar storage (run in Supabase SQL editor)
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS shop_address text,
  ADD COLUMN IF NOT EXISTS profile_image_url text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS shop_name text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Profile images: users can upload own file" ON storage.objects;
DROP POLICY IF EXISTS "Profile images: users can update own file" ON storage.objects;
DROP POLICY IF EXISTS "Profile images: users can delete own file" ON storage.objects;
DROP POLICY IF EXISTS "Profile images: public read" ON storage.objects;

CREATE POLICY "Profile images: users can upload own file"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profiles'
    AND name = ('user-' || auth.uid()::text || '.jpg')
  );

CREATE POLICY "Profile images: users can update own file"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profiles'
    AND name = ('user-' || auth.uid()::text || '.jpg')
  );

CREATE POLICY "Profile images: users can delete own file"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profiles'
    AND name = ('user-' || auth.uid()::text || '.jpg')
  );

CREATE POLICY "Profile images: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profiles');
