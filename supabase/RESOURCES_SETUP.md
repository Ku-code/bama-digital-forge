# Resources Database Setup Guide

This guide will help you set up the Resources feature in your Supabase project.

## Step 1: Run the Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/002_resources_table.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

The migration will create:
- `resources` table with all necessary columns
- Indexes for performance
- Row Level Security (RLS) policies
- Update trigger for `updated_at` column

## Step 2: Create Storage Bucket

1. In Supabase Dashboard, navigate to **Storage** in the left sidebar
2. Click **New bucket**
3. Name it: `resources`
4. Set it to **Public** (or configure RLS policies if you want it private)
5. Click **Create bucket**

### Storage Policies (if bucket is private)

If you set the bucket to private, you'll need to add storage policies:

1. Go to **Storage** → **Policies** → Select `resources` bucket
2. Add the following policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');
```

**Policy 2: Allow authenticated users to read**
```sql
CREATE POLICY "Authenticated users can read resources"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resources');
```

**Policy 3: Allow users to delete their own files**
```sql
CREATE POLICY "Users can delete own resources"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## Step 3: Verify Setup

After running the migration and creating the bucket:

1. Go to **Table Editor** → Check that `resources` table exists
2. Go to **Storage** → Check that `resources` bucket exists
3. Try uploading a file from the Resources dashboard

## Troubleshooting

### Error: "relation 'resources' does not exist"
- **Solution**: Run the migration file `002_resources_table.sql` in SQL Editor

### Error: "bucket 'resources' not found"
- **Solution**: Create the storage bucket named `resources` in Storage settings

### Error: "permission denied" or "policy violation"
- **Solution**: 
  - Check that your user has `approved` status or `admin`/`superadmin` role
  - Verify RLS policies are correctly set up
  - If using private bucket, add storage policies as shown above

### Error: "function update_updated_at_column() does not exist"
- **Solution**: This function should be created in `001_initial_schema.sql`. If it's missing, run this:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Testing

1. Log in to the dashboard
2. Navigate to **Resources** in the sidebar
3. Click **Upload Resource** or drag and drop a file
4. Verify the file appears in the list
5. Try downloading the file
6. Try editing/deleting (if you're the creator or admin)

