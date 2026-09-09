-- Bhab E Bengali - Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the entire backend

-- 1. USERS TABLE (Phone + OTP auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  otp_code VARCHAR(6),
  otp_expires_at TIMESTAMP,
  otp_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own data" 
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update only their own data" 
  ON users FOR UPDATE USING (auth.uid() = id);

-- 2. MENU ITEMS TABLE
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- fish, chicken, mutton, vegetarian, rice, bread, thali, kichri
  price DECIMAL(10, 2) NOT NULL,
  prep_time_mins INTEGER, -- How many mins to prepare
  available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. CUSTOMIZATION OPTIONS (for a la carte)
CREATE TABLE customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- e.g., "Spice Level", "Add Egg"
  type VARCHAR(50) NOT NULL, -- "spice_level", "add_ingredient", "remove_ingredient"
  values_json JSONB NOT NULL, -- {"levels": ["mild", "medium", "spicy"]} or {"price": 20}
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_type VARCHAR(50) NOT NULL, -- "regular", "catering", "bulk"
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_type VARCHAR(50) NOT NULL, -- "own_delivery", "third_party"
  delivery_address TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, packed, out_for_delivery, delivered
  payment_method VARCHAR(50), -- "card", "upi", "cash"
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own orders" 
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" 
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. ORDER ITEMS (what's in each order)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  customization_json JSONB, -- {"spice_level": "medium", "add_onions": false}
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. REVIEWS TABLE
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN DEFAULT FALSE, -- Owner must approve before showing
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" 
  ON reviews FOR SELECT USING (approved = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create reviews" 
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. CATERING ORDERS TABLE
CREATE TABLE catering_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL, -- 50-100
  items_json JSONB NOT NULL, -- {"menu_item_id": quantity}
  total_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'inquiry', -- inquiry, quoted, confirmed, completed
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE catering_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own catering orders" 
  ON catering_orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create catering orders" 
  ON catering_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. BULK ORDERS TABLE (50-100 people, owner contact required)
CREATE TABLE bulk_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(15) NOT NULL,
  user_email VARCHAR(255),
  organization_name VARCHAR(255),
  event_type VARCHAR(100),
  guest_count INTEGER NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_address TEXT,
  preferences TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, quoted, confirmed, completed
  owner_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE bulk_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own bulk orders" 
  ON bulk_orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bulk orders" 
  ON bulk_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. DELIVERY TRACKING TABLE (real-time status updates)
CREATE TABLE delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
  current_status VARCHAR(50) NOT NULL, -- preparing, packed, out_for_delivery, delivered
  status_updated_at TIMESTAMP DEFAULT NOW(),
  delivery_partner_name VARCHAR(255),
  delivery_partner_phone VARCHAR(15),
  estimated_arrival TIMESTAMP,
  gps_location JSONB, -- {"latitude": 22.5726, "longitude": 88.3639}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking for their orders" 
  ON delivery_tracking FOR SELECT 
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reviews_menu_item_id ON reviews(menu_item_id);
CREATE INDEX idx_reviews_approved ON reviews(approved);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_catering_orders_user_id ON catering_orders(user_id);
CREATE INDEX idx_bulk_orders_user_id ON bulk_orders(user_id);
CREATE INDEX idx_delivery_tracking_order_id ON delivery_tracking(order_id);

-- Sample menu data (Bhab E Bengali dishes from your photos)
INSERT INTO menu_items (name, description, category, price, prep_time_mins, available, image_url) VALUES
('Rui Kalia', 'Traditional rohu fish in mustard-based gravy', 'fish', 170, 25, TRUE, '/images/rui-kalia.jpg'),
('Ilish Bhapa', 'Hilsa fish steamed with mustard paste', 'fish', 230, 20, TRUE, '/images/ilish-bhapa.jpg'),
('Chingri Malai Curry', 'Prawns in creamy coconut curry', 'fish', 250, 22, TRUE, '/images/chingri-malai.jpg'),
('Mutton Kosha', 'Slow-cooked mutton in aromatic spices', 'mutton', 320, 40, TRUE, '/images/mutton-kosha.jpg'),
('Chicken Kosha', 'Bengali chicken curry', 'chicken', 250, 30, TRUE, '/images/chicken-kosha.jpg'),
('Paneer Dhokar Dalna', 'Paneer in creamy lentil gravy', 'vegetarian', 189, 25, TRUE, '/images/paneer-dhokar.jpg'),
('Veg Kichri', 'Rice and lentil comfort dish', 'kichri', 120, 20, TRUE, '/images/veg-kichri.jpg'),
('Paneer Kichri', 'Paneer in kichri base', 'kichri', 150, 22, TRUE, '/images/paneer-kichri.jpg'),
('Chicken Kichri', 'Chicken in kichri base', 'kichri', 170, 25, TRUE, '/images/chicken-kichri.jpg'),
('Bengali Veg Thali', 'Complete meal: rice, dal, bhaji, vegetables', 'thali', 99, 30, TRUE, '/images/veg-thali.jpg'),
('Bengali Fish Thali', 'Complete meal with fish', 'thali', 399, 35, TRUE, '/images/fish-thali.jpg'),
('Bengali Chicken Thali', 'Complete meal with chicken', 'thali', 170, 35, TRUE, '/images/chicken-thali.jpg'),
('Bengali Mutton Thali', 'Complete meal with mutton', 'thali', 220, 40, TRUE, '/images/mutton-thali.jpg'),
('Plain Rice', 'Steamed basmati rice', 'rice', 49, 15, TRUE, '/images/rice.jpg'),
('Roti', '2 pieces - unleavened bread', 'bread', 39, 10, TRUE, '/images/roti.jpg'),
('Paratha', '2 pieces - buttered Indian bread', 'bread', 59, 12, TRUE, '/images/paratha.jpg');
