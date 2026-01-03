# Resources Feature - Complete Setup Guide

This guide will help you set up the Resources feature in your Supabase project. Follow these steps **in order** to ensure everything works correctly.

## Prerequisites

- You have a Supabase project created
- You have run the initial database migration (`001_initial_schema.sql`)
- You have admin access to your Supabase project

## Step 1: Run the Resources Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the **entire contents** of `supabase/migrations/002_resources_table.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for the success message

**What this creates:**
- `resources` table with all necessary columns
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Update trigger for `updated_at` column

**Verify:**
- Go to **Table Editor** → You should see the `resources` table
- Check that it has all columns: `id`, `title`, `description`, `file_path`, `file_name`, `file_size`, `mime_type`, `category`, `created_by`, `created_by_name`, `created_by_image`, `created_at`, `updated_at`

## Step 2: Create the Storage Bucket

1. In Supabase Dashboard, navigate to **Storage** in the left sidebar
2. Click **New bucket** button (top right)
3. Configure the bucket:
   - **Name**: `resources` (must be exactly this name, lowercase)
   - **Public bucket**: ❌ **No** (unchecked - keep it private for security)
   - **File size limit**: 50 MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty (allows all file types)
4. Click **Create bucket**
5. Wait for the bucket to be created

**Verify:**
- Go to **Storage** → You should see the `resources` bucket listed
- Click on it to see it's empty (no files yet)

## Step 3: Set Up Storage Policies

Since the bucket is private, you need to add storage policies to allow authenticated users to upload, read, and manage files.

1. In Supabase Dashboard, go to **Storage** → **Policies**
2. Click on the `resources` bucket
3. Click **New Policy** → **For full customization**
4. Add the following policies one by one:

### Policy 1: Allow authenticated users to upload resources

**Policy Name:** `Authenticated users can upload resources`

**Policy Definition:**
```sql
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');
```

**Target roles:** `authenticated`

**USING expression:** (leave empty)

**WITH CHECK expression:** `bucket_id = 'resources'`

Click **Review** → **Save policy**

### Policy 2: Allow authenticated users to read resources

**Policy Name:** `Authenticated users can read resources`

**Policy Definition:**
```sql
CREATE POLICY "Authenticated users can read resources"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resources');
```

**Target roles:** `authenticated`

**USING expression:** `bucket_id = 'resources'`

**WITH CHECK expression:** (leave empty)

Click **Review** → **Save policy**

### Policy 3: Allow users to delete their own files

**Policy Name:** `Users can delete own resources`

**Policy Definition:**
```sql
CREATE POLICY "Users can delete own resources"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Target roles:** `authenticated`

**USING expression:** 
```
bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text
```

**WITH CHECK expression:** (leave empty)

Click **Review** → **Save policy**

### Policy 4: Allow admins to manage all resources

**Policy Name:** `Admins can manage all resources`

**Policy Definition:**
```sql
CREATE POLICY "Admins can manage all resources"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id::text = auth.uid()::text
    AND users.role IN ('superadmin', 'admin')
  )
);
```

**Target roles:** `authenticated`

**USING expression:**
```
bucket_id = 'resources' AND EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role IN ('superadmin', 'admin'))
```

**WITH CHECK expression:** (same as USING)

Click **Review** → **Save policy**

## Step 4: Verify Your User Status

The Resources feature requires users to have `approved` status or `admin`/`superadmin` role.

1. Go to **Table Editor** → `users` table
2. Find your user account
3. Verify:
   - `status` is set to `approved` (not `pending` or `rejected`)
   - `role` is set to `superadmin`, `admin`, or `member`

**If your status is `pending`:**
- If you're the first user, you can update it manually:
  ```sql
  UPDATE users 
  SET status = 'approved', role = 'superadmin' 
  WHERE email = 'your-email@example.com';
  ```
- Or ask an admin to approve your account

## Step 5: Test the Resources Feature

1. **Log in** to your BAMAS website
2. Navigate to **Dashboard** → **Resources** (Ресурси)
3. Try uploading a file:
   - Click **Upload Resource** button, OR
   - Drag and drop a file onto the page
4. Verify:
   - File uploads successfully
   - File appears in the resources list
   - You can download the file
   - You can edit/delete the file (if you're the creator or admin)

## Troubleshooting

### Error: "Resources table not found" or "relation 'resources' does not exist"

**Solution:**
- Run the migration file `002_resources_table.sql` in SQL Editor
- Verify the table exists in Table Editor

### Error: "Storage bucket 'resources' not found" or "bucket not found"

**Solution:**
- Create the storage bucket named `resources` (exactly this name, lowercase)
- Verify it exists in Storage → Buckets

### Error: "permission denied" or "policy violation"

**Possible causes:**
1. **User not approved:**
   - Check your `status` in the `users` table
   - Update to `approved` if needed

2. **Storage policies not set:**
   - Verify all 4 storage policies are created
   - Check that policies target `authenticated` role
   - Ensure bucket name in policies is `'resources'`

3. **RLS policies blocking access:**
   - Verify RLS is enabled on `resources` table
   - Check that RLS policies allow your user role/status

**Quick fix:**
```sql
-- Check your user status
SELECT id, email, status, role FROM users WHERE email = 'your-email@example.com';

-- If pending, approve yourself (if you're the first user)
UPDATE users 
SET status = 'approved', role = 'superadmin' 
WHERE email = 'your-email@example.com';
```

### Error: "File is too large"

**Solution:**
- Maximum file size is 50MB by default
- Upload a smaller file, or increase the bucket's file size limit in Storage settings

### Error: "Authentication error" or "JWT expired"

**Solution:**
- Log out and log back in
- Clear browser cache and cookies
- Check that your Supabase session is valid

### Drag and Drop Not Working

**Solution:**
- Make sure you're dragging files (not folders)
- Try clicking the "Upload Resource" button instead
- Check browser console for errors
- Ensure JavaScript is enabled

## Quick Setup Checklist

- [ ] Ran `002_resources_table.sql` migration in SQL Editor
- [ ] Verified `resources` table exists in Table Editor
- [ ] Created `resources` storage bucket (private)
- [ ] Added 4 storage policies (upload, read, delete own, admin manage all)
- [ ] Verified user status is `approved`
- [ ] Tested file upload (button and drag-and-drop)
- [ ] Tested file download
- [ ] Tested file edit/delete

## Need Help?

If you're still experiencing issues:
1. Check the browser console for detailed error messages
2. Check Supabase logs in Dashboard → Logs
3. Verify all steps above are completed
4. Ensure your user account has the correct status and role

## Next Steps

Once Resources is working:
- Upload your organization's logos and assets
- Organize resources by category (Logos, Documents, Templates, etc.)
- Share resources with approved members
- Use the search and filter features to find resources quickly

