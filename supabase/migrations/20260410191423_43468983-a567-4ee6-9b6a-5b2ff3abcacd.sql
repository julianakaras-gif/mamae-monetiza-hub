
-- Add is_admin flag
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Security definer function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Admin RLS policies
CREATE POLICY "Admin lê todos os perfis"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin lê todos os projetos"
  ON public.projects FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin lê todo progresso"
  ON public.user_progress FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin lê todas as sessões"
  ON public.agent_sessions FOR SELECT
  USING (public.is_admin());
