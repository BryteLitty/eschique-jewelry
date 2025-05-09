-- Drop all dependent triggers first
DROP TRIGGER IF EXISTS handle_updated_at ON public.products;
DROP TRIGGER IF EXISTS set_updated_at ON public.products;
DROP TRIGGER IF EXISTS handle_updated_at ON public.categories;
DROP TRIGGER IF EXISTS set_updated_at ON public.categories;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.products
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create a new trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 