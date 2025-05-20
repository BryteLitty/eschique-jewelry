-- Drop existing orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Create new orders policies
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Admins can manage all orders"
    ON public.orders FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND is_admin = true
    ));

-- Drop existing order items policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;

-- Create new order items policies
CREATE POLICY "Users can view their own order items"
    ON public.order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders 
        WHERE order_items.order_id = orders.id 
        AND orders.user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all order items"
    ON public.order_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND is_admin = true
    )); 