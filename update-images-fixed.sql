-- =====================================================
-- FIXED PRODUCT IMAGES - ALL BAKERY APPROPRIATE
-- =====================================================
-- Run this in Supabase SQL Editor

-- First, let's see all products to update them properly
-- DELETE duplicates if any (keeps first occurrence)
DELETE FROM public.products a USING public.products b
WHERE a.ctid < b.ctid AND a.name = b.name;

-- =====================================================
-- CAKES - Proper cake images
-- =====================================================
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500' 
WHERE name ILIKE '%black forest%' AND category = 'cakes';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500' 
WHERE name ILIKE '%red velvet%' AND category = 'cakes' AND name NOT ILIKE '%cupcake%' AND name NOT ILIKE '%slice%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500' 
WHERE name ILIKE '%vanilla sponge%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=500' 
WHERE name ILIKE '%chocolate truffle%' AND category = 'cakes';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500' 
WHERE name ILIKE '%fruit cake%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500' 
WHERE name ILIKE '%carrot cake%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=500' 
WHERE name ILIKE '%marble cake%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' 
WHERE name ILIKE '%lemon%' AND category = 'cakes';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500' 
WHERE name ILIKE '%pineapple%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500' 
WHERE name ILIKE '%birthday%' AND category = 'cakes';

-- =====================================================
-- CUPCAKES - Actual cupcake images
-- =====================================================
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1519869325930-281384f03cef?w=500' 
WHERE name ILIKE '%vanilla cupcake%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500' 
WHERE name ILIKE '%chocolate cupcake%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=500' 
WHERE name ILIKE '%red velvet cupcake%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=500' 
WHERE name ILIKE '%assorted cupcake%';

-- =====================================================
-- PASTRIES - Real pastry images
-- =====================================================
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=500' 
WHERE name ILIKE '%cinnamon roll%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500' 
WHERE name ILIKE '%croissant%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=500' 
WHERE name ILIKE '%danish%';

-- Mandazi - African fried dough (use similar looking item)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1598839950623-55843f11f19b?w=500' 
WHERE name ILIKE '%mandazi%';

-- Samosas - triangular pastries
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500' 
WHERE name ILIKE '%samosa%';

-- =====================================================
-- COOKIES - Real cookie images
-- =====================================================
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500' 
WHERE name ILIKE '%chocolate chip cookie%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1490567674467-b96648eb5d3a?w=500' 
WHERE name ILIKE '%oatmeal%';

-- =====================================================
-- BROWNIES - Actual brownie images
-- =====================================================
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=500' 
WHERE name ILIKE '%chocolate brownie%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=500' 
WHERE name ILIKE '%blondie%';

-- =====================================================
-- SPECIALTY ITEMS
-- =====================================================
-- Cake pops
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=500' 
WHERE name ILIKE '%cake pop%';

-- Macarons - colorful French cookies
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500' 
WHERE name ILIKE '%macaron%';

-- Eclairs - chocolate topped pastry
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1525059337994-6c90c56d4f72?w=500' 
WHERE name ILIKE '%eclair%';

-- Profiteroles - cream puffs
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=500' 
WHERE name ILIKE '%profiterole%';

-- Baby shower cake
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500' 
WHERE name ILIKE '%baby shower%';

-- Graduation cake
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500' 
WHERE name ILIKE '%graduation%';

-- =====================================================
-- SLICES - Cake slice images
-- =====================================================
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500' 
WHERE name ILIKE '%cheesecake%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500' 
WHERE name ILIKE '%black forest slice%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500' 
WHERE name ILIKE '%red velvet slice%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=500' 
WHERE name ILIKE '%chocolate truffle slice%';

-- =====================================================
-- LOAVES & BREADS
-- =====================================================
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1585478259715-4aa2a6745135?w=500' 
WHERE name ILIKE '%banana bread%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1597403491447-3ab08f8e44dc?w=500' 
WHERE name ILIKE '%pound cake%' AND category = 'loaves';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' 
WHERE name ILIKE '%zucchini%';

-- =====================================================
-- WEDDING & SPECIAL OCCASION
-- =====================================================
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500' 
WHERE name ILIKE '%wedding cake%';

UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500' 
WHERE name ILIKE '%anniversary%';

-- =====================================================
-- SET DEFAULT FOR ANY REMAINING NULL IMAGES
-- =====================================================
UPDATE public.products 
SET image_url = CASE 
    WHEN category = 'cakes' THEN 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500'
    WHEN category = 'cupcakes' THEN 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500'
    WHEN category = 'pastries' THEN 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'
    WHEN category = 'cookies' THEN 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500'
    WHEN category = 'brownies' THEN 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=500'
    WHEN category = 'specialty' THEN 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=500'
    WHEN category = 'slices' THEN 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=500'
    WHEN category = 'loaves' THEN 'https://images.unsplash.com/photo-1585478259715-4aa2a6745135?w=500'
    WHEN category = 'wedding' THEN 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500'
    ELSE 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500'
END
WHERE image_url IS NULL OR image_url = '';

-- Show results
SELECT name, category, image_url FROM public.products ORDER BY category, name;
