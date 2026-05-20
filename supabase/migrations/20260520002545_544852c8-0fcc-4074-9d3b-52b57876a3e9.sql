CREATE OR REPLACE FUNCTION public.prevent_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
     OR NEW.hotmart_purchase_id IS DISTINCT FROM OLD.hotmart_purchase_id THEN
    RAISE EXCEPTION 'Não é permitido alterar dados de assinatura';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_subscription_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS prevent_subscription_change_trigger ON public.profiles;
CREATE TRIGGER prevent_subscription_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_change();