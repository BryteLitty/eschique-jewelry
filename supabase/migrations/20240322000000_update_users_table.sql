-- Add new columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_city ON public.users(city);
CREATE INDEX IF NOT EXISTS idx_users_state ON public.users(state);

-- Update RLS policies to allow users to update their own data
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Add a trigger to sync user metadata with auth.users
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update auth.users metadata when users table is updated
    IF TG_OP = 'UPDATE' THEN
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_build_object(
            'full_name', NEW.full_name,
            'phone_number', NEW.phone_number,
            'address', NEW.address,
            'city', NEW.city,
            'state', NEW.state,
            'zip_code', NEW.zip_code
        )
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for syncing metadata
DROP TRIGGER IF EXISTS sync_user_metadata_trigger ON public.users;
CREATE TRIGGER sync_user_metadata_trigger
    AFTER UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_metadata(); 