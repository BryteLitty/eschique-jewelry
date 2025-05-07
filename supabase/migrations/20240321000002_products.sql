-- Create products table
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    price decimal(10,2) not null,
    image_url text,
    in_stock boolean default true,
    category_id uuid references public.categories(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.products enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable read access for all users" on public.products;
drop policy if exists "Enable insert for authenticated users only" on public.products;
drop policy if exists "Enable update for authenticated users only" on public.products;
drop policy if exists "Enable delete for authenticated users only" on public.products;

-- Create policies
create policy "Enable read access for all users"
on public.products for select
using (true);

create policy "Enable insert for authenticated users only"
on public.products for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
on public.products for update
using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
on public.products for delete
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
drop trigger if exists handle_updated_at on public.products;

-- Create updated_at trigger
create trigger handle_updated_at
    before update on public.products
    for each row
    execute function public.handle_updated_at(); 