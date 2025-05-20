-- First, drop the existing status constraint
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Now update the existing data
UPDATE public.orders
SET status = CASE 
    WHEN status = 'Pending' THEN 'pending'
    WHEN status = 'Paid' THEN 'processing'
    WHEN status = 'Shipped' THEN 'shipped'
    WHEN status = 'processing' THEN 'processing'
    WHEN status = 'pending' THEN 'pending'
    WHEN status = 'shipped' THEN 'shipped'
    ELSE 'pending'
END;

-- Verify all status values are valid
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.orders 
        WHERE status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    ) THEN
        RAISE EXCEPTION 'Found invalid status values in orders table';
    END IF;
END $$;

-- Now proceed with schema changes
ALTER TABLE public.orders
ADD COLUMN order_number VARCHAR,
ADD COLUMN payment_status VARCHAR,
ADD COLUMN shipping_address JSONB;

-- Update existing rows with default values
UPDATE public.orders
SET 
    order_number = 'ORD-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
    payment_status = CASE 
        WHEN status = 'processing' THEN 'paid'
        ELSE 'pending'
    END,
    shipping_address = '{
        "full_name": "",
        "address_line1": "",
        "address_line2": "",
        "city": "",
        "state": "",
        "postal_code": "",
        "country": "",
        "phone": ""
    }'::jsonb;

-- Now add NOT NULL constraints
ALTER TABLE public.orders
ALTER COLUMN order_number SET NOT NULL,
ALTER COLUMN payment_status SET NOT NULL,
ALTER COLUMN shipping_address SET NOT NULL;

-- Add check constraint for payment_status
ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- Add the new status check constraint
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check CHECK (
  status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
);

-- Create index on order_number for faster lookups
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

-- Create index on payment_status for filtering
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);

-- Create index on status for filtering
CREATE INDEX idx_orders_status ON public.orders(status);

-- Add comment to table
COMMENT ON TABLE public.orders IS 'Stores order information including shipping details and payment status';

-- Add comments to columns
COMMENT ON COLUMN public.orders.order_number IS 'Unique order identifier';
COMMENT ON COLUMN public.orders.total_amount IS 'Total amount of the order';
COMMENT ON COLUMN public.orders.status IS 'Current status of the order (pending, processing, shipped, delivered, cancelled)';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status of the order (pending, paid, failed)';
COMMENT ON COLUMN public.orders.shipping_address IS 'JSON object containing shipping address details';
COMMENT ON COLUMN public.orders.created_at IS 'Timestamp when the order was created'; 