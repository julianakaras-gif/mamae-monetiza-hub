-- Restrict realtime row-change visibility on messages to the session's owner
DROP POLICY IF EXISTS "Authenticated users can receive own row changes" ON public.messages;

CREATE POLICY "Authenticated users can receive own row changes"
ON public.messages
FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT id FROM public.agent_sessions WHERE user_id = auth.uid()
  )
);

-- Lock down SECURITY DEFINER trigger/helper functions: they are invoked by
-- triggers or RLS internally and should not be callable from PostgREST.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_is_admin_change() FROM PUBLIC, anon, authenticated;

-- is_admin() is used inside RLS policies; it must remain callable by authenticated
-- but should never be callable by anonymous users.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;