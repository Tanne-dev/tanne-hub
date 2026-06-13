ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS title_vi text,
  ADD COLUMN IF NOT EXISTS caption_vi text,
  ADD COLUMN IF NOT EXISTS content_vi text;
