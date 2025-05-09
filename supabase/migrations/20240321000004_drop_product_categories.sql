-- First drop the foreign key constraint from products table
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- Now we can safely drop the product_categories table
DROP TABLE IF EXISTS public.product_categories;

-- Add the correct foreign key constraint to reference categories table
ALTER TABLE public.products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.categories(id); 