-- Allow progress / outputs to be tracked per project
-- 1) Drop the old (user_id, agent_id) unique constraint and replace with (user_id, agent_id, project_id)

ALTER TABLE public.user_progress
  DROP CONSTRAINT IF EXISTS user_progress_user_id_agent_id_key;

-- Use a partial unique index so NULL project_id is also de-duplicated correctly
CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_agent_project_uidx
  ON public.user_progress (user_id, agent_id, COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- 2) Same treatment for agent_outputs so each project keeps its own summary
ALTER TABLE public.agent_outputs
  DROP CONSTRAINT IF EXISTS agent_outputs_user_id_agent_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS agent_outputs_user_agent_project_uidx
  ON public.agent_outputs (user_id, agent_id, COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- 3) Make sure realtime broadcasts INSERT/UPDATE for user_progress
ALTER TABLE public.user_progress REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_progress'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress';
  END IF;
END$$;