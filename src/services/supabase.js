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

    // Map database snake_case columns back to camelCase application model
    return data.map(row => ({
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

// Delete a product from Supabase
export async function deleteProductFromSupabase(productId) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("[ZOYARA Supabase] Error deleting product:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[ZOYARA Supabase] Delete product failed:", err);
    return false;
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
