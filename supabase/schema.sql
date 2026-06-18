-- ============================================================
-- BATUR TANI - Database Schema
-- Platform Agregator B2B Rantai Pasok Agribisnis Dataran Tinggi
-- ============================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ==================
-- 1. CUSTOM TYPES (ENUMS)
-- ==================

CREATE TYPE user_role AS ENUM ('farmer', 'buyer');

CREATE TYPE commodity_category AS ENUM ('hortikultura', 'susu');

CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'paid',
  'on_hold',
  'in_delivery',
  'delivered',
  'completed',
  'cancelled'
);

CREATE TYPE escrow_status AS ENUM (
  'pending',
  'captured',
  'on_hold',
  'released',
  'refunded'
);

CREATE TYPE eqc_condition AS ENUM ('fresh', 'acceptable', 'rejected');

CREATE TYPE alert_type AS ENUM ('early_harvest', 'frost', 'heavy_rain', 'drought');

CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- ==================
-- 2. TABLES
-- ==================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'buyer',
  full_name TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  bank_account TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Commodities table (products listed by farmers)
CREATE TABLE commodities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category commodity_category NOT NULL DEFAULT 'hortikultura',
  description TEXT,
  price_per_unit INTEGER NOT NULL CHECK (price_per_unit > 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  stock_projection INTEGER NOT NULL DEFAULT 0 CHECK (stock_projection >= 0),
  harvest_date DATE,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Orders table (pre-orders / smart contracts)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  locked_price INTEGER NOT NULL CHECK (locked_price > 0),
  total_amount INTEGER NOT NULL CHECK (total_amount > 0),
  status order_status NOT NULL DEFAULT 'pending_payment',
  delivery_deadline TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Escrow transactions table
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  midtrans_order_id TEXT UNIQUE,
  snap_token TEXT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status escrow_status NOT NULL DEFAULT 'pending',
  payment_type TEXT,
  paid_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- E-QC (Electronic Quality Control) logs
CREATE TABLE eqc_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  temperature DOUBLE PRECISION,
  condition eqc_condition NOT NULL DEFAULT 'fresh',
  photo_url TEXT,
  notes TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Weather alerts for farmers
CREATE TABLE weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  severity severity_level NOT NULL DEFAULT 'low',
  message TEXT NOT NULL,
  weather_data JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==================
-- 3. INDEXES (for query performance)
-- ==================

CREATE INDEX idx_commodities_farmer ON commodities(farmer_id);
CREATE INDEX idx_commodities_category ON commodities(category);
CREATE INDEX idx_commodities_available ON commodities(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_escrow_order ON escrow_transactions(order_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_eqc_order ON eqc_logs(order_id);
CREATE INDEX idx_weather_farmer ON weather_alerts(farmer_id);
CREATE INDEX idx_weather_unread ON weather_alerts(is_read) WHERE is_read = FALSE;

-- ==================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eqc_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Commodities: everyone can read, only farmer-owner can CUD
CREATE POLICY "Commodities are viewable by everyone"
  ON commodities FOR SELECT
  USING (true);

CREATE POLICY "Farmers can insert own commodities"
  ON commodities FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own commodities"
  ON commodities FOR UPDATE
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own commodities"
  ON commodities FOR DELETE
  USING (auth.uid() = farmer_id);

-- Orders: buyers and farmers involved can see their orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Involved parties can update orders"
  ON orders FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

-- Escrow: parties involved in the order can view
CREATE POLICY "Order parties can view escrow"
  ON escrow_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = escrow_transactions.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid())
    )
  );

CREATE POLICY "System can manage escrow"
  ON escrow_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = escrow_transactions.order_id 
      AND orders.buyer_id = auth.uid()
    )
  );

CREATE POLICY "System can update escrow"
  ON escrow_transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = escrow_transactions.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid())
    )
  );

-- E-QC: buyer can create, both parties can view
CREATE POLICY "Order parties can view EQC"
  ON eqc_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = eqc_logs.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid())
    )
  );

