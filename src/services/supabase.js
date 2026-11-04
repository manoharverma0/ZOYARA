import { createClient } from "@supabase/supabase-js";
import { getStoreSettings } from "./storage";

const DEFAULT_SUPABASE_URL = "https://pozjbjhrwtuihiqqjyxr.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvempiamhyd3R1aWhpcXFqeXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMjQ2NDMsImV4cCI6MjEwODYwMDY0M30.e4EHCWpdc5BaMY_LxlJli419ES6o-DqQP-p1Xb6f-WA";

// Read Supabase credentials from .env, runtime store settings, or project defaults
export function getSupabaseCredentials() {
  const settings = getStoreSettings();
  const envUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL;
  const envKey = typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY;

  const supabaseUrl = (envUrl || settings?.supabaseUrl || DEFAULT_SUPABASE_URL || "").trim();
  const supabaseAnonKey = (envKey || settings?.supabaseAnonKey || DEFAULT_SUPABASE_KEY || "").trim();

  const isConfigured = Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project")
  );

  return { supabaseUrl, supabaseAnonKey, isConfigured };
}

let supabaseInstance = null;
let lastUrl = "";
let lastKey = "";

export function getSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) return null;

  if (!supabaseInstance || lastUrl !== supabaseUrl || lastKey !== supabaseAnonKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      lastUrl = supabaseUrl;
      lastKey = supabaseAnonKey;
    } catch (err) {
      console.error("[ZOYARA Supabase] Client initialization error:", err);
      return null;
    }
  }

  return supabaseInstance;
}

/**
 * ==========================================
 * LIVE PRODUCT MANAGEMENT (SUPABASE CRUD)
 * ==========================================
 */

// Fetch all live products from Supabase
export async function fetchLiveProducts() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[ZOYARA Supabase] Error fetching products:", error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    // Filter out soft-deleted / archived items
    const activeRows = data.filter(row => row.is_active !== false && !row.deleted_at);

    // Map database snake_case columns back to camelCase application model
    return activeRows.map(row => ({
      id: row.id,
      sku: row.sku,
      barcode: row.barcode,
      title: row.title,
      category: row.category,
      subCategory: row.sub_category || row.category,
      price: Number(row.price),
      costPrice: Number(row.cost_price || 0),
      stock: Number(row.stock || 0),
      image: row.image,
      description: row.description || "",
      material: row.material || "",
      badge: row.badge || "",
      rating: Number(row.rating || 5.0),
      reviewsCount: Number(row.reviews_count || 0),
      sizes: row.sizes || ["Standard"],
      createdAt: row.created_at
    }));
  } catch (err) {
    console.error("[ZOYARA Supabase] Network/fetch error:", err);
    return null;
  }
}

// Add or update a product in Supabase
export async function syncProductToSupabase(product) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const dbPayload = {
      id: product.id,
      sku: product.sku,
      barcode: product.barcode,
      title: product.title,
      category: product.category,
      sub_category: product.subCategory,
      price: Number(product.price),
      cost_price: Number(product.costPrice || 0),
      stock: Number(product.stock || 0),
      image: product.image,
      description: product.description || "",
      material: product.material || "",
      badge: product.badge || "",
      rating: Number(product.rating || 5.0),
      reviews_count: Number(product.reviewsCount || 0),
      sizes: product.sizes || ["Standard"],
      is_active: true,
      deleted_at: null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("products")
      .upsert(dbPayload, { onConflict: "id" });

    if (error) {
      console.error("[ZOYARA Supabase] Error syncing product:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[ZOYARA Supabase] Sync product failed:", err);
    return false;
  }
}

// Soft-delete a product in Supabase
export async function deleteProductFromSupabase(productId) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("products")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq("id", productId);

    if (error) {
      console.warn("[ZOYARA Supabase] Soft delete update notice:", error.message);
      const { error: hardErr } = await supabase.from("products").delete().eq("id", productId);
      return !hardErr;
    }
    return true;
  } catch (err) {
    console.error("[ZOYARA Supabase] Delete product failed:", err);
    return false;
  }
}

