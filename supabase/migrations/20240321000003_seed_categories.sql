-- Add unique constraint on name column
ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name);

-- Insert initial categories
insert into public.categories (name, description, image_url)
values 
  ('Watches', 'Luxury timepieces', 'https://example.com/watches.jpg'),
  ('Jewelry', 'Elegant accessories', 'https://example.com/jewelry.jpg'),
  ('Bags', 'Designer handbags', 'https://example.com/bags.jpg'),
  ('Shoes', 'Premium footwear', 'https://example.com/shoes.jpg'),
  ('Accessories', 'Style essentials', 'https://example.com/accessories.jpg')
on conflict (name) do update
set description = excluded.description,
    image_url = excluded.image_url; 