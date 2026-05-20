
CREATE OR REPLACE FUNCTION public.prevent_is_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  caller_is_admin boolean;
  caller_role text;
BEGIN
  caller_role := current_setting('request.jwt.claims', true)::json->>'role';

  -- service_role (edge functions com SUPABASE_SERVICE_ROLE_KEY) sempre permitido
  IF caller_role = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  caller_is_admin := coalesce(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );

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

CREATE OR REPLACE FUNCTION public.prevent_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  caller_role text;
BEGIN
  caller_role := current_setting('request.jwt.claims', true)::json->>'role';

  IF caller_role = 'service_role' OR auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
     OR NEW.hotmart_purchase_id IS DISTINCT FROM OLD.hotmart_purchase_id THEN
    RAISE EXCEPTION 'Não é permitido alterar dados de assinatura';
  END IF;
  RETURN NEW;
END;
$function$;

-- Libera a Douglas que ficou inativo
UPDATE public.profiles
SET subscription_status = 'active', subscription_plan = coalesce(subscription_plan, 'mensal')
WHERE id = '1960c71e-766c-46ce-87f0-7f1ffdeba06f';
