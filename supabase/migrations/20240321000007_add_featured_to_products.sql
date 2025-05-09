-- Add featured column to products table
ALTER TABLE public.products ADD COLUMN featured BOOLEAN DEFAULT false;

-- Create an index for faster filtering
CREATE INDEX idx_products_featured ON public.products(featured); 