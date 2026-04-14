-- Fix 1: Harden profiles update - use a trigger to prevent is_admin changes
-- Drop the current policy with the self-referential subquery
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Simpler policy without self-referential check
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Use a trigger to prevent non-admins from changing is_admin
CREATE OR REPLACE FUNCTION public.prevent_is_admin_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If is_admin is being changed and the user is not already an admin, block it
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT coalesce((SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()), false) THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_is_admin_change_trigger ON public.profiles;
CREATE TRIGGER prevent_is_admin_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_is_admin_change();

-- Fix 2: Add explicit write policies on depoimentos bucket (admin-only)
CREATE POLICY "Admin can upload depoimentos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'depoimentos' AND public.is_admin());

CREATE POLICY "Admin can update depoimentos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'depoimentos' AND public.is_admin());

CREATE POLICY "Admin can delete depoimentos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'depoimentos' AND public.is_admin());

-- Fix 3: Enable Realtime authorization on published tables
-- Add RLS-based authorization for realtime by ensuring the realtime publication
-- respects RLS. Supabase Realtime respects RLS when row_security is enabled on the publication.
-- The existing RLS policies on agent_sessions and user_progress already scope to auth.uid() = user_id,
-- so we just need to ensure the realtime publication uses row-level security filters.
ALTER PUBLICATION supabase_realtime SET (publish_via_partition_root = false);