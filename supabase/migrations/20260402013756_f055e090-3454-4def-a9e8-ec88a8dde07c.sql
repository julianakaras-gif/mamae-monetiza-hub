
-- Drop existing profiles table and related objects
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles with id referencing auth.users directly
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  email text,
  subscription_status text NOT NULL DEFAULT 'inactive',
  hotmart_purchase_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- agent_sessions
CREATE TABLE public.agent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own sessions"
  ON public.agent_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.agent_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.agent_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.agent_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.agent_sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own messages"
  ON public.messages FOR SELECT
  USING (session_id IN (SELECT id FROM public.agent_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own messages"
  ON public.messages FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM public.agent_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (session_id IN (SELECT id FROM public.agent_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  USING (session_id IN (SELECT id FROM public.agent_sessions WHERE user_id = auth.uid()));

-- agent_outputs
CREATE TABLE public.agent_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own outputs"
  ON public.agent_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outputs"
  ON public.agent_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outputs"
  ON public.agent_outputs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outputs"
  ON public.agent_outputs FOR DELETE
  USING (auth.uid() = user_id);

-- user_favorites
CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- user_progress
CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Recreate trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
