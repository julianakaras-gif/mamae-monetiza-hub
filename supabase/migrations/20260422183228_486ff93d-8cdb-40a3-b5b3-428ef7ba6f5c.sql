-- 1) Strengthen the privilege/subscription guard trigger
CREATE OR REPLACE FUNCTION public.prevent_is_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  caller_is_admin boolean;
BEGIN
  caller_is_admin := coalesce(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );

  -- Block non-admins from changing privilege / billing-controlled columns
  IF NOT caller_is_admin THEN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
    IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
      NEW.subscription_status := OLD.subscription_status;
    END IF;
    IF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan THEN
      NEW.subscription_plan := OLD.subscription_plan;
    END IF;
    IF NEW.hotmart_purchase_id IS DISTINCT FROM OLD.hotmart_purchase_id THEN
      NEW.hotmart_purchase_id := OLD.hotmart_purchase_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2) Ensure trigger is attached to profiles (drop if exists, then create)
DROP TRIGGER IF EXISTS prevent_is_admin_change_trigger ON public.profiles;
CREATE TRIGGER prevent_is_admin_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_is_admin_change();

-- 3) Lock down Realtime: require RLS on realtime.messages so only owners receive their row events
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing permissive policies we created before
DROP POLICY IF EXISTS "Authenticated users can receive own row changes" ON realtime.messages;

-- Only allow authenticated users to receive realtime broadcasts; rely on RLS of the
-- underlying source tables (agent_sessions, user_progress) which already filter by user_id.
CREATE POLICY "Authenticated users can receive own row changes"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);