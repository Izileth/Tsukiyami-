create function increment_view_count(post_slug text)
returns void as $$
  update posts
  set views_count = views_count + 1
  where slug = post_slug;
$$ language sql;
