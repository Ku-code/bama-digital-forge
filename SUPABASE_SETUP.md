# Supabase Setup Guide

This guide will help you set up Supabase for the BAMAS Digital Forge application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (no credit card required)
3. Click "New Project"
4. Fill in the project details:
   - **Name**: BAMAS Digital Forge (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

3. Replace the placeholder values with your actual credentials from Step 2

## Step 4: Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Open the file `supabase/migrations/001_initial_schema.sql`
3. Copy the entire SQL content
4. Paste it into the SQL Editor in Supabase
5. Click "Run" to execute the migration
6. Verify that all tables were created by checking the **Table Editor** in the left sidebar

## Step 5: Set Up Storage Buckets

1. Go to **Storage** in the Supabase dashboard
2. Create the following buckets:

### Documents Bucket
- Click "New bucket"
- **Name**: `documents`
- **Public bucket**: ❌ No (unchecked)
- **File size limit**: 10 MB
- **Allowed MIME types**: (leave empty for all types)
- Click "Create bucket"

### Avatars Bucket
- Click "New bucket"
- **Name**: `avatars`
- **Public bucket**: ✅ Yes (checked)
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp`
- Click "Create bucket"

3. Set up storage policies (see `supabase/STORAGE_SETUP.md` for detailed instructions)

## Step 6: Configure Google OAuth (Optional)

If you want to use Google authentication:

1. Go to **Authentication** > **Providers** in Supabase dashboard
2. Enable **Google** provider
3. Add your Google OAuth Client ID and Secret
4. Add redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Update your `.env` file with `VITE_GOOGLE_CLIENT_ID`

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Try to register a new user
3. Check the Supabase dashboard to verify:
   - User appears in the `users` table
   - First user should have `role: superadmin` and `status: approved`

## Step 8: Migrate Existing Data (Optional)

If you have existing data in localStorage:

1. Open your browser console
2. Import the migration function:
   ```javascript
   import { migrateLocalStorageToSupabase } from './src/lib/migrate-localstorage';
   ```
3. Run the migration:
   ```javascript
   await migrateLocalStorageToSupabase();
   ```
4. Check the console for migration statistics

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file exists and contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after creating/updating `.env`

### "Row Level Security policy violation" error
- Make sure you've run the SQL migration (`001_initial_schema.sql`)
- Check that RLS policies are enabled in the Supabase dashboard

### "Storage bucket not found" error
- Make sure you've created the `documents` and `avatars` buckets
- Verify bucket names match exactly: `documents` and `avatars`

### Authentication not working
- Verify your Supabase project URL and anon key are correct
- Check that the `users` table exists and has the correct structure
- Ensure RLS policies allow authenticated users to read/write

## Free Tier Limits

- **Database**: 500 MB storage
- **Storage**: 1 GB file storage
- **Bandwidth**: 2 GB/month
- **API Requests**: Unlimited

These limits are sufficient for most small-to-medium deployments. You can monitor usage in the Supabase dashboard.

## Next Steps

- Set up email templates in **Authentication** > **Email Templates**
- Configure custom domains (requires Pro plan)
- Set up database backups (automatic on free tier)
- Monitor usage and performance in the dashboard

## Support

For issues with Supabase setup, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)

