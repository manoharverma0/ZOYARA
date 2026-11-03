import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  try {
    const { items } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ allAvailable: true, items: [] });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // If server DB is not configured, fall through gracefully
      return res.status(200).json({ allAvailable: true, fallback: true });
    }

    const itemIds = items.map((i) => i.id);

    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("id, title, stock, is_active, deleted_at")
      .in("id", itemIds);

    if (error) {
      console.error("[Stock Check DB Error]:", error);
      return res.status(500).json({ error: error.message });
    }

    let allAvailable = true;
    const itemStatuses = items.map((item) => {
      const qty = parseInt(item.quantity, 10) || 1;
      const dbProd = (dbProducts || []).find((p) => p.id === item.id);

      if (!dbProd || dbProd.is_active === false || dbProd.deleted_at !== null) {
        allAvailable = false;
        return {
          id: item.id,
          title: item.title,
          available: false,
          stock: 0,
          requested: qty,
          reason: "Item is no longer available"
        };
      }

      const available = dbProd.stock >= qty;
      if (!available) {
        allAvailable = false;
      }

      return {
        id: item.id,
        title: dbProd.title,
        available,
        stock: dbProd.stock,
        requested: qty,
        reason: available ? null : `Only ${dbProd.stock} pieces left in stock`
      };
    });

    return res.status(200).json({
      allAvailable,
      items: itemStatuses
    });
  } catch (err) {
    console.error("[Stock Check Exception]:", err);
    return res.status(500).json({ error: "Failed to check stock" });
  }
}
