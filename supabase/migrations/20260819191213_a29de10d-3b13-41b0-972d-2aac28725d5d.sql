ALTER TABLE public.projects
  ADD COLUMN trilha text NULL
    CONSTRAINT projects_trilha_check
    CHECK (trilha IS NULL OR trilha IN ('af', 'ugc', 'pp', 'dk'));