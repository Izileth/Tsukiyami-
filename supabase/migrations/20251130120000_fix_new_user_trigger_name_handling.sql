-- 1. Drop the existing trigger and function for a clean update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recreate the handle_new_user function to correctly handle user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
BEGIN
  -- Concatenate first_name and last_name from the user metadata.
  -- The trim is to handle cases where one might be missing.
  full_name := trim((new.raw_user_meta_data ->> 'first_name') || ' ' || (new.raw_user_meta_data ->> 'last_name'));

  -- If full_name is empty or null, use a default or raise an error
  IF full_name IS NULL OR full_name = '' THEN
    full_name := 'New User'; -- Or handle as an error
  END IF;

  INSERT INTO public.profiles (id, name, avatar_url, email, slug)
  VALUES (
    new.id,
    full_name,
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    public.generate_profile_slug(full_name)
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Provide a detailed error message to aid in debugging
    RAISE EXCEPTION 'Failed to create profile for new user. ID: %, Email: %. Error: %', new.id, new.email, SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger on the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Comment on the function for clarity
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a public profile for a new user, constructing their name from metadata and generating a slug. Includes detailed error handling.';
