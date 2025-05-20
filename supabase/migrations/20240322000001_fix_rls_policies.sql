-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Allow insert during signup" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Only admins can modify products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Create simplified user policies
CREATE POLICY "Enable read access for all authenticated users"
    ON public.users FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Allow insert during signup"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create simplified product policies
CREATE POLICY "Anyone can view products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage products"
    ON public.products FOR ALL
    USING (auth.role() = 'authenticated');

-- Create simplified cart policies
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;

CREATE POLICY "Users can manage their own cart"
    ON public.cart_items FOR ALL
    USING (auth.uid() = user_id);

-- Create orders policies
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage all orders"
    ON public.orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    ); 