// Push all local products in bulk to Supabase
export async function pushAllProductsToSupabase(products) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase cloud database is not configured. Please set your Supabase URL & Anon Key." };
  if (!Array.isArray(products) || products.length === 0) {
    return { success: false, error: "No products available to upload." };
  }

  try {
    const payload = products.map(product => ({
      id: product.id,
      sku: product.sku,
      barcode: product.barcode,
      title: product.title,
      category: product.category,
      sub_category: product.subCategory || product.category,
      price: Number(product.price),
      cost_price: Number(product.costPrice || 0),
      stock: Number(product.stock || 0),
      image: product.image,
      description: product.description || "",
      material: product.material || "",
      badge: product.badge || "",
      rating: Number(product.rating || 5.0),
      reviews_count: Number(product.reviewsCount || 0),
      sizes: product.sizes || ["Standard"],
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("[ZOYARA Supabase] Bulk upload error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, count: payload.length };
  } catch (err) {
    console.error("[ZOYARA Supabase] Bulk upload failed:", err);
    return { success: false, error: err.message || "Bulk upload failed." };
  }
}

// Test live connectivity to Supabase
export async function testSupabaseConnection(overrideUrl, overrideKey) {
  try {
    const creds = getSupabaseCredentials();
    const url = (overrideUrl || creds.supabaseUrl || "").trim();
    const key = (overrideKey || creds.supabaseAnonKey || "").trim();

    if (!url || !key) {
      return { success: false, error: "Supabase URL and Anon Key are required." };
    }

    if (!url.startsWith("https://") || url.includes("your-project")) {
      return { success: false, error: "Please enter a valid, active Supabase project URL." };
    }

    const testClient = createClient(url, key);
    const { data, error } = await testClient.from("products").select("id").limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: data ? data.length : 0 };
  } catch (err) {
    return { success: false, error: err.message || "Network error reaching Supabase." };
  }
}

// Subscribe to realtime database changes on products table
export function subscribeToLiveProducts(onUpdate) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel("realtime-products-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        async () => {
          const fresh = await fetchLiveProducts();
          if (fresh && typeof onUpdate === "function") {
            onUpdate(fresh);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  } catch (err) {
    console.warn("[ZOYARA Supabase] Realtime products subscription warning:", err);
    return () => {};
  }
}

/**
 * ==========================================
 * LIVE ONLINE ORDERS (SUPABASE CRUD)
 * ==========================================
 */

export async function fetchLiveOrders() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[ZOYARA Supabase] Error fetching orders:", error.message);
      return null;
    }

    if (!data) return null;

    return data.map(row => ({
      orderId: row.order_id,
      invoiceNumber: row.invoice_number,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      status: row.status,
      transactionId: row.transaction_id,
      subtotal: Number(row.subtotal),
      discountAmount: Number(row.discount_amount || 0),
      taxAmount: Number(row.tax_amount || 0),
      finalTotal: Number(row.final_total),
      shippingAddress: row.shipping_address,
      items: row.items,
      date: row.created_at
    }));
  } catch (err) {
    console.error("[ZOYARA Supabase] Fetch orders failed:", err);
    return null;
  }
}

export async function syncOrderToSupabase(order) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const dbPayload = {
      order_id: order.orderId,
      invoice_number: order.invoiceNumber,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_email: order.customerEmail || "",
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      status: order.status,
      transaction_id: order.transactionId,
      subtotal: Number(order.subtotal),
      discount_amount: Number(order.discountAmount || 0),
      tax_amount: Number(order.taxAmount || 0),
      final_total: Number(order.finalTotal),
      shipping_address: order.shippingAddress,
      items: order.items,
      created_at: order.date || new Date().toISOString()
    };

    const { error } = await supabase
      .from("orders")
      .upsert(dbPayload, { onConflict: "order_id" });

    if (error) {
      console.error("[ZOYARA Supabase] Error saving order:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[ZOYARA Supabase] Save order failed:", err);
    return false;
  }
}

/**
 * ==========================================
 * FREE SUPABASE AUTH & OTP HELPERS
 * ==========================================
 */

// Free Email OTP via Supabase Auth
export async function sendSupabaseEmailOtp(email) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase is not configured." };

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: `A secure 6-digit OTP has been sent to ${email}` };
  } catch (err) {
    return { success: false, error: err.message || "Failed to send email OTP." };
  }
}

// Verify Supabase Email OTP
export async function verifySupabaseEmailOtp(email, token) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase is not configured." };

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, session: data.session, user: data.user };
  } catch (err) {
    return { success: false, error: err.message || "Verification failed." };
  }
}

/**
 * ==========================================
 * LIVE STORE SETTINGS & HOME PAGE IMAGES
 * ==========================================
 */

// Fetch live store settings (hero banner, spotlight, category tiles) from Supabase
export async function fetchLiveStoreSettings() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "store_config")
      .maybeSingle();

    if (error) {
      console.warn("[ZOYARA Supabase] Error fetching store settings:", error.message);
      return null;
    }

    return data ? data.value : null;
  } catch (err) {
    console.error("[ZOYARA Supabase] Fetch store settings error:", err);
    return null;
  }
}

// Save live store settings to Supabase
export async function syncStoreSettingsToSupabase(settings) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      key: "store_config",
      value: settings,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("store_settings")
      .upsert(payload, { onConflict: "key" });

    if (error) {
      console.error("[ZOYARA Supabase] Error saving store settings:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[ZOYARA Supabase] Save store settings failed:", err);
    return false;
  }
}

// Realtime listener for store settings & home page image updates
export function subscribeToLiveStoreSettings(onUpdate) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel("realtime-settings-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        async () => {
          const fresh = await fetchLiveStoreSettings();
          if (fresh && typeof onUpdate === "function") {
            onUpdate(fresh);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  } catch (err) {
    console.warn("[ZOYARA Supabase] Realtime settings subscription warning:", err);
    return () => {};
  }
}
