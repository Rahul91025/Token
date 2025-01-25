/*
  # Fix Admin Policies

  1. Changes
    - Drop existing policies causing recursion
    - Create new policies with proper access control
    - Add basic admin check function
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can view admin list" ON admin_users;
DROP POLICY IF EXISTS "Users can view their own forms" ON forms;
DROP POLICY IF EXISTS "Admins can view all forms" ON forms;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE id = user_id 
    AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies for admin_users table
CREATE POLICY "Admin users can view admin list"
  ON admin_users FOR SELECT
  USING (is_admin(auth.uid()));

-- Recreate policies for forms table
CREATE POLICY "Users can view their own forms"
  ON forms FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    is_admin(auth.uid())
  );