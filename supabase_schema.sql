-- ========================================================
-- ZOYARA — Supabase Production Database Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ========================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  barcode TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  price NUMERIC NOT NULL,
  cost_price NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  description TEXT,
  material TEXT,
  badge TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  sizes JSONB DEFAULT '["Standard"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (customers can browse products)
CREATE POLICY "Allow public read access on products"
  ON public.products FOR SELECT
  USING (true);

-- Allow insert/update/delete for admin
CREATE POLICY "Allow all modifications on products"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);


-- 2. ONLINE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  order_id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status TEXT DEFAULT 'Processing',
  transaction_id TEXT,
  subtotal NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  final_total NUMERIC NOT NULL,
  shipping_address JSONB,
  items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and insert on orders"
  ON public.orders FOR ALL
  USING (true)
  WITH CHECK (true);


-- 3. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on store_settings"
  ON public.store_settings FOR ALL
  USING (true)
  WITH CHECK (true);
