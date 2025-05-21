-- First, drop any conflicting policies
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Allow insert during signup" ON public.users;

-- Create a policy that allows anyone to insert during signup
CREATE POLICY "Allow unauthenticated signup"
    ON public.users 
    FOR INSERT 
    WITH CHECK (true);

-- Ensure other policies remain for authenticated access
CREATE POLICY "Allow users to read own data"
    ON public.users
    FOR SELECT
    USING (
        -- Allow authenticated users to read their own data
        (auth.uid() = id)
        OR 
        -- Allow unauthenticated access during signup
        (auth.role() IS NULL)
    );

-- Update the policy for user updates
CREATE POLICY "Allow users to update own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 