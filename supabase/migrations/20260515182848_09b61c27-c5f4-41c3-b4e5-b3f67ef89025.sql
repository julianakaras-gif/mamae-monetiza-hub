
-- 1) Attach the existing prevent_is_admin_change guard as a BEFORE UPDATE trigger
DROP TRIGGER IF EXISTS profiles_prevent_privilege_change ON public.profiles;
CREATE TRIGGER profiles_prevent_privilege_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_is_admin_change();

-- 2) Drop overly permissive realtime SELECT policy on messages
DROP POLICY IF EXISTS "Authenticated users can receive own row changes" ON public.messages;
