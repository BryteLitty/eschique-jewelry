-- Drop all existing policies
DROP POLICY IF EXISTS "Enable users to view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable users to create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable admins to manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Enable users to view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable admins to manage all order items" ON public.order_items;

-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create a single policy for admin access to orders
CREATE POLICY "admin_access_orders"
    ON public.orders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
        OR auth.role() = 'service_role'
    );

-- Create a policy for users to view their own orders
CREATE POLICY "user_select_own_orders"
    ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create a policy for users to create their own orders
CREATE POLICY "user_insert_own_orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create a single policy for admin access to order items
CREATE POLICY "admin_access_order_items"
    ON public.order_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
        OR auth.role() = 'service_role'
    );

-- Create a policy for users to view their own order items
CREATE POLICY "user_select_own_order_items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    ); 