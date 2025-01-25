/*
  # Initial Schema Setup for Form Management System

  1. New Tables
    - `forms` - Stores form submissions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `form_type` (text) - Type of form (e.g., 'account_opening', 'loan_application')
      - `form_data` (jsonb) - Stores the form data
      - `token` (text) - Unique token for form retrieval
      - `status` (text) - Form status (e.g., 'pending', 'reviewed')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `admin_users` - Stores admin user information
      - `id` (uuid, primary key, references auth.users)
      - `is_super_admin` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for form submissions and admin access
*/

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  form_type text NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}',
  token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  is_super_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for forms table
CREATE POLICY "Users can insert their own forms"
  ON forms FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own forms"
  ON forms FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all forms"
  ON forms FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Policies for admin_users table
CREATE POLICY "Admins can view admin list"
  ON admin_users FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Function to generate unique tokens
CREATE OR REPLACE FUNCTION generate_unique_token()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_token text;
  token_exists boolean;
BEGIN
  LOOP
    -- Generate a random token (12 characters)
    new_token := encode(gen_random_bytes(9), 'base64');
    new_token := replace(new_token, '/', '_');
    new_token := replace(new_token, '+', '-');
    new_token := substring(new_token from 1 for 12);
    
    -- Check if token already exists
    SELECT EXISTS (
      SELECT 1 FROM forms WHERE token = new_token
    ) INTO token_exists;
    
    -- Exit loop if token is unique
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  RETURN new_token;
END;
$$;