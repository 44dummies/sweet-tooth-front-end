-- =====================================================
-- RESTRUCTURED PRODUCTS WITH FLAVOR VARIANTS
-- =====================================================
-- This creates base product types with flavor options
-- Users select a type, then choose their flavor
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: Add flavor_options column to products
-- =====================================================
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS flavor_options JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT FALSE;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variant_type TEXT; -- 'flavor', 'size', 'topping', etc.

-- =====================================================
-- STEP 2: Clear existing products and insert new structure
-- =====================================================
TRUNCATE public.products;

-- =====================================================
-- CAKES - By Type/Shape (Users choose flavor)
-- =====================================================
INSERT INTO public.products (name, description, category, price, in_stock, image_url, has_variants, variant_type, flavor_options) VALUES

-- Round Cakes (Standard)
('Round Cake (1kg)', 'Classic round layered cake. Perfect for birthdays and celebrations. Choose your favorite flavor!', 'cakes', 2000, TRUE, 
'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Black Forest", "Carrot", "Lemon", "Strawberry", "Coffee", "Marble", "Pineapple"]'::jsonb),

('Round Cake (2kg)', 'Large round cake for bigger gatherings. Serves 15-20 people.', 'cakes', 3800, TRUE,
'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Black Forest", "Carrot", "Lemon", "Strawberry", "Coffee", "Marble", "Pineapple"]'::jsonb),

('Round Cake (500g)', 'Mini round cake perfect for intimate celebrations or small treats.', 'cakes', 1200, TRUE,
'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Black Forest", "Carrot", "Lemon", "Strawberry", "Coffee", "Marble"]'::jsonb),

-- Square/Rectangle Cakes
('Square Cake (1kg)', 'Modern square-shaped cake. Great for formal events and corporate celebrations.', 'cakes', 2200, TRUE,
'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Coffee", "Lemon", "Strawberry"]'::jsonb),

('Sheet Cake (2kg)', 'Large rectangular sheet cake. Ideal for office parties and big events. Serves 20-25.', 'cakes', 4000, TRUE,
'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Marble", "Lemon", "Strawberry"]'::jsonb),

-- Heart Shaped
('Heart Cake (1kg)', 'Romantic heart-shaped cake. Perfect for anniversaries, Valentine''s, and love celebrations.', 'cakes', 2500, TRUE,
'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', TRUE, 'flavor',
'["Red Velvet", "Vanilla", "Chocolate", "Strawberry", "Raspberry"]'::jsonb),

-- Tiered/Wedding Cakes
('2-Tier Cake (3kg)', 'Elegant two-tier cake for special occasions. A showstopper centerpiece!', 'wedding', 6500, TRUE,
'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry", "Champagne"]'::jsonb),

('3-Tier Wedding Cake (5kg)', 'Grand three-tier wedding cake. Consultation required for custom designs.', 'wedding', 12000, TRUE,
'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Champagne", "Almond"]'::jsonb),

('4-Tier Wedding Cake (8kg)', 'Magnificent four-tier masterpiece. The ultimate wedding centerpiece.', 'wedding', 20000, TRUE,
'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Champagne", "Almond", "Raspberry"]'::jsonb),

-- Number/Letter Cakes
('Number Cake', 'Trendy number-shaped cake. Perfect for birthdays and milestones. Specify number when ordering.', 'cakes', 3000, TRUE,
'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Strawberry", "Lemon"]'::jsonb),

('Letter Cake', 'Custom letter-shaped cake. Spell out names or initials!', 'cakes', 3000, TRUE,
'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Strawberry", "Lemon"]'::jsonb),

-- =====================================================
-- CUPCAKES - By Pack Size (Users choose flavor)
-- =====================================================
('Cupcakes (Box of 6)', 'Half dozen freshly baked cupcakes with buttercream frosting.', 'cupcakes', 900, TRUE,
'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry", "Coffee", "Carrot", "Funfetti"]'::jsonb),

('Cupcakes (Box of 12)', 'Full dozen cupcakes. Perfect for parties and gatherings.', 'cupcakes', 1700, TRUE,
'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry", "Coffee", "Carrot", "Funfetti"]'::jsonb),

('Cupcakes (Box of 24)', 'Party pack of 24 cupcakes. Great for large celebrations!', 'cupcakes', 3200, TRUE,
'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry", "Coffee", "Assorted"]'::jsonb),

('Mini Cupcakes (Box of 12)', 'Bite-sized mini cupcakes. Perfect for kids parties and finger food.', 'cupcakes', 1000, TRUE,
'https://images.unsplash.com/photo-1519869325930-281384f03cef?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Funfetti", "Assorted"]'::jsonb),

-- =====================================================
-- PASTRIES - Individual items (some with flavor options)
-- =====================================================
('Cinnamon Rolls (4pcs)', 'Warm, gooey cinnamon rolls with cream cheese frosting. A heavenly treat!', 'pastries', 500, TRUE,
'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=500', FALSE, NULL, '[]'::jsonb),

('Croissants (3pcs)', 'Buttery, flaky French croissants baked fresh daily.', 'pastries', 450, TRUE,
'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500', TRUE, 'filling',
'["Plain Butter", "Chocolate", "Almond", "Ham & Cheese"]'::jsonb),

('Danish Pastries (4pcs)', 'Assorted Danish pastries with delicious fillings.', 'pastries', 550, TRUE,
'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=500', TRUE, 'filling',
'["Apple", "Cherry", "Cream Cheese", "Raspberry", "Assorted"]'::jsonb),

('Mandazi (8pcs)', 'Traditional Kenyan coconut mandazi. Slightly sweet and perfect with chai.', 'pastries', 200, TRUE,
'https://images.unsplash.com/photo-1598839950623-55843f11f19b?w=500', FALSE, NULL, '[]'::jsonb),

