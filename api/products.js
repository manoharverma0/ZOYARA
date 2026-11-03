import { getSupabaseAdmin } from "./_lib/supabaseAdmin.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(200).json({ products: null, message: "Supabase not configured" });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API Products Error]:", error);
      return res.status(500).json({ error: error.message });
    }

    const products = (data || []).map((row) => ({
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

    return res.status(200).json({ products });
  } catch (err) {
    console.error("[API Products Exception]:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}
