-- Add new columns to the posts table
alter table posts
add column description text,
add column slug text unique,
add column likes_count integer default 0,
add column category text,
add column views_count integer default 0;