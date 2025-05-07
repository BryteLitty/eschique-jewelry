-- Create categories table
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.categories enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable read access for all users" on public.categories;
drop policy if exists "Enable insert for authenticated users only" on public.categories;
drop policy if exists "Enable update for authenticated users only" on public.categories;
drop policy if exists "Enable delete for authenticated users only" on public.categories;

-- Create policies
create policy "Enable read access for all users"
on public.categories for select
using (true);

create policy "Enable insert for authenticated users only"
on public.categories for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
on public.categories for update
using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
on public.categories for delete
using (auth.role() = 'authenticated');

-- Create updated_at function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Drop existing trigger if it exists
drop trigger if exists handle_updated_at on public.categories;

-- Create updated_at trigger
create trigger handle_updated_at
    before update on public.categories
    for each row
    execute function public.handle_updated_at(); 