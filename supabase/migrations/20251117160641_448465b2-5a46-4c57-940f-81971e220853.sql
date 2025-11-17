-- Fix critical security issue: Add INSERT policy for profiles table
-- This allows users to create their own profile during registration
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also add missing policies for better user experience
-- Allow users to view profiles of other students (for display purposes in comments, etc.)
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Remove the restrictive "Users can view their own profile" policy since we now have a more open one
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;