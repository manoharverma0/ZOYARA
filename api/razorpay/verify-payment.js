import { verifyRazorpaySignature } from "../_lib/razorpay.js";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required Razorpay payment verification parameters" });
    }

    // 1. Cryptographically verify payment signature
    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValidSignature) {
      console.warn("[Razorpay Security Alert] Invalid payment signature received:", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      return res.status(400).json({
        success: false,
        error: "Payment verification failed: Invalid cryptographic signature"
      });
    }

    const supabase = getSupabaseAdmin();
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = orderDetails?.orderId || `ZY-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceNumber = orderDetails?.invoiceNumber || `ZY-INV-${year}-${randomSuffix}`;

    const items = orderDetails?.items || [];
    const idempotencyKey = razorpay_payment_id;

    // 2. Atomic Stock Decrement via PostgreSQL Function
    if (supabase && items.length > 0) {
      try {
        const { data: stockResult, error: stockError } = await supabase.rpc(
          "decrement_stock_atomic",
          {
            p_order_id: orderId,
            p_items: items.map((i) => ({ id: i.id, quantity: i.quantity || 1 })),
            p_idempotency_key: idempotencyKey
          }
        );

        if (stockError) {
          console.error("[Atomic Stock Error]:", stockError.message);
          // If RPC is missing or fails due to schema not run yet, log it
        } else {
          console.log("[Atomic Stock Success]:", stockResult);
        }
      } catch (rpcErr) {
        console.warn("[Stock RPC Execution Warning]:", rpcErr);
      }
    }

    // 3. Persist verified order to database via Service Role
    const verifiedOrder = {
      order_id: orderId,
      invoice_number: invoiceNumber,
      customer_name: orderDetails?.customerName || "Patron",
      customer_phone: orderDetails?.customerPhone || "",
      customer_email: orderDetails?.customerEmail || "",
      payment_method: "Razorpay Live Gateway",
      payment_status: "Paid",
      status: "Confirmed",
      transaction_id: razorpay_payment_id,
      subtotal: Number(orderDetails?.subtotal || 0),
      discount_amount: Number(orderDetails?.discountAmount || 0),
      tax_amount: Number(orderDetails?.taxAmount || 0),
      final_total: Number(orderDetails?.finalTotal || 0),
      shipping_address: orderDetails?.shippingAddress || {},
      items: items,
      idempotency_key: idempotencyKey,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { error: insertError } = await supabase
        .from("orders")
        .upsert(verifiedOrder, { onConflict: "idempotency_key" });

      if (insertError) {
        console.error("[Save Order Error]:", insertError.message);
      }
    }

    // Map back to camelCase frontend representation
    const responseOrder = {
      orderId,
      invoiceNumber,
      date: verifiedOrder.created_at,
      status: "Order Confirmed",
      paymentStatus: "Paid",
      paymentMethod: "Razorpay Live Gateway",
      transactionId: razorpay_payment_id,
      customerName: verifiedOrder.customer_name,
      customerPhone: verifiedOrder.customer_phone,
      customerEmail: verifiedOrder.customer_email,
      shippingAddress: verifiedOrder.shipping_address,
      items: verifiedOrder.items,
      subtotal: verifiedOrder.subtotal,
      discountAmount: verifiedOrder.discount_amount,
      taxAmount: verifiedOrder.tax_amount,
      finalTotal: verifiedOrder.final_total,
      razorpayPaymentId: razorpay_payment_id,
      verifiedServerSide: true
    };

    return res.status(200).json({
      success: true,
      message: "Payment cryptographically verified and order confirmed",
      order: responseOrder
    });
  } catch (err) {
    console.error("[Verify Payment Error]:", err);
    return res.status(500).json({ error: err.message || "Payment verification failed" });
  }
}
