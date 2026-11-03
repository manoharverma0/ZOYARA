-- ==============================================================================
-- ZOYARA — Database Security Hardening & Concurrency Migration
-- Migration ID: 20261103_security_hardening
-- Purpose:
--   1. Additive schema evolution: soft-delete, versioning, idempotency keys
--   2. Real-time audit trail: inventory_log
--   3. Concurrency-safe, atomic stock decrement with row-level locks (FOR UPDATE)
--   4. Row-Level Security (RLS) lockdown:
--      - Protect customer PII (orders table completely closed to public anon)
--      - Restrict public catalog read to active, non-deleted products
--      - Block public modifications of prices, products, and store settings
--
-- INSTRUCTIONS FOR USER:
--   Run this script in your Supabase Dashboard:
--   SQL Editor -> New Query -> Paste & Click Run.
--   This script is purely ADDITIVE and idempotent (safe to run multiple times).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADDITIVE ENHANCEMENTS TO PRODUCTS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Fast index for active customer catalog queries
CREATE INDEX IF NOT EXISTS idx_products_active_catalog 
  ON public.products (category, price) 
  WHERE (is_active = TRUE AND deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_products_sku 
  ON public.products (sku);

CREATE INDEX IF NOT EXISTS idx_products_barcode 
  ON public.products (barcode);


-- ------------------------------------------------------------------------------
-- 2. AUDIT TRAIL: INVENTORY_LOG TABLE
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_inventory_log_product_id 
  ON public.inventory_log (product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_log_order_id 
  ON public.inventory_log (order_id);

CREATE INDEX IF NOT EXISTS idx_inventory_log_created_at 
  ON public.inventory_log (created_at DESC);

-- Enable RLS on inventory log (audit records should NEVER be accessible by anon)
ALTER TABLE public.inventory_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access on inventory_log" ON public.inventory_log;
CREATE POLICY "Service role access on inventory_log"
  ON public.inventory_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 3. IDEMPOTENT ENHANCEMENTS TO ORDERS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Enforce uniqueness on verified payment identifiers to eliminate double-charges/replay attacks
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON public.orders (idempotency_key) 
  WHERE (idempotency_key IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_order_id 
  ON public.orders (razorpay_order_id) 
  WHERE (razorpay_order_id IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id 
  ON public.orders (razorpay_payment_id) 
  WHERE (razorpay_payment_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone 
  ON public.orders (customer_phone);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON public.orders (created_at DESC);


-- ------------------------------------------------------------------------------
-- 4. CONCURRENCY-SAFE ATOMIC STOCK DECREMENT FUNCTION
-- ------------------------------------------------------------------------------
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
  -- 1. Idempotency check: if this order key has already been recorded, exit cleanly
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

  -- 2. Loop through all ordered items and lock rows FOR UPDATE to block race conditions
  FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id TEXT, quantity INT) LOOP
    item_id := item.id;
    item_qty := COALESCE(item.quantity, 1);

    IF item_qty <= 0 THEN
      CONTINUE;
    END IF;

    -- Row-level lock on the product
    SELECT id, stock, title, is_active, deleted_at INTO current_prod
    FROM public.products
    WHERE id = item_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product ID % was not found in the boutique catalog', item_id;
    END IF;

    IF current_prod.is_active = FALSE OR current_prod.deleted_at IS NOT NULL THEN
      RAISE EXCEPTION 'Product "%" is archived or no longer available', current_prod.title;
    END IF;

    IF current_prod.stock < item_qty THEN
      RAISE EXCEPTION 'Insufficient inventory for "%" (Requested: %, Available: %)', current_prod.title, item_qty, current_prod.stock;
    END IF;

    -- 3. Atomic stock update
    UPDATE public.products
    SET stock = stock - item_qty,
        version = COALESCE(version, 1) + 1,
        updated_at = NOW()
    WHERE id = item_id;

    -- 4. Record audit entry in inventory_log
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


-- ------------------------------------------------------------------------------
-- 5. READ-ONLY STOCK CHECK FUNCTION (For Cart & Checkout Prevalidation)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_stock_availability(p_items JSONB)
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
  is_available BOOLEAN := TRUE;
  item_status JSONB := '[]'::jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id TEXT, quantity INT) LOOP
    item_id := item.id;
    item_qty := COALESCE(item.quantity, 1);

    SELECT id, stock, title, is_active, deleted_at INTO current_prod
    FROM public.products
    WHERE id = item_id;

    IF NOT FOUND OR current_prod.is_active = FALSE OR current_prod.deleted_at IS NOT NULL THEN
      is_available := FALSE;
      item_status := item_status || jsonb_build_object(
        'id', item_id,
        'title', COALESCE(current_prod.title, 'Unavailable Piece'),
        'available', false,
        'stock', 0,
        'requested', item_qty,
        'reason', 'Discontinued or Deleted'
      );
    ELSIF current_prod.stock < item_qty THEN
      is_available := FALSE;
      item_status := item_status || jsonb_build_object(
        'id', item_id,
        'title', current_prod.title,
        'available', false,
        'stock', current_prod.stock,
        'requested', item_qty,
        'reason', 'Insufficient Stock'
      );
    ELSE
      item_status := item_status || jsonb_build_object(
        'id', item_id,
        'title', current_prod.title,
        'available', true,
        'stock', current_prod.stock,
        'requested', item_qty
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'all_available', is_available,
    'items', item_status
  );
END;
$$;


-- ------------------------------------------------------------------------------
-- 6. STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- === PRODUCTS ===
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop insecure, wide-open legacy policies
DROP POLICY IF EXISTS "Allow all modifications on products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Public read active products only" ON public.products;
DROP POLICY IF EXISTS "Service role full access on products" ON public.products;

-- Allow public to ONLY read active, non-deleted products
CREATE POLICY "Public read active products only"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE AND deleted_at IS NULL);

-- All inserts, updates, and deletes are restricted to service_role (server backend)
CREATE POLICY "Service role full access on products"
  ON public.products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- === ORDERS ===
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop insecure open policy that leaked all patron names, phones & addresses
DROP POLICY IF EXISTS "Allow public read and insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;

-- Orders can ONLY be queried or written by service_role (server backend)
CREATE POLICY "Service role full access on orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- === STORE_SETTINGS ===
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Drop wide-open policy
DROP POLICY IF EXISTS "Allow all access on store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public read safe store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Service role full access on store_settings" ON public.store_settings;

-- Public anon can ONLY read non-sensitive branding/content settings
CREATE POLICY "Public read safe store settings"
  ON public.store_settings FOR SELECT
  TO anon, authenticated
  USING (key IN ('heroBanner', 'announcement', 'socialLinks', 'categoryTiles', 'general', 'spotlight'));

-- Full access for service_role
CREATE POLICY "Service role full access on store_settings"
  ON public.store_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
