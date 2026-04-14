-- Fix 1: Prevent privilege escalation on profiles table
-- Drop existing permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create restrictive update policy that excludes is_admin from being changed
-- Users can update their own profile but cannot change is_admin
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
);

-- Fix 2: Restrict robos storage bucket write access to admins only
DROP POLICY IF EXISTS "Authenticated users can upload robos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update robos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete robos images" ON storage.objects;

CREATE POLICY "Admin can upload robos images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'robos' AND public.is_admin());

CREATE POLICY "Admin can update robos images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'robos' AND public.is_admin());

CREATE POLICY "Admin can delete robos images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'robos' AND public.is_admin());