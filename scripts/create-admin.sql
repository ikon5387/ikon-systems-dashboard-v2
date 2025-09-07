-- Create Admin User for Ikon Systems Dashboard
-- Run this in Supabase SQL Editor

-- First, you need to create the auth user in Supabase Dashboard
-- Then run this script to add them to your users table

-- Replace 'your-admin-email@ikonsystemsai.com' with your actual admin email
-- Replace 'your-auth-user-id' with the ID from auth.users table

-- Method 1: If you already created the user in Supabase Auth
INSERT INTO users (id, email, role) 
VALUES (
  'your-auth-user-id', -- Get this from auth.users table
  'your-admin-email@ikonsystemsai.com',
  'admin'
);

-- Method 2: Check existing users and update role
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@ikonsystemsai.com';

-- Method 3: Add sample data for testing
INSERT INTO clients (name, email, phone, address, status, bilingual_preference, notes) VALUES 
('John Smith', 'john.smith@example.com', '(555) 123-4567', '123 Main St, Los Angeles, CA 90210', 'active', true, 'Kitchen remodeling project - budget $25k'),
('Sarah Johnson', 'sarah.johnson@example.com', '(555) 987-6543', '456 Oak Ave, San Francisco, CA 94102', 'prospect', false, 'Bathroom renovation inquiry'),
('Mike Davis', 'mike.davis@example.com', '(555) 345-6789', '789 Pine St, San Diego, CA 92101', 'lead', true, 'Whole house remodel - initial contact'),
('Lisa Wilson', 'lisa.wilson@example.com', '(555) 246-8135', '321 Elm Dr, San Jose, CA 95110', 'active', false, 'Master bedroom addition project'),
('Carlos Rodriguez', 'carlos.rodriguez@example.com', '(555) 864-2975', '654 Maple Ln, Oakland, CA 94601', 'prospect', true, 'Bilingual client - kitchen and living room');

-- Add sample appointments
INSERT INTO appointments (client_id, date_time, type, status, notes) VALUES 
((SELECT id FROM clients WHERE email = 'john.smith@example.com'), NOW() + INTERVAL '1 day', 'demo', 'scheduled', 'Kitchen design presentation'),
((SELECT id FROM clients WHERE email = 'sarah.johnson@example.com'), NOW() + INTERVAL '2 days', 'call', 'confirmed', 'Follow-up call to discuss pricing'),
((SELECT id FROM clients WHERE email = 'mike.davis@example.com'), NOW() + INTERVAL '3 days', 'demo', 'scheduled', 'Initial consultation for whole house remodel');

-- Verify the setup
SELECT 'Users created:' as info, count(*) as count FROM users;
SELECT 'Clients created:' as info, count(*) as count FROM clients;
SELECT 'Appointments created:' as info, count(*) as count FROM appointments;
