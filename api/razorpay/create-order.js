import { createRazorpayOrder, getRazorpayCredentials } from "../_lib/razorpay.js";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";

// Known boutique discount coupons (server verified)
const VALID_COUPONS = {
  WELCOME10: { type: "percent", value: 10, minOrder: 0, maxDiscount: 200 },
  ZOYARA100: { type: "flat", value: 100, minOrder: 599, maxDiscount: 100 },
  ATELIER15: { type: "percent", value: 15, minOrder: 999, maxDiscount: 300 }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items, couponCode, customerPhone, customerEmail } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty. Please add items." });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch server prices and stock from Supabase database
    const itemIds = items.map((i) => i.id);
    let dbProducts = [];

    if (supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, stock, is_active, deleted_at")
        .in("id", itemIds);

      if (error) {
        console.error("[Create Order DB Error]:", error);
      } else if (data) {
        dbProducts = data;
      }
    }

    // 2. Compute canonical subtotal and verify stock on server
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const dbProd = dbProducts.find((p) => p.id === item.id);

      // If DB record found, use official DB price and enforce stock
      let unitPrice = Number(item.price);
      let title = item.title;

      if (dbProd) {
        if (dbProd.is_active === false || dbProd.deleted_at !== null) {
          return res.status(400).json({
            error: `"${dbProd.title}" is no longer available in the boutique.`
          });
        }

        if (dbProd.stock < qty) {
          return res.status(400).json({
            error: `Insufficient inventory for "${dbProd.title}". Only ${dbProd.stock} remaining.`
          });
        }

        unitPrice = Number(dbProd.price);
        title = dbProd.title;
      }

      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;

      verifiedItems.push({
        id: item.id,
        title,
        price: unitPrice,
        quantity: qty,
        selectedSize: item.selectedSize || "Standard"
      });
    }

    // 3. Server coupon validation
    let discountAmount = 0;
    const cleanCoupon = String(couponCode || "").trim().toUpperCase();

    if (cleanCoupon && VALID_COUPONS[cleanCoupon]) {
      const rule = VALID_COUPONS[cleanCoupon];
      if (subtotal >= rule.minOrder) {
        if (rule.type === "percent") {
          discountAmount = Math.min(rule.maxDiscount, Math.round((subtotal * rule.value) / 100));
        } else if (rule.type === "flat") {
          discountAmount = Math.min(subtotal, rule.value);
        }
      }
    }

    // 4. Shipping & Tax
    const freeShippingThreshold = 499;
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : 49;
    const taxAmount = Math.round((subtotal - discountAmount) * 0.03 * 100) / 100; // 3% GST
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);

    const amountInPaise = Math.round(finalTotal * 100);

    // 5. Generate Razorpay Order
    const receipt = `zy_rcpt_${Date.now()}`;
    const { keyId } = getRazorpayCredentials();

    const rzpOrder = await createRazorpayOrder({
      amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        itemCount: String(verifiedItems.length),
        customerPhone: String(customerPhone || ""),
        customerEmail: String(customerEmail || ""),
        couponCode: cleanCoupon
      }
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: rzpOrder.orderId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      subtotal,
      discountAmount,
      shippingFee,
      taxAmount,
      finalTotal,
      keyId,
      verifiedItems
    });
  } catch (err) {
    console.error("[Create Order Error]:", err);
    return res.status(500).json({ error: err.message || "Could not initialize payment order" });
  }
}
