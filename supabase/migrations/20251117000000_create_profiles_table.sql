-- Create a table for public user profiles
create table profiles (
  id uuid references auth.users not null primary key,
  name text,
  avatar_url text,
  banner_url text,
  bio text,
  "role" text check ("role" in ('ADM', 'US')) default 'US'::text,
  "position" text,
  social_media_links jsonb,
  website text,
  location text,
  birth_date date,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage!
-- See https://supabase.com/docs/guides/storage/security/access-control#policy-examples
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

insert into storage.buckets (id, name)
  values ('banners', 'banners');

create policy "Banner images are publicly accessible." on storage.objects
  for select using (bucket_id = 'banners');

create policy "Anyone can upload a banner." on storage.objects
  for insert with check (bucket_id = 'banners');
