-- Create a confirmed admin user for Ikon Systems Dashboard
-- Run this in Supabase SQL Editor

-- Method 1: Update existing user to confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@ikonsystemsai.com';

-- Method 2: If user doesn't exist, create one with confirmed email
-- (You'll need to create the auth user first in Supabase Dashboard, then run this)

-- Insert into your users table with admin role
INSERT INTO users (id, email, role) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@ikonsystemsai.com'),
  'admin@ikonsystemsai.com',
  'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verify the user is confirmed
SELECT 
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'admin@ikonsystemsai.com';

-- Check if user exists in your users table
SELECT 
  u.email,
  u.role,
  au.email_confirmed_at
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@ikonsystemsai.com';
