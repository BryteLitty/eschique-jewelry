-- First, ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "admin_access_orders" ON public.orders;
DROP POLICY IF EXISTS "user_select_own_orders" ON public.orders;
DROP POLICY IF EXISTS "user_insert_own_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_access_order_items" ON public.order_items;
DROP POLICY IF EXISTS "user_select_own_order_items" ON public.order_items;
DROP POLICY IF EXISTS "orders_admin_access" ON public.orders;
DROP POLICY IF EXISTS "orders_user_access" ON public.orders;
DROP POLICY IF EXISTS "orders_user_insert" ON public.orders;
DROP POLICY IF EXISTS "order_items_admin_access" ON public.order_items;
DROP POLICY IF EXISTS "order_items_user_access" ON public.order_items;

-- Temporarily disable RLS to ensure no data access issues during migration
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Create new simplified policies for orders
CREATE POLICY "orders_admin_access"
    ON public.orders
    FOR ALL
    USING (
        -- Admin check: either is_admin = true or service_role
        (EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "orders_user_access"
    ON public.orders
    FOR SELECT
    USING (
        -- Users can view their own orders
        auth.uid() = user_id
    );

CREATE POLICY "orders_user_insert"
    ON public.orders
    FOR INSERT
    WITH CHECK (
        -- Users can only create orders for themselves
        auth.uid() = user_id
    );

-- Create new simplified policies for order items
CREATE POLICY "order_items_admin_access"
    ON public.order_items
    FOR ALL
    USING (
        -- Admin check: either is_admin = true or service_role
        (EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        ))
        OR auth.role() = 'service_role'
    );

CREATE POLICY "order_items_user_access"
    ON public.order_items
    FOR SELECT
    USING (
        -- Users can view items from their own orders
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Drop and recreate the get_all_orders function with simplified access check
DROP FUNCTION IF EXISTS public.get_all_orders();
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
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Admin check: either is_admin = true or service_role
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND users.is_admin = true
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

-- Revoke all existing privileges
REVOKE ALL ON FUNCTION public.get_all_orders() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_all_orders() FROM authenticated;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_orders() TO authenticated;

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Add helpful comments
COMMENT ON POLICY orders_admin_access ON public.orders IS 'Allows admin users and service role full access to all orders';
COMMENT ON POLICY orders_user_access ON public.orders IS 'Allows users to view their own orders';
COMMENT ON POLICY orders_user_insert ON public.orders IS 'Allows users to create orders only for themselves';
COMMENT ON POLICY order_items_admin_access ON public.order_items IS 'Allows admin users and service role full access to all order items';
COMMENT ON POLICY order_items_user_access ON public.order_items IS 'Allows users to view items from their own orders'; 