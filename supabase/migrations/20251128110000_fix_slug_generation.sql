-- 1. Drop and recreate the function to ensure it's the latest version
DROP FUNCTION IF EXISTS public.generate_profile_slug(text);
CREATE OR REPLACE FUNCTION public.generate_profile_slug(
  "name" text
)
RETURNS text AS $$
DECLARE
  "base_slug" text;
  "generated_slug" text;
  "suffix" int;
BEGIN
  "base_slug" := slugify("name");
  IF "base_slug" IS NULL OR "base_slug" = '' THEN
    "base_slug" := 'user';
  END IF;

  "generated_slug" := "base_slug";
  "suffix" := 1;

  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE slug = "generated_slug") LOOP
    "generated_slug" := "base_slug" || '-' || "suffix"::text;
    "suffix" := "suffix" + 1;
  END LOOP;

  RETURN "generated_slug";
END;
$$ LANGUAGE plpgsql;

-- 2. Backfill any existing NULL slugs to avoid constraint violation
UPDATE public.profiles SET slug = public.generate_profile_slug(name) WHERE slug IS NULL;

-- 3. Add the NOT NULL constraint (this is idempotent in effect)
ALTER TABLE public.profiles ALTER COLUMN slug SET NOT NULL;

-- 4. Drop the unique constraint if it exists, then add it to ensure idempotency
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_slug_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_slug_key UNIQUE (slug);
