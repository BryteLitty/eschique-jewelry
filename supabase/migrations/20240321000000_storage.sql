-- Create storage bucket for products if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public; 