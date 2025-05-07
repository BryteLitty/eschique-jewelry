# Supabase Migrations

This directory contains database migrations for the Supabase project.

## Storage Policies

The `20240321000000_storage.sql` file contains the storage policies for the application. These policies control access to the storage buckets.

### How to Apply

1. Using Supabase CLI:
```bash
supabase db push
```

2. Or manually in the Supabase Dashboard:
   - Go to your project's SQL Editor
   - Copy the contents of `20240321000000_storage.sql`
   - Paste and run the SQL commands

### Storage Buckets

The migration creates and configures the following storage bucket:

- `products`: For storing product and category images
  - Public read access
  - Authenticated users can upload and delete files
  - Files are organized in subfolders (products/, categories/)

### Policies

1. Public Read Access
   - Anyone can view files in the products bucket
   - Used for displaying images on the website

2. Authenticated Uploads
   - Only authenticated users can upload files
   - Files must be uploaded to the products bucket

3. Authenticated Deletes
   - Only authenticated users can delete files
   - Files must be in the products bucket

4. Authenticated Updates
   - Only authenticated users can update files
   - Files must be in the products bucket

### Performance

The migration also creates indexes for better query performance:
- `idx_objects_bucket_id`: For filtering by bucket
- `idx_objects_name`: For searching by filename
- `idx_objects_owner`: For filtering by owner 