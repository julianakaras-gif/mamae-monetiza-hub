-- Limpar duplicatas em user_progress mantendo a mais recente por (user_id, agent_id, project_id)
DELETE FROM public.user_progress a
USING public.user_progress b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id
  AND a.agent_id = b.agent_id
  AND a.project_id IS NOT DISTINCT FROM b.project_id;

-- Índice único parcial para linhas com project_id definido
CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_agent_project_uidx
  ON public.user_progress (user_id, agent_id, project_id)
  WHERE project_id IS NOT NULL;

-- Índice único parcial para linhas globais (sem projeto)
CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_agent_noproject_uidx
  ON public.user_progress (user_id, agent_id)
  WHERE project_id IS NULL;

-- Limpar duplicatas em agent_outputs
DELETE FROM public.agent_outputs a
USING public.agent_outputs b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id
  AND a.agent_id = b.agent_id
  AND a.project_id IS NOT DISTINCT FROM b.project_id;

CREATE UNIQUE INDEX IF NOT EXISTS agent_outputs_user_agent_project_uidx
  ON public.agent_outputs (user_id, agent_id, project_id)
  WHERE project_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS agent_outputs_user_agent_noproject_uidx
  ON public.agent_outputs (user_id, agent_id)
  WHERE project_id IS NULL;