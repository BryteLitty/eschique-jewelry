-- Temporarily disable RLS for users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Allow insert during signup" ON public.users;
DROP POLICY IF EXISTS "Allow unauthenticated signup" ON public.users;
DROP POLICY IF EXISTS "Allow users to read own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own data" ON public.users;

-- Create basic policies for after re-enabling RLS
CREATE POLICY "users_policy"
    ON public.users
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (auth.uid() = id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role'); 