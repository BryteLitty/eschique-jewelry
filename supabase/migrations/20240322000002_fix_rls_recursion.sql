-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow insert during signup" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Create new simplified policies
-- Allow service role to insert users during signup
CREATE POLICY "Enable insert for service role"
    ON public.users FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Allow authenticated users to view and update their own data
CREATE POLICY "Enable read access for authenticated users"
    ON public.users FOR SELECT
    USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- Allow service role to manage all users
CREATE POLICY "Enable service role to manage users"
    ON public.users FOR ALL
    USING (auth.role() = 'service_role');

-- Allow service role to manage all orders
CREATE POLICY "Enable service role to manage orders"
    ON public.orders FOR ALL
    USING (auth.role() = 'service_role'); 