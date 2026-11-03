import crypto from "crypto";

export function getRazorpayCredentials() {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

  return {
    keyId,
    keySecret,
    isConfigured: Boolean(keyId && keySecret)
  };
}

export async function createRazorpayOrder({ amountInPaise, currency = "INR", receipt, notes = {} }) {
  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();

  if (!isConfigured) {
    throw new Error("Razorpay credentials are not configured on the server");
  }

  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader
    },
    body: JSON.stringify({
      amount: Math.round(amountInPaise),
      currency,
      receipt: String(receipt || `rcpt_${Date.now()}`),
      notes
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.description || data?.error?.message || "Failed to create Razorpay order";
    throw new Error(errorMsg);
  }

  return {
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
    status: data.status
  };
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const { keySecret, isConfigured } = getRazorpayCredentials();

  if (!isConfigured) {
    throw new Error("Razorpay secret is not configured on the server");
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}
