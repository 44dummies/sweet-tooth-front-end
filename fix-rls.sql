-- =====================================================
-- FIX RLS POLICIES FOR PRODUCTS TABLE
-- =====================================================
-- Run this in Supabase SQL Editor if products aren't showing

-- First, check if products exist
SELECT COUNT(*) as total_products FROM public.products;

-- Drop existing policies (safe to run even if they don't exist)
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public read access" ON public.products;

-- Make sure RLS is enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create a simple public read policy
CREATE POLICY "Public read access" ON public.products
    FOR SELECT
    TO public
    USING (true);

-- Create admin management policy
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Test the query (should return products if seed was run)
SELECT id, name, category, price, in_stock FROM public.products LIMIT 5;
