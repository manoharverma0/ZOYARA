-- ==============================================================================
-- ZOYARA — RESTORE FULL DATABASE CLIENT SYNC (RLS POLICIES & REALTIME)
-- ==============================================================================
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- to allow the Storefront, Staff Portal, and POS to sync live changes directly
-- to the database across all devices (mobile, tablet, desktop) without 401 errors.
-- ==============================================================================

-- 1. PRODUCTS: Full live management (Read, Insert, Update, Soft-Delete)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all modifications on products" ON public.products;
DROP POLICY IF EXISTS "Public read active products only" ON public.products;
DROP POLICY IF EXISTS "Service role full access on products" ON public.products;
DROP POLICY IF EXISTS "Allow products full management" ON public.products;
DROP POLICY IF EXISTS "Allow staff and anon products management" ON public.products;

CREATE POLICY "Allow products full management"
  ON public.products FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);


-- 2. STORE SETTINGS: Full live management (Store customizer, banner, UPI, SEO)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access on store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public read safe store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Service role full access on store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow store_settings full management" ON public.store_settings;

CREATE POLICY "Allow store_settings full management"
  ON public.store_settings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);


-- 3. ORDERS: Allow storefront to create orders and POS / Staff to view and update them
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read and insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow orders full management" ON public.orders;

CREATE POLICY "Allow orders full management"
  ON public.orders FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);


-- 4. ENABLE SUPABASE REALTIME (Instant broadcast of products and orders to all devices)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
