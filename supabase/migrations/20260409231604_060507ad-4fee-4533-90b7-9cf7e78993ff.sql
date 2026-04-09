
-- PASSO 1: Novas colunas em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS niche text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS subscription_plan text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- PASSO 2: Novas colunas em projects (tabela já existe)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS niche text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- PASSO 3: project_id em user_progress (já existe em agent_sessions e agent_outputs)
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- PASSO 4: Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_sessions;