('Samosas (6pcs)', 'Crispy samosas with your choice of filling. Kenyan street food favorite!', 'pastries', 350, TRUE,
'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', TRUE, 'filling',
'["Beef", "Chicken", "Vegetable", "Cheese"]'::jsonb),

('Meat Pie (2pcs)', 'Savory meat pies with flaky crust and seasoned filling.', 'pastries', 300, TRUE,
'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500', TRUE, 'filling',
'["Beef", "Chicken", "Vegetable"]'::jsonb),

-- =====================================================
-- COOKIES - By Pack Size
-- =====================================================
('Cookies (Box of 12)', 'Fresh baked cookies. Crispy edges, chewy center.', 'cookies', 600, TRUE,
'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500', TRUE, 'flavor',
'["Chocolate Chip", "Oatmeal Raisin", "Double Chocolate", "Peanut Butter", "Sugar Cookie", "Snickerdoodle"]'::jsonb),

('Cookies (Box of 24)', 'Party pack of cookies. Perfect for sharing!', 'cookies', 1100, TRUE,
'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500', TRUE, 'flavor',
'["Chocolate Chip", "Oatmeal Raisin", "Double Chocolate", "Peanut Butter", "Assorted"]'::jsonb),

('Giant Cookie (1pc)', 'Oversized cookie cake. Great for birthdays! Can be personalized.', 'cookies', 800, TRUE,
'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500', TRUE, 'flavor',
'["Chocolate Chip", "Double Chocolate", "Sugar Cookie"]'::jsonb),

-- =====================================================
-- BROWNIES & BARS
-- =====================================================
('Brownies (Box of 6)', 'Rich, fudgy brownies. Pure chocolate bliss in every bite.', 'brownies', 500, TRUE,
'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=500', TRUE, 'flavor',
'["Classic Chocolate", "Walnut", "Cream Cheese Swirl", "Salted Caramel", "Nutella"]'::jsonb),

('Brownies (Box of 12)', 'Dozen brownies for serious chocolate lovers.', 'brownies', 950, TRUE,
'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=500', TRUE, 'flavor',
'["Classic Chocolate", "Walnut", "Cream Cheese Swirl", "Salted Caramel", "Assorted"]'::jsonb),

('Blondies (Box of 6)', 'Vanilla brownies with white chocolate. Sweet and buttery.', 'brownies', 480, TRUE,
'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=500', TRUE, 'topping',
'["Plain", "White Chocolate Chip", "Macadamia Nut", "Raspberry"]'::jsonb),

-- =====================================================
-- SPECIALTY ITEMS
-- =====================================================
('Cake Pops (Box of 8)', 'Colorful cake pops on sticks. Perfect for parties!', 'specialty', 800, TRUE,
'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Red Velvet", "Funfetti", "Assorted"]'::jsonb),

('Macarons (Box of 6)', 'French macarons. Delicate, colorful, and elegant.', 'specialty', 850, TRUE,
'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Pistachio", "Raspberry", "Salted Caramel", "Lavender", "Assorted"]'::jsonb),

('Macarons (Box of 12)', 'Dozen macarons for macaron lovers.', 'specialty', 1600, TRUE,
'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500', TRUE, 'flavor',
'["Vanilla", "Chocolate", "Pistachio", "Raspberry", "Salted Caramel", "Assorted"]'::jsonb),

('Eclairs (Box of 4)', 'Classic French eclairs with chocolate glaze and cream filling.', 'specialty', 700, TRUE,
'https://images.unsplash.com/photo-1525059337994-6c90c56d4f72?w=500', TRUE, 'flavor',
'["Chocolate", "Vanilla", "Coffee", "Caramel"]'::jsonb),

('Profiteroles (Box of 8)', 'Cream-filled choux pastry with chocolate sauce.', 'specialty', 750, TRUE,
'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=500', TRUE, 'filling',
'["Vanilla Cream", "Chocolate Cream", "Coffee Cream"]'::jsonb),

-- =====================================================
-- CAKE SLICES - Individual servings
-- =====================================================
('Cake Slice', 'Single slice of cake. Try before you buy a whole cake!', 'slices', 350, TRUE,
'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=500', TRUE, 'flavor',
'["Chocolate Truffle", "Red Velvet", "Black Forest", "Carrot", "Cheesecake", "Vanilla", "Lemon"]'::jsonb),

('Cheesecake Slice', 'Creamy New York style cheesecake slice.', 'slices', 450, TRUE,
'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500', TRUE, 'topping',
'["Plain", "Strawberry", "Blueberry", "Oreo", "Caramel"]'::jsonb),

-- =====================================================
-- LOAVES & BREADS
-- =====================================================
('Sweet Bread Loaf', 'Fresh baked sweet bread loaf. Perfect for breakfast.', 'loaves', 700, TRUE,
'https://images.unsplash.com/photo-1585478259715-4aa2a6745135?w=500', TRUE, 'flavor',
'["Banana", "Pumpkin", "Zucchini", "Lemon Poppy Seed", "Blueberry"]'::jsonb),

('Pound Cake', 'Dense, buttery pound cake. A classic that never goes out of style.', 'loaves', 800, TRUE,
'https://images.unsplash.com/photo-1597403491447-3ab08f8e44dc?w=500', TRUE, 'flavor',
'["Classic Butter", "Lemon", "Marble", "Chocolate"]'::jsonb);

-- =====================================================
-- Verify the data
-- =====================================================
SELECT name, category, price, has_variants, variant_type, flavor_options FROM public.products ORDER BY category, name;
