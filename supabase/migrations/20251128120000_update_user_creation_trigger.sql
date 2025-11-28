-- 1. Drop the existing trigger and function to ensure a clean update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create the new, corrected handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
BEGIN
  -- Combine first_name and last_name from the user metadata to create a full name.
  -- The trim function handles cases where one of the names might be missing.
  full_name := trim(concat(
    new.raw_user_meta_data ->> 'first_name',
    ' ',
    new.raw_user_meta_data ->> 'last_name'
  ));

  -- Insert the new user's profile, using the combined full_name for both the 'name' field
  -- and for generating the profile slug.
  INSERT INTO public.profiles (id, name, first_name, last_name, avatar_url, email, slug)
  VALUES (
    new.id,
    full_name,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    public.generate_profile_slug(full_name) -- Generate slug from the full name
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger to call the new function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Comment for clarity
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile for a new user, generating a full name and a unique slug from the registration metadata.';
