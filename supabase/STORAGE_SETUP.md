# Supabase Storage Setup Guide

## Creating the Documents Bucket

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `documents`
   - **Public bucket**: ❌ No (unchecked - private bucket)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Leave empty (allows all types)

5. Click **Create bucket**

## Storage Policies

After creating the bucket, you need to set up storage policies. Go to **Storage** > **Policies** > **documents** and add the following policies:

### Policy 1: Authenticated users can upload files
```sql
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
```

### Policy 2: Authenticated users can read files
```sql
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

### Policy 3: Users can update their own files
```sql
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Policy 4: Users can delete their own files
```sql
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Policy 5: Admins can manage all files
```sql
CREATE POLICY "Admins can manage all documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id::text = auth.uid()::text
    AND role IN ('superadmin', 'admin')
  )
);
```

## Creating the Avatars Bucket (for profile images)

1. Create another bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Yes (checked - public bucket for easy access)
   - **File size limit**: 2 MB
   - **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp`

2. Add similar policies for the avatars bucket (same as above, but replace `documents` with `avatars`)

## File Path Structure

When uploading files, use this structure:
- Documents: `{user_id}/{timestamp}-{filename}`
- Avatars: `{user_id}/avatar.{ext}`

This makes it easier to manage files per user and implement policies.

