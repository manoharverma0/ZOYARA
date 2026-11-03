-- ==============================================================================
-- ZOYARA — Supabase Production Database Schema (Hardened)
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

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
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_active_catalog 
  ON public.products (category, price) 
  WHERE (is_active = TRUE AND deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products (barcode);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all modifications on products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Public read active products only" ON public.products;
DROP POLICY IF EXISTS "Service role full access on products" ON public.products;

-- Public can ONLY read active, non-deleted items
CREATE POLICY "Public read active products only"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE AND deleted_at IS NULL);

-- Mutations restricted to server-side service role
CREATE POLICY "Service role full access on products"
  ON public.products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- 2. INVENTORY AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('IN', 'OUT', 'ADJUST', 'SALE', 'RETURN', 'AUDIT')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_log_product_id ON public.inventory_log (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_order_id ON public.inventory_log (order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_created_at ON public.inventory_log (created_at DESC);

ALTER TABLE public.inventory_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access on inventory_log" ON public.inventory_log;
CREATE POLICY "Service role access on inventory_log"
  ON public.inventory_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- 3. ONLINE ORDERS TABLE (IDEMPOTENT & PROTECTED)
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
  idempotency_key TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON public.orders (idempotency_key) 
  WHERE (idempotency_key IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_order_id 
  ON public.orders (razorpay_order_id) 
  WHERE (razorpay_order_id IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id 
  ON public.orders (razorpay_payment_id) 
  WHERE (razorpay_payment_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read and insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;

-- Orders are strictly accessible to backend service_role only (no public anon exposure)
CREATE POLICY "Service role full access on orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- 4. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access on store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public read safe store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Service role full access on store_settings" ON public.store_settings;

CREATE POLICY "Public read safe store settings"
  ON public.store_settings FOR SELECT
  TO anon, authenticated
  USING (key IN ('heroBanner', 'announcement', 'socialLinks', 'categoryTiles', 'general', 'spotlight'));

CREATE POLICY "Service role full access on store_settings"
  ON public.store_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- 5. ATOMIC STOCK CONCURRENCY FUNCTIONS
CREATE OR REPLACE FUNCTION public.decrement_stock_atomic(
  p_order_id TEXT,
  p_items JSONB,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
  current_prod RECORD;
  item_id TEXT;
  item_qty INT;
  results JSONB := '[]'::jsonb;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.orders WHERE idempotency_key = p_idempotency_key) THEN
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Order already processed (idempotent call)',
        'order_id', p_order_id,
        'idempotent', true
      );
    END IF;
  END IF;

  FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id TEXT, quantity INT) LOOP
    item_id := item.id;
    item_qty := COALESCE(item.quantity, 1);

    IF item_qty <= 0 THEN
      CONTINUE;
    END IF;

    SELECT id, stock, title, is_active, deleted_at INTO current_prod
    FROM public.products
    WHERE id = item_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product ID % was not found', item_id;
    END IF;

    IF current_prod.is_active = FALSE OR current_prod.deleted_at IS NOT NULL THEN
      RAISE EXCEPTION 'Product "%" is archived or deleted', current_prod.title;
    END IF;

    IF current_prod.stock < item_qty THEN
      RAISE EXCEPTION 'Insufficient stock for "%" (Requested: %, Available: %)', current_prod.title, item_qty, current_prod.stock;
    END IF;

    UPDATE public.products
    SET stock = stock - item_qty,
        version = COALESCE(version, 1) + 1,
        updated_at = NOW()
    WHERE id = item_id;

    INSERT INTO public.inventory_log (
      product_id,
      change_type,
      quantity,
      previous_stock,
      new_stock,
      reason,
      order_id
    ) VALUES (
      item_id,
      'OUT',
      item_qty,
      current_prod.stock,
      current_prod.stock - item_qty,
      'Online Order #' || p_order_id,
      p_order_id
    );

    results := results || jsonb_build_object(
      'id', item_id,
      'deducted', item_qty,
      'remaining', current_prod.stock - item_qty
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'deducted_items', results
  );
END;
$$;
