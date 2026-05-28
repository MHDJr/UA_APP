-- Migration Hotfix: Fix Profiles RLS Infinite Recursion (500 Error during Login)
-- Timestamp: 2026-05-27
-- Description: Drops redundant and recursive SELECT policies on the profiles table that refer to profiles recursively, preventing stack depth limit exceeded errors.

DROP POLICY IF EXISTS "Departmental Visibility" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
