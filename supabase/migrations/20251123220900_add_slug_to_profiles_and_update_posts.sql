-- Funcao para gerar slug a partir de um texto
create or replace function public.slugify(
  "value" text
)
returns text as $$
  with "unaccented" as (
    select unaccent("value") as "value"
  ),
  "lowercase" as (
    select lower("value") as "value"
    from "unaccented"
  ),
  "replaced" as (
    select regexp_replace("value", '[^a-z0-9\s-]', '', 'g') as "value"
    from "lowercase"
  ),
  "hyphenated" as (
    select regexp_replace("value", '\s+', '-', 'g') as "value"
    from "replaced"
  ),
  "trimmed" as (
    select regexp_replace("value", '-+', '-', 'g') as "value"
    from "hyphenated"
  )
  select "value" from "trimmed";
$$ language sql strict immutable;


-- Funcao para gerar um slug unico para o perfil
create or replace function public.generate_profile_slug(
  "name" text
)
returns text as $$
declare
  "generated_slug" text;
  "suffix" int;
begin
  "generated_slug" := slugify("name");
  if "generated_slug" is null or "generated_slug" = '' then
    "generated_slug" := 'user';
  end if;

  "suffix" := 1;
  while exists(select 1 from public.profiles where profiles.slug = "generated_slug") loop
    "generated_slug" := slugify("name") || '-' || "suffix"::text;
    "suffix" := "suffix" + 1;
  end loop;

  return "generated_slug";
end;
$$ language plpgsql;


-- Atualiza a funcao handle_new_user para gerar slug
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url, email, slug)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'avatar_url', new.email, public.generate_profile_slug(new.raw_user_meta_data ->> 'name'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Backfill slugs para usuarios existentes
update profiles
set slug = public.generate_profile_slug(name)
where slug is null;
