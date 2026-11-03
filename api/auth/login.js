import { signToken, createSessionCookie } from "../_lib/auth.js";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { pin, role = "staff" } = req.body || {};

    if (!pin || typeof pin !== "string") {
      return res.status(400).json({ error: "PIN is required" });
    }

    const cleanPin = pin.trim();

    // Check against server environment variable first
    const envPin = (process.env.ADMIN_PIN || process.env.STAFF_PIN || "").trim();

    let isValid = false;

    if (envPin && cleanPin === envPin) {
      isValid = true;
    } else {
      // Check store settings in Supabase if configured
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data } = await supabase
          .from("store_settings")
          .select("value")
          .eq("key", "staffPin")
          .single();
        if (data?.value && String(data.value).trim() === cleanPin) {
          isValid = true;
        }
      }
      
      // Default fallback PIN for initial setup if no custom PIN is set
      if (!isValid && !envPin && cleanPin === "1234") {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: "Invalid Staff PIN. Access denied." });
    }

    const exp = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
    const token = signToken({
      authenticated: true,
      role,
      exp,
      issuedAt: Date.now()
    });

    res.setHeader("Set-Cookie", createSessionCookie(token));
    return res.status(200).json({
      success: true,
      message: "Staff session authenticated successfully",
      expiresAt: new Date(exp).toISOString()
    });
  } catch (err) {
    console.error("[Auth API Error]:", err);
    return res.status(500).json({ error: "Authentication service error" });
  }
}
