-- Add new columns to the profiles table
alter table profiles
add column slug text unique,
add column email text unique not null,
add column "password" text,
add column first_name text,
add column last_name text;

-- Update the handle_new_user function to include the new email field
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url, email)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
