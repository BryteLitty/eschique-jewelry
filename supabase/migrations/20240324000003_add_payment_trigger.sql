-- Create a function to handle payment status updates
CREATE OR REPLACE FUNCTION public.handle_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If payment_status is not explicitly set, default to 'pending'
    IF NEW.payment_status IS NULL THEN
        NEW.payment_status := 'pending';
    END IF;

    -- If status is 'processing' or 'shipped' or 'delivered', ensure payment_status is 'paid'
    IF NEW.status IN ('processing', 'shipped', 'delivered') THEN
        NEW.payment_status := 'paid';
    END IF;

    -- If status is 'cancelled', ensure payment_status is 'failed' unless it's already 'paid'
    IF NEW.status = 'cancelled' AND NEW.payment_status != 'paid' THEN
        NEW.payment_status := 'failed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_payment_status_trigger ON public.orders;

-- Create trigger to run before insert or update
CREATE TRIGGER ensure_payment_status_trigger
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_payment_status();

-- Add comment
COMMENT ON FUNCTION public.handle_payment_status() IS 'Ensures payment status consistency based on order status';

-- Update any existing orders to ensure consistency
UPDATE public.orders
SET payment_status = 'paid'
WHERE status IN ('processing', 'shipped', 'delivered')
AND payment_status != 'paid';

UPDATE public.orders
SET payment_status = 'failed'
WHERE status = 'cancelled'
AND payment_status NOT IN ('paid', 'failed'); 