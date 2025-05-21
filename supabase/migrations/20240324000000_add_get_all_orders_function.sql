-- Create a function to get all orders with service role privileges
CREATE OR REPLACE FUNCTION public.get_all_orders()
RETURNS TABLE (
    id uuid,
    order_number varchar,
    user_id uuid,
    total_amount numeric,
    status varchar,
    payment_status varchar,
    created_at timestamptz,
    shipping_address jsonb,
    user_email varchar,
    user_full_name varchar
) 
SECURITY DEFINER -- This makes the function run with the privileges of the owner
SET search_path = public -- This prevents search_path issues
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if the user is an admin or has service_role
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND is_admin = true
    ) AND auth.role() != 'service_role' THEN
        RAISE EXCEPTION 'Access denied. User must be an admin.';
    END IF;

    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        o.user_id,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at,
        o.shipping_address,
        u.email as user_email,
        u.full_name as user_full_name
    FROM public.orders o
    LEFT JOIN public.users u ON o.user_id = u.id
    ORDER BY o.created_at DESC;
END;
$$;

-- Revoke execute from public and authenticated
REVOKE EXECUTE ON FUNCTION public.get_all_orders() FROM public, authenticated;

-- Grant execute to authenticated users (the function will still check for admin status)
GRANT EXECUTE ON FUNCTION public.get_all_orders() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_all_orders IS 'Gets all orders with user information, bypassing RLS. Only accessible by admins.'; 