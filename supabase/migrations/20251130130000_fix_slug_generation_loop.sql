-- 1. Overwrite the slug generation function to be more robust.
-- This version corrects a bug where the slug could become NULL inside the uniqueness-check loop
-- if the input name was NULL or empty.
CREATE OR REPLACE FUNCTION public.generate_profile_slug("name" text)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  generated_slug TEXT;
  suffix INT;
BEGIN
  -- 1. Create a base slug from the name, with a fallback
  base_slug := slugify("name");
  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := 'user';
  END IF;

  -- 2. Check for uniqueness and append a suffix if needed
  generated_slug := base_slug;
  suffix := 1;
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE slug = generated_slug) LOOP
    generated_slug := base_slug || '-' || suffix::text;
    suffix := suffix + 1;
  END LOOP;

  RETURN generated_slug;
END;
$$ LANGUAGE plpgsql;

-- 2. Add a comment for clarity
COMMENT ON FUNCTION public.generate_profile_slug(text) IS 'Generates a unique, URL-friendly slug from a name. Correctly handles name conflicts by appending a numeric suffix.';
