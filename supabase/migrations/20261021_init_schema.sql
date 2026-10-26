-- GolpoFrame Supabase Database Migration
-- Prompt 6: Authentication, User Profiles, Stories, Characters, Panels, and Row Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. STORIES (COMIC PROJECTS)
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  punchline text,
  genre text NOT NULL DEFAULT 'action',
  is_public boolean NOT NULL DEFAULT false,
  story_source text DEFAULT 'manual',
  language text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. CHARACTERS
CREATE TABLE IF NOT EXISTS public.story_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  preset text,
  colors jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. COMIC PANELS
CREATE TABLE IF NOT EXISTS public.story_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  scene text,
  caption text,
  dialogue text,
  speaker text,
  setting text,
  pose text,
  character_preset text,
  character_colors jsonb,
  sfx text,
  image_url text,
  render_mode text DEFAULT 'procedural',
  bubble_style text DEFAULT 'speech',
  bubble_position text DEFAULT 'top-left',
  tail_direction text DEFAULT 'bottom-right',
  bubble_x numeric,
  bubble_y numeric,
  bubble_width numeric,
  font_size text DEFAULT 'base',
  caption_position text DEFAULT 'bottom',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_is_public ON public.stories(is_public);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_characters_story_id ON public.story_characters(story_id);
CREATE INDEX IF NOT EXISTS idx_panels_story_id ON public.story_panels(story_id);
CREATE INDEX IF NOT EXISTS idx_panels_order_index ON public.story_panels(story_id, order_index);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_panels ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- STORIES
DROP POLICY IF EXISTS "Public stories readable by everyone, private only by owner" ON public.stories;
CREATE POLICY "Public stories readable by everyone, private only by owner"
  ON public.stories FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create stories for themselves" ON public.stories;
CREATE POLICY "Users can create stories for themselves"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can update their stories" ON public.stories;
CREATE POLICY "Owners can update their stories"
  ON public.stories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete their stories" ON public.stories;
CREATE POLICY "Owners can delete their stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);

-- STORY CHARACTERS
DROP POLICY IF EXISTS "Characters viewable if story is accessible" ON public.story_characters;
CREATE POLICY "Characters viewable if story is accessible"
  ON public.story_characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND (s.is_public = true OR s.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners can manage characters of their stories" ON public.story_characters;
CREATE POLICY "Owners can manage characters of their stories"
  ON public.story_characters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND s.user_id = auth.uid()
    )
  );

-- STORY PANELS
DROP POLICY IF EXISTS "Panels viewable if story is accessible" ON public.story_panels;
CREATE POLICY "Panels viewable if story is accessible"
  ON public.story_panels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND (s.is_public = true OR s.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners can manage panels of their stories" ON public.story_panels;
CREATE POLICY "Owners can manage panels of their stories"
  ON public.story_panels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND s.user_id = auth.uid()
    )
  );

-- 9. AUTOMATED USER PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. TIMESTAMP AUTO-UPDATE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_stories_updated_at ON public.stories;
CREATE TRIGGER set_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
