# RLS Policy Fix - User Registration Issue

## Problem
Users were getting "new row violates row-level security policy for table 'users'" error when trying to register or login.

## Root Cause
The Row Level Security (RLS) policy for user inserts was too restrictive. During user registration:
1. Supabase Auth creates a user in `auth.users`
2. Our code tries to insert into the `users` table
3. The RLS policy requires the user to be authenticated AND the ID to match `auth.uid()`
4. During signup, the session might not be fully established yet, causing `auth.uid()` to be null or not match

## Solution Implemented

### 1. Database Function (Primary Solution)
Created a `create_user_profile()` function that:
- Bypasses RLS using `SECURITY DEFINER`
- Automatically determines if user is first (superadmin) or regular (member/pending)
- Can be called by authenticated users
- Handles user creation safely

### 2. Database Trigger (Automatic Backup)
Created a trigger `on_auth_user_created` that:
- Automatically creates a user profile when a user is created in `auth.users`
- Works even if email confirmation is required
- Ensures user profile exists before user can login
- Handles first user logic automatically

### 3. Code Updates
Updated `AuthContext.tsx` to:
- Use the `create_user_profile()` function instead of direct inserts
- Handle cases where user exists in auth but not in our users table
- Automatically create missing user profiles on login

## What This Fixes

✅ **User Registration**: Users can now register without RLS errors
✅ **User Login**: Users can login even if profile creation was interrupted
✅ **First User**: First user automatically becomes superadmin
✅ **Email Confirmation**: Works even if Supabase requires email confirmation
✅ **Google OAuth**: Works for Google sign-in as well

## Testing

Try the following:
1. **Register a new user** - Should work without errors
2. **Check Supabase Dashboard** - User should appear in `users` table
3. **First user** - Should have `role: superadmin` and `status: approved`
4. **Subsequent users** - Should have `role: member` and `status: pending`
5. **Login** - Should work after registration

## If Issues Persist

If you still encounter issues:

1. **Check Email Confirmation**: 
   - Go to Supabase Dashboard → Authentication → Settings
   - Check if "Enable email confirmations" is enabled
   - If enabled, users need to confirm email before they can login
   - The trigger will still create their profile automatically

2. **Check Browser Console**: 
   - Look for any error messages
   - Check if the function is being called correctly

3. **Verify Function Exists**:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'create_user_profile';
   ```

4. **Verify Trigger Exists**:
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

## Files Modified

- `src/contexts/AuthContext.tsx` - Updated to use database function
- Database migrations:
  - `004_user_creation_function` - Created the function
  - `005_auth_user_trigger` - Created the trigger

---

**Status**: ✅ Fixed and Ready to Test

