-- 1. Add denormalized profile columns to the posts table
alter table public.posts
add column if not exists profile_slug text,
add column if not exists profile_name text,
add column if not exists profile_avatar_url text;

-- 2. Create a function to update post details when profile changes
create or replace function public.handle_profile_update()
returns trigger as $$
begin
  -- Check if the slug, name, or avatar_url has changed
  if old.slug is distinct from new.slug or
     old.name is distinct from new.name or
     old.avatar_url is distinct from new.avatar_url then
       update public.posts
       set
         profile_slug = new.slug,
         profile_name = new.name,
         profile_avatar_url = new.avatar_url
       where
         posts.user_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Create a trigger to call the function after a profile is updated
drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  after update on public.profiles
  for each row
  execute procedure public.handle_profile_update();

-- 4. Backfill existing posts with the profile data
update public.posts p
set
  profile_slug = prof.slug,
  profile_name = prof.name,
  profile_avatar_url = prof.avatar_url
from public.profiles prof
where p.user_id = prof.id;
