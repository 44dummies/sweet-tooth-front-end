-- =====================================================
-- UPDATE PRODUCT IMAGES TO MATCH DESCRIPTIONS
-- =====================================================
-- Run this in Supabase SQL Editor to update all product images

-- CAKES
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400' WHERE name ILIKE '%black forest%' AND category = 'cakes';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400' WHERE name ILIKE '%red velvet%' AND category = 'cakes';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400' WHERE name ILIKE '%vanilla sponge%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=400' WHERE name ILIKE '%chocolate truffle%' AND category = 'cakes';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=400' WHERE name ILIKE '%fruit cake%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400' WHERE name ILIKE '%carrot cake%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400' WHERE name ILIKE '%marble cake%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1519869325930-281384f03cef?w=400' WHERE name ILIKE '%lemon drizzle%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400' WHERE name ILIKE '%pineapple%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400' WHERE name ILIKE '%custom birthday%';

-- CUPCAKES
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400' WHERE name ILIKE '%vanilla cupcake%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400' WHERE name ILIKE '%chocolate cupcake%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400' WHERE name ILIKE '%red velvet cupcake%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400' WHERE name ILIKE '%assorted cupcake%';

-- PASTRIES
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400' WHERE name ILIKE '%cinnamon roll%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' WHERE name ILIKE '%croissant%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400' WHERE name ILIKE '%danish%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1626197031507-c17099753214?w=400' WHERE name ILIKE '%mandazi%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' WHERE name ILIKE '%samosa%';

-- COOKIES
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400' WHERE name ILIKE '%chocolate chip cookie%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' WHERE name ILIKE '%oatmeal%cookie%';

-- BROWNIES
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400' WHERE name ILIKE '%chocolate brownie%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=400' WHERE name ILIKE '%blondie%';

-- SPECIALTY
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400' WHERE name ILIKE '%cake pop%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400' WHERE name ILIKE '%macaron%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1525059337994-6c90c56d4f72?w=400' WHERE name ILIKE '%eclair%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=400' WHERE name ILIKE '%profiterole%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1522767131822-6741b92738ca?w=400' WHERE name ILIKE '%baby shower%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=400' WHERE name ILIKE '%graduation%';

-- SLICES
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400' WHERE name ILIKE '%cheesecake slice%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400' WHERE name ILIKE '%black forest slice%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400' WHERE name ILIKE '%red velvet slice%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=400' WHERE name ILIKE '%chocolate truffle slice%';

-- LOAVES
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1606101273945-e9eba27c2a4a?w=400' WHERE name ILIKE '%banana bread%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1597403491447-3ab08f8e44dc?w=400' WHERE name ILIKE '%pound cake%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' WHERE name ILIKE '%zucchini bread%';

-- WEDDING & SPECIAL
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400' WHERE name ILIKE '%wedding cake%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' WHERE name ILIKE '%anniversary%';

-- Verify updates
SELECT name, category, image_url FROM public.products ORDER BY category, name;
