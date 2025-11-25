-- =====================================================
-- SWEET TOOTH BAKERY - DATABASE SEED DATA
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to populate your database
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- 
-- IMPORTANT: Run supabase-schema.sql FIRST to create the tables
-- Then run this file to populate the data
-- =====================================================

-- =====================================================
-- CLEAR EXISTING DATA (Optional - uncomment if needed)
-- =====================================================
-- DELETE FROM public.products;
-- DELETE FROM public.reviews;

-- =====================================================
-- PRODUCTS - Popular Kenyan Cakes & Treats
-- =====================================================
-- All prices in Kenyan Shillings (KSH)

INSERT INTO public.products (name, description, category, price, in_stock, image_url) VALUES

-- CAKES - Popular in Kenya
('Black Forest Cake (1kg)', 'Classic Black Forest with layers of chocolate sponge, whipped cream, and cherries. Kenya''s favorite!', 'cakes', 2500, TRUE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400'),

('Red Velvet Cake (1kg)', 'Iconic red velvet with cream cheese frosting. Moist, rich, and absolutely stunning.', 'cakes', 2800, TRUE, 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400'),

('Vanilla Sponge Cake (1kg)', 'Light and fluffy vanilla sponge with buttercream. Perfect for any celebration.', 'cakes', 2000, TRUE, 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400'),

('Chocolate Truffle Cake (1kg)', 'Decadent chocolate layers with rich ganache. A chocolate lover''s dream come true.', 'cakes', 3000, TRUE, 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=400'),

('Fruit Cake', 'Traditional fruit cake loaded with mixed dried fruits, nuts and warm spices. Perfect for Christmas!', 'cakes', 2200, TRUE, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400'),

('Carrot Cake (1kg)', 'Moist carrot cake with walnuts and cream cheese frosting. Healthy and delicious!', 'cakes', 2400, TRUE, 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400'),

('Marble Cake (500g)', 'Beautiful swirls of vanilla and chocolate. A Kenyan teatime classic.', 'cakes', 1200, TRUE, 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=400'),

('Lemon Drizzle Cake', 'Zesty lemon cake with sweet glaze. Light, refreshing, and perfect with chai.', 'cakes', 1500, TRUE, 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400'),

('Pineapple Upside Down Cake', 'Classic pineapple cake with caramelized topping. Sweet, tangy, and delicious.', 'cakes', 1800, TRUE, 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=400'),

-- CUPCAKES
('Vanilla Cupcakes (6pcs)', 'Classic vanilla cupcakes with buttercream swirl. Perfect for any occasion.', 'cupcakes', 900, TRUE, 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400'),

('Chocolate Cupcakes (6pcs)', 'Rich chocolate cupcakes with chocolate ganache topping. Pure indulgence!', 'cupcakes', 950, TRUE, 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400'),

('Red Velvet Cupcakes (6pcs)', 'Mini red velvet delights with cream cheese frosting. Elegant and delicious.', 'cupcakes', 1000, TRUE, 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400'),

('Assorted Cupcakes (12pcs)', 'Mix of vanilla, chocolate, and red velvet cupcakes. Party pack!', 'cupcakes', 1800, TRUE, 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400'),

-- PASTRIES
('Cinnamon Rolls (4pcs)', 'Warm, gooey cinnamon rolls with cream cheese frosting. A heavenly treat!', 'pastries', 500, TRUE, 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400'),

('Croissants (3pcs)', 'Buttery, flaky French croissants baked fresh daily. Perfect with coffee.', 'pastries', 450, TRUE, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'),

('Danish Pastries (4pcs)', 'Assorted Danish pastries with fruit and cream fillings. Teatime favorites!', 'pastries', 550, TRUE, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400'),

('Mandazi (8pcs)', 'Traditional Kenyan coconut mandazi. Slightly sweet and perfect with chai.', 'pastries', 200, TRUE, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'),

('Samosas (6pcs)', 'Crispy samosas with spiced meat or vegetable filling. Kenyan street food favorite!', 'pastries', 350, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400'),

-- COOKIES & BROWNIES
('Chocolate Chip Cookies (12pcs)', 'Classic chocolate chip cookies. Crispy edges, chewy center, loaded with chocolate.', 'cookies', 600, TRUE, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'),

('Oatmeal Raisin Cookies (12pcs)', 'Hearty oatmeal cookies with plump raisins. Wholesome and delicious.', 'cookies', 550, TRUE, 'https://images.unsplash.com/photo-1490567674467-b96648eb5d3a?w=400'),

('Chocolate Brownies (6pcs)', 'Rich, fudgy brownies with a crackly top. Pure chocolate bliss in every bite.', 'brownies', 500, TRUE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400'),

('Blondies (6pcs)', 'Vanilla brownies with white chocolate chips. Sweet, buttery, and delicious.', 'brownies', 480, TRUE, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'),

-- SPECIALTY ITEMS
('Cake Pops (8pcs)', 'Colorful cake pops perfect for parties. Kids and adults love them!', 'specialty', 800, TRUE, 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400'),

('Macarons (6pcs)', 'French macarons in assorted flavors. Delicate, colorful, and elegant.', 'specialty', 850, TRUE, 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400'),

('Eclairs (4pcs)', 'Classic French eclairs with chocolate glaze and cream filling.', 'specialty', 700, TRUE, 'https://images.unsplash.com/photo-1525059337994-6c90c56d4f72?w=400'),

('Profiteroles (8pcs)', 'Cream-filled choux pastry with chocolate sauce. Decadent dessert!', 'specialty', 750, TRUE, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400'),

-- SLICES & PORTIONS
('Cheesecake Slice', 'Creamy New York cheesecake with berry compote. Rich and satisfying.', 'slices', 450, TRUE, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400'),

('Black Forest Slice', 'Single serving of our famous Black Forest cake.', 'slices', 350, TRUE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400'),

('Red Velvet Slice', 'A slice of red velvet heaven with cream cheese frosting.', 'slices', 380, TRUE, 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400'),

('Chocolate Truffle Slice', 'Indulgent slice of chocolate truffle cake.', 'slices', 400, TRUE, 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=400'),

-- LOAVES & BREAD
('Banana Bread', 'Moist banana bread with walnuts. Made with ripe Kenyan bananas.', 'loaves', 700, TRUE, 'https://images.unsplash.com/photo-1605286742520-5e8c1e8d1b4e?w=400'),

('Pound Cake', 'Dense, buttery pound cake. A classic that never goes out of style.', 'loaves', 800, TRUE, 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400'),

('Zucchini Bread', 'Healthy zucchini bread with hints of cinnamon. Moist and delicious.', 'loaves', 750, TRUE, 'https://images.unsplash.com/photo-1605286742520-5e8c1e8d1b4e?w=400'),

-- WEDDING & SPECIAL OCCASION
('Wedding Cake (per kg)', 'Custom multi-tier wedding cake. Consultation required. Minimum 3kg order.', 'wedding', 3500, TRUE, 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400'),

('Anniversary Cake (1kg)', 'Elegant anniversary cake with personalized message.', 'wedding', 3000, TRUE, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),

('Custom Birthday Cake (1kg)', 'Personalized birthday cake with your choice of flavor and design. Made to order.', 'cakes', 2800, TRUE, 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400'),

('Baby Shower Cake (1kg)', 'Adorable baby shower cake in blue or pink theme.', 'specialty', 2600, TRUE, 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400'),

('Graduation Cake (1kg)', 'Celebratory graduation cake with cap design.', 'specialty', 2700, TRUE, 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400')

ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE REVIEWS (Pre-approved)
-- =====================================================

INSERT INTO public.reviews (name, email, rating, comment, approved) VALUES
('Sarah M.', 'sarah@example.com', 5, 'The Black Forest cake was absolutely divine! Best I''ve had in Nairobi. Will definitely order again for my next event.', TRUE),
('John K.', 'john@example.com', 5, 'Ordered a custom birthday cake for my daughter. The design was exactly what we wanted and it tasted amazing!', TRUE),
('Lucy W.', 'lucy@example.com', 4, 'The mandazi reminded me of my grandmother''s recipe. Authentic and delicious. Great with my morning chai.', TRUE),
('Peter N.', 'peter@example.com', 5, 'Wedding cake was spectacular! Everyone at the reception was asking where we got it from. Thank you Sweet Tooth!', TRUE),
('Grace A.', 'grace@example.com', 5, 'Best red velvet cupcakes I''ve ever tasted. The cream cheese frosting is perfect. My office loves them!', TRUE),
('Michael O.', 'michael@example.com', 4, 'Great variety of pastries. The croissants are so buttery and flaky. Highly recommend for breakfast!', TRUE),
('Ann W.', 'ann@example.com', 5, 'The chocolate brownies are to die for! Rich, fudgy, and absolutely perfect. My go-to treat now.', TRUE),
('David M.', 'david@example.com', 5, 'Ordered cinnamon rolls for a work event. They were a huge hit! Fresh, warm, and absolutely delicious.', TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SET ADMIN USER
-- =====================================================
-- Run this AFTER your admin user has signed up
-- Replace 'muindidamian@gmail.com' with your admin email if different

UPDATE public.profiles SET is_admin = TRUE WHERE email = 'muindidamian@gmail.com';

-- =====================================================
-- VERIFY DATA
-- =====================================================
-- Run these queries to verify data was inserted correctly:

-- SELECT COUNT(*) as product_count FROM public.products;
-- SELECT COUNT(*) as review_count FROM public.reviews;
-- SELECT * FROM public.profiles WHERE is_admin = TRUE;

-- =====================================================
-- DONE! Your database is now populated with data.
-- =====================================================
