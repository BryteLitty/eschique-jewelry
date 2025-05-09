-- Add stock_quantity column to products table
ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER DEFAULT 0;

-- Update existing products to have stock_quantity based on in_stock status
UPDATE public.products 
SET stock_quantity = CASE 
    WHEN in_stock = true THEN 10 
    ELSE 0 
END;

-- Create an index for faster filtering
CREATE INDEX idx_products_stock_quantity ON public.products(stock_quantity); 