CREATE POLICY "Buyers can create EQC"
  ON eqc_logs FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Weather alerts: farmers can view their own
CREATE POLICY "Farmers can view own weather alerts"
  ON weather_alerts FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "System can insert weather alerts"
  ON weather_alerts FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own alerts"
  ON weather_alerts FOR UPDATE
  USING (auth.uid() = farmer_id);

-- ==================
-- 5. FUNCTIONS & TRIGGERS
-- ==================

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name, business_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run on every new auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function: Release escrow when E-QC is approved
CREATE OR REPLACE FUNCTION handle_eqc_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_approved = TRUE THEN
    -- Update escrow status to released
    UPDATE escrow_transactions
    SET status = 'released', released_at = NOW()
    WHERE order_id = NEW.order_id AND status = 'on_hold';
    
    -- Update order status to completed
    UPDATE orders
    SET status = 'completed'
    WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run when E-QC is approved
CREATE OR REPLACE TRIGGER on_eqc_approved
  AFTER INSERT OR UPDATE OF is_approved ON eqc_logs
  FOR EACH ROW
  WHEN (NEW.is_approved = TRUE)
  EXECUTE FUNCTION handle_eqc_approval();

-- Function: Update order status when payment is captured
CREATE OR REPLACE FUNCTION handle_escrow_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'captured' AND OLD.status = 'pending' THEN
    -- Update escrow to on_hold
    NEW.status := 'on_hold';
    NEW.paid_at := NOW();
    
    -- Update order status
    UPDATE orders
    SET status = 'on_hold'
    WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Handle payment status changes
CREATE OR REPLACE TRIGGER on_escrow_payment
  BEFORE UPDATE OF status ON escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_escrow_payment();

-- ==================
-- 6. SEED DATA (Optional sample data for testing)
-- ==================

-- NOTE: Run this AFTER creating test users via Supabase Auth
-- The profiles will be auto-created by the trigger above.
-- You can then update profiles with additional info:

-- Example seed (uncomment and modify after creating test users):
/*
-- Update farmer profile
UPDATE profiles SET
  business_name = 'Kebun Sejahtera',
  phone = '081234567890',
  address = 'Desa Batur, Kec. Batur, Kab. Banjarnegara',
  latitude = -7.2321,
  longitude = 109.9029,
  bank_account = '1234567890'
WHERE id = 'YOUR_FARMER_USER_ID';

-- Update buyer profile
UPDATE profiles SET
  business_name = 'Restoran Nusantara',
  phone = '089876543210',
  address = 'Jl. Sudirman No. 123, Purwokerto'
WHERE id = 'YOUR_BUYER_USER_ID';

-- Insert sample commodities
INSERT INTO commodities (farmer_id, name, category, description, price_per_unit, unit, stock_projection, harvest_date) VALUES
('YOUR_FARMER_USER_ID', 'Tomat Cherry Premium', 'hortikultura', 'Tomat cherry organik dataran tinggi Batur, rasa manis alami', 35000, 'kg', 500, CURRENT_DATE + INTERVAL '30 days'),
('YOUR_FARMER_USER_ID', 'Kentang Granola', 'hortikultura', 'Kentang varietas Granola, cocok untuk industri makanan', 15000, 'kg', 2000, CURRENT_DATE + INTERVAL '45 days'),
('YOUR_FARMER_USER_ID', 'Susu Sapi Segar', 'susu', 'Susu segar dari sapi perah FH, pemerahan pagi, golden period 4 jam', 12000, 'liter', 100, CURRENT_DATE),
('YOUR_FARMER_USER_ID', 'Bawang Merah Brebes', 'hortikultura', 'Bawang merah kualitas ekspor, kadar air rendah', 45000, 'kg', 800, CURRENT_DATE + INTERVAL '21 days'),
('YOUR_FARMER_USER_ID', 'Cabai Rawit Merah', 'hortikultura', 'Cabai rawit merah super pedas, tingkat kepedasan tinggi', 80000, 'kg', 300, CURRENT_DATE + INTERVAL '14 days');
*/
