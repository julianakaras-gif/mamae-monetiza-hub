-- 1) Remove duplicate overly-permissive SELECT policy on public.messages
DROP POLICY IF EXISTS "Authenticated users can receive own row changes" ON public.messages;

-- The owner-scoped policy "Users can select own messages" remains in place.

-- 2) Replace the open realtime.messages policy with a scoped one
DROP POLICY IF EXISTS "Authenticated users can receive own row changes" ON realtime.messages;

CREATE POLICY "Users can subscribe to own realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Postgres Changes are already filtered by each table's RLS
  (extension = 'postgres_changes')
  OR
  -- Broadcast / presence channels: topic must include the user's own id
  (realtime.topic() LIKE '%' || auth.uid()::text || '%')
);