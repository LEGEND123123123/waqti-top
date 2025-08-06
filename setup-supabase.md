# Supabase Setup Guide for Waqti Platform

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be fully initialized

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Update your `.env` file with these values:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## 3. Run Database Migrations

You have two options:

### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option B: Manual Migration
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `supabase/migrations/20250806143914_fragrant_grass.sql`
4. Run the SQL

## 4. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Set up your site URL: `http://localhost:5173` (for development)
3. Configure email templates if needed
4. Enable email confirmations or disable them for development

## 5. Test the Setup

1. Start your development server: `npm run dev`
2. Try to register a new account
3. Check if the user appears in your Supabase dashboard under Authentication > Users
4. Verify that the user profile is created in the `users` table

## 6. Security Configuration

The migration includes Row Level Security (RLS) policies that ensure:
- Users can only access their own data
- Proper access controls for services, bookings, and transactions
- Admin-only access for verification and dispute management

## Troubleshooting

### Policy Already Exists Error
If you see "policy already exists" errors, it means you have conflicting migrations. The updated migration file should resolve this by dropping existing tables first.

### Authentication Issues
- Make sure your environment variables are correctly set
- Check that your Supabase project URL and anon key are valid
- Verify that email confirmation settings match your development needs

### RLS Issues
If users can't access their data:
- Check that RLS policies are properly applied
- Verify that the user's JWT token contains the correct user ID
- Test policies in the Supabase SQL editor