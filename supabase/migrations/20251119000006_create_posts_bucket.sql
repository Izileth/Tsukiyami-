-- Create posts bucket
insert into storage.buckets (id, name, public)
  values ('posts', 'posts', true);

-- Add policies for posts bucket
create policy "Post images are publicly accessible." on storage.objects
  for select using (bucket_id = 'posts');

create policy "Anyone can upload a post image." on storage.objects
  for insert with check (bucket_id = 'posts');
