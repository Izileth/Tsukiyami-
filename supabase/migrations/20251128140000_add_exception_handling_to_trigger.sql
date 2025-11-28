-- 1. Drop the existing trigger and function to ensure a clean update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recreate the handle_new_user function with detailed exception handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, email, slug)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    public.generate_profile_slug(new.raw_user_meta_data ->> 'name')
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Raise a more detailed exception to help debug the exact cause of the failure.
    -- This will pass the specific PostgreSQL error message to the client.
    RAISE EXCEPTION 'Error creating user profile. Details: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Comment for clarity
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile for a new user and includes exception handling to provide detailed error messages on failure.';
