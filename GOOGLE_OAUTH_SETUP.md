# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the BAMAS Digital Forge application.

## Overview

The application uses Google OAuth 2.0 for authentication. This requires configuration in two places:
1. **Google Cloud Console** - To create OAuth credentials
2. **Supabase Dashboard** - To enable Google provider and configure redirect URLs

## Prerequisites

- A Google account
- Access to Google Cloud Console
- A Supabase project (already set up)
- Your application's domain URL (for production) or localhost (for development)

## Step 1: Create Google OAuth Credentials

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "BAMAS Digital Forge")
5. Click **"Create"**
6. Wait for the project to be created, then select it

### 1.2 Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"Google Identity Services API"**
3. Click on it and click **"Enable"**

### 1.3 Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: BAMAS Digital Forge (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the **"Scopes"** page, click **"Save and Continue"** (default scopes are fine)
7. On the **"Test users"** page (if in testing mode), you can add test users or skip
8. Click **"Save and Continue"**
9. Review and click **"Back to Dashboard"**

### 1.4 Create OAuth 2.0 Client ID

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Enter a name (e.g., "BAMAS Web Client")
5. **Authorized JavaScript origins**:
   - For development: `http://localhost:8080`
   - For production: `https://your-domain.com` (your actual domain)
6. **Authorized redirect URIs**:
   - For development: `http://localhost:8080`
   - For production: `https://your-domain.com`
   - **IMPORTANT**: Also add your Supabase callback URL:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - Replace `YOUR_PROJECT_REF` with your actual Supabase project reference
7. Click **"Create"**
8. **Copy the Client ID** - You'll need this for both Supabase and your `.env` file
9. **Copy the Client Secret** - You'll need this for Supabase

## Step 2: Configure Google OAuth in Supabase

### 2.1 Enable Google Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **"Authentication"** > **"Providers"**
4. Find **"Google"** in the list
5. Toggle **"Enable Google provider"** to ON

### 2.2 Add Google OAuth Credentials

1. In the Google provider settings, enter:
   - **Client ID (for OAuth)**: Paste the Client ID from Google Cloud Console
   - **Client Secret (for OAuth)**: Paste the Client Secret from Google Cloud Console
2. Click **"Save"**

### 2.3 Configure Redirect URLs

1. In Supabase, go to **"Authentication"** > **"URL Configuration"**
2. Add your site URL:
   - For development: `http://localhost:8080`
   - For production: `https://your-domain.com`
3. Add redirect URLs:
   - For development: `http://localhost:8080/**`
   - For production: `https://your-domain.com/**`
4. Click **"Save"**

## Step 3: Configure Environment Variables

### 3.1 Update `.env` File

Add the Google Client ID to your `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**Important Notes:**
- Only the **Client ID** is needed in the `.env` file (not the secret)
- The Client Secret is only used in Supabase dashboard
- Never commit the `.env` file to version control

### 3.2 Restart Development Server

After updating `.env`, restart your development server:

```bash
npm run dev
```

## Step 4: Test Google OAuth

### 4.1 Test in Development

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click the **"Sign in with Google"** button
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to your app
6. Check the Supabase dashboard to verify the user was created

### 4.2 Verify User Creation

1. In Supabase dashboard, go to **"Authentication"** > **"Users"**
2. You should see the new user with:
   - Email from Google account
   - Provider: `google`
   - Email verified: `true`

3. Go to **"Table Editor"** > **"users"** table
4. Verify the user profile was created with:
   - Correct name and email
   - `provider: 'google'`
   - Profile image (if available from Google)

## Step 5: Production Setup

### 5.1 Update Google Cloud Console

1. Go back to Google Cloud Console > **"Credentials"**
2. Edit your OAuth 2.0 Client ID
3. Add production URLs:
   - **Authorized JavaScript origins**: `https://your-domain.com`
   - **Authorized redirect URIs**: 
     - `https://your-domain.com`
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### 5.2 Update Supabase

1. In Supabase dashboard, go to **"Authentication"** > **"URL Configuration"**
2. Update **Site URL** to your production domain
3. Add production redirect URLs

### 5.3 Update Environment Variables

Update your production environment variables (in your hosting platform):
- `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID

## Troubleshooting

### Issue: "Google authentication is not configured"

**Solution**: 
- Check that `VITE_GOOGLE_CLIENT_ID` is set in your `.env` file
- Restart your development server after adding the variable

### Issue: "Provider not enabled" error

**Solution**:
- Verify Google provider is enabled in Supabase dashboard
- Check that Client ID and Secret are correctly entered in Supabase

### Issue: "redirect_uri_mismatch" error

**Solution**:
- Verify the redirect URI in Google Cloud Console matches exactly:
  - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Check that your site URL is correctly configured in Supabase

### Issue: Google login button doesn't appear

**Solution**:
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Make sure `GoogleOAuthProvider` is wrapping your app in `App.tsx`

### Issue: User created but can't login

**Solution**:
- Check Supabase `users` table to verify user profile was created
- Verify RLS policies allow the user to read their own data
- Check browser console for authentication errors

### Issue: "Invalid token" error

**Solution**:
- Verify Google OAuth credentials are correct in Supabase
- Check that the OAuth consent screen is properly configured
- Ensure the API is enabled in Google Cloud Console

## Security Best Practices

1. **Never expose Client Secret**: The Client Secret should only be in Supabase dashboard, never in your code or `.env` file
2. **Use environment variables**: Always use environment variables for sensitive configuration
3. **Restrict redirect URIs**: Only add the exact URLs you need in Google Cloud Console
4. **Regularly rotate credentials**: Consider rotating OAuth credentials periodically
5. **Monitor usage**: Check Google Cloud Console for unusual activity

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React OAuth Google Documentation](https://www.npmjs.com/package/@react-oauth/google)

## Support

If you encounter issues not covered in this guide:
1. Check the browser console for error messages
2. Check Supabase logs in the dashboard
3. Verify all configuration steps were completed correctly
4. Ensure all URLs match exactly (no trailing slashes, correct protocol)

