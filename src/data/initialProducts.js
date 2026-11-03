// Curated catalogue for ZAYARA
// Zero demo products permanently - clean catalog by default
export const INITIAL_PRODUCTS = [];

export const DEFAULT_CATEGORY_TILES = [
  {
    id: "Jewellery",
    title: "Fine Jewellery",
    subtitle: "Earrings, Rings & Chokers",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    priceTag: "From ₹179"
  },
  {
    id: "Bras",
    title: "Bras & Bralettes",
    subtitle: "Zero Wire & Seamless",
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=600&q=80",
    priceTag: "From ₹289"
  },
  {
    id: "Underwear",
    title: "Girls Underwear",
    subtitle: "Pure Cotton & Laser-Cut",
    image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=600&q=80",
    priceTag: "From ₹229"
  },
  {
    id: "antiTarnish",
    title: "Anti-Tarnish 18K",
    subtitle: "Shower & Sweat Proof",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    priceTag: "18K Gold Polish"
  },
  {
    id: "under250",
    title: "Under ₹250",
    subtitle: "Affordable Daily Luxury",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80",
    priceTag: "Best Value"
  }
];

export const STORE_SETTINGS = {
  name: "ZOYARA FASHION & COMFORT",
  tagline: "Fashion & Comfort",
  categoryTiles: DEFAULT_CATEGORY_TILES,
  // Anti-Tarnish Spotlight Banner
  spotlightBadge: "Vacuum PVD Science",
  spotlightHeadline: "Say Goodbye to Green Skin & Tarnished Chains.",
  spotlightDescription: "Every ZOYARA jewellery piece is finished with an advanced 18K vacuum gold dip over hypoallergenic stainless steel. Wear it to college, in the shower, or through intense summer days without discoloration.",
  spotlightButtonText: "View Anti-Tarnish Edit",
  spotlightImageUrl: "https://images.unsplash.com/photo-1611591477439-5103fc918f6f?auto=format&fit=crop&w=800&q=80",
  address: "45/1 Near Bangali Chourah, Indore, Madhya Pradesh - 452001",
  phone: "+91 74709 32714",
  whatsappNumber: "917470932714",
  email: "zoyarafashion@gmail.com",
  gstin: "07AAAAZ0000A1Z5", // GSTIN for billing
  receiptFooter: "Thank you for shopping with ZOYARA. For hygiene standards, intimate wear cannot be returned once opened. Jewellery exchange within 7 days with tag.",
  thermalSize: "80mm", // '58mm' or '80mm'
  upiId: "zoyara.store@okaxis", // Dynamic UPI QR code ID
  taxRate: 3, // 3% composite GST for fashion jewellery & garments
  staffPin: "85200", // Strong Admin & Staff Portal Access Password

  // Live Cloud Database (Supabase)
  supabaseUrl: (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || "",
  supabaseAnonKey: (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) || "",
  
  // Payment Gateway (Razorpay)
  razorpayKeyId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_RAZORPAY_KEY_ID) || "rzp_live_TvZx817mfaHPhW", // Configurable in Staff Settings or .env
  razorpayEnabled: true,

  // Full Technical SEO Settings
  seoTitle: "ZOYARA — Fashion & Comfort | Anti-Tarnish Jewellery & Everyday Intimates",
  seoDescription: "ZOYARA — Fashion & Comfort. Curated 18K anti-tarnish waterproof jewellery, zero-wire bras, and seamless intimates crafted for everyday elegance.",
  seoKeywords: "zoyara, fashion and comfort, anti-tarnish jewellery, 18k jewellery, waterproof jewellery, wirefree bras, seamless underwear, affordable luxury jewellery india",
  seoRobots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  siteUrl: (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) || "https://zoyara.vercel.app",
  ogImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
  
  // Google Webmaster & Analytics
  googleSiteVerification: "google-site-verification=zoyara_live_verification_token_2026",
  googleAnalyticsId: "G-ZOYARA2026", // Google Analytics 4 ID
  googleAdsClientId: "ca-pub-zoyara_ad_client", // Google AdSense / Ads Client
  googleNewsPublication: "ZOYARA Fashion & Lifestyle News",
  bingSiteVerification: "",
  pinterestVerification: "",
  customHeaderHtml: "<!-- Custom tracking scripts, pixels & tags injected here -->",
  customFooterHtml: "",

  // Offline Stores & Boutique Addresses
  offlineStores: [
    {
      id: "store-indore",
      name: "ZOYARA Flagship Boutique",
      address: "45/1 Near Bangali Chourah",
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: "452001",
      phone: "+91 74709 32714",
      hours: "10:30 AM – 9:00 PM (All 7 Days)",
      mapsUrl: "https://maps.google.com/?q=Bangali+Chourah+Indore"
    }
  ]
};
