// Curated catalogue for ZAYARA
// Strictly: 1. Fine Jewellery, 2. Girls Bras & Bralettes, 3. Girls Underwear & Panties
// Pricing tier: Accessible Luxury from ₹150 to ₹400

export const INITIAL_PRODUCTS = [
  // ==========================================
  // 1. FINE JEWELLERY COLLECTION (Anti-Tarnish 18K Polish)
  // ==========================================
  {
    id: "zy-jwl-01",
    sku: "ZY-JWL-01",
    barcode: "890100100001",
    title: "Aura Baroque Pearl Drop Hoops",
    category: "Jewellery",
    subCategory: "Earrings",
    price: 249,
    costPrice: 95,
    stock: 28,
    sizes: ["Free Size"],
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    description: "Hand-finished freshwater baroque faux pearl nestled on an anti-tarnish 18K gold-tone hoop. Featherlight for all-day comfort.",
    material: "18K Gold Plated Alloy, Hypoallergenic Stainless Steel Post",
    badge: "Bestseller",
    rating: 4.9,
    reviewsCount: 42
  },
  {
    id: "zy-jwl-02",
    sku: "ZY-JWL-02",
    barcode: "890100100002",
    title: "Elysian Croissant Twisted Ring",
    category: "Jewellery",
    subCategory: "Rings",
    price: 199,
    costPrice: 70,
    stock: 35,
    sizes: ["Adjustable"],
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    description: "A sculpted croissant twist ring crafted with a modern minimalist curve. Gently adjustable to fit all finger sizes comfortably.",
    material: "High-grade Brass with 18K PVD Anti-Tarnish Coating",
    badge: "Anti-Tarnish",
    rating: 4.8,
    reviewsCount: 38
  },
  {
    id: "zy-jwl-03",
    sku: "ZY-JWL-03",
    barcode: "890100100003",
    title: "Solstice Liquid Herringbone Choker",
    category: "Jewellery",
    subCategory: "Necklaces",
    price: 349,
    costPrice: 130,
    stock: 20,
    sizes: ["40cm + 5cm Extender"],
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    description: "Sleek liquid-gold herringbone snake chain that drapes effortlessly along the collarbone. Waterproof and shower-friendly.",
    material: "316L Surgical Stainless Steel, 18K Vacuum Gold Dip",
    badge: "Waterproof",
    rating: 5.0,
    reviewsCount: 56
  },
  {
    id: "zy-jwl-04",
    sku: "ZY-JWL-04",
    barcode: "890100100004",
    title: "Celestial Sunburst Medallion Pendant",
    category: "Jewellery",
    subCategory: "Necklaces",
    price: 299,
    costPrice: 110,
    stock: 24,
    sizes: ["45cm"],
    image: "https://images.unsplash.com/photo-1611591477439-5103fc918f6f?auto=format&fit=crop&w=800&q=80",
    description: "Dainty medallion pendant featuring fine radiant engraving and a subtle crystal center. Ideal for elegant everyday layering.",
    material: "Stainless Steel with High Gloss Gold Tone & Cubic Zirconia",
    badge: "Trending",
    rating: 4.7,
    reviewsCount: 29
  },
  {
    id: "zy-jwl-05",
    sku: "ZY-JWL-05",
    barcode: "890100100005",
    title: "Serpentine Fluid Link Bracelet",
    category: "Jewellery",
    subCategory: "Bracelets",
    price: 279,
    costPrice: 98,
    stock: 19,
    sizes: ["Adjustable 16-20cm"],
    image: "https://images.unsplash.com/photo-1611591475878-fb8d9fbb34e9?auto=format&fit=crop&w=800&q=80",
    description: "An understated wrist piece with fluid gold links and an extender clasp. Designed for delicate, comfortable wrist movement.",
    material: "Hypoallergenic Alloy, PVD Gold Lustre",
    badge: "Classic",
    rating: 4.9,
    reviewsCount: 31
  },
  {
    id: "zy-jwl-06",
    sku: "ZY-JWL-06",
    barcode: "890100100006",
    title: "Verona Chunky Huggie Hoops",
    category: "Jewellery",
    subCategory: "Earrings",
    price: 229,
    costPrice: 80,
    stock: 40,
    sizes: ["14mm Inner Dia"],
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
    description: "Bold yet featherweight hollow huggies that clasp securely with a click. Your effortless go-to pair from morning to evening.",
    material: "Ultra-light Brass Core, 18K Polish",
    badge: "Everyday Pick",
    rating: 4.8,
    reviewsCount: 45
  },
  {
    id: "zy-jwl-07",
    sku: "ZY-JWL-07",
    barcode: "890100100007",
    title: "Starlight Micro-Pavé Solitaire Ring",
    category: "Jewellery",
    subCategory: "Rings",
    price: 179,
    costPrice: 65,
    stock: 32,
    sizes: ["Adjustable"],
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    description: "A delicate 1mm band featuring a singular brilliant micro-pavé zircon. Minimalist romance at its finest.",
    material: "Hypoallergenic Brass, 5A Cubic Zirconia",
    badge: "Under ₹200",
    rating: 4.9,
    reviewsCount: 22
  },

  // ==========================================
  // 2. GIRLS BRAS & BRALETTES
  // ==========================================
  {
    id: "zy-bra-01",
    sku: "ZY-BRA-01",
    barcode: "890100200001",
    title: "Cloud-Comfort Seamless Wirefree Bralette",
    category: "Bras",
    subCategory: "Seamless Bralette",
    price: 399,
    costPrice: 150,
    stock: 25,
    sizes: ["30B", "32B", "34B", "36B"],
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80",
    description: "Zero-wire, second-skin bralette made with Italian-style seamless micro-stretch fabric. Removable soft breathable pads and non-dig elastic straps.",
    material: "82% Polyamide, 18% Elastane, Honeycomb Lining",
    badge: "Zero Wire",
    rating: 5.0,
    reviewsCount: 64
  },
  {
    id: "zy-bra-02",
    sku: "ZY-BRA-02",
    barcode: "890100200002",
    title: "Everyday Featherlight T-Shirt Bra",
    category: "Bras",
    subCategory: "T-Shirt Bra",
    price: 349,
    costPrice: 135,
    stock: 30,
    sizes: ["32B", "34B", "36B", "34C"],
    image: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=800&q=80",
    description: "Ultra-smooth molded cups that disappear beneath fitted tees and kurtis. Gentle wirefree shape with anti-poke side boning.",
    material: "Breathable Microfibre & Ultra-soft Foam",
    badge: "Smooth Cups",
    rating: 4.8,
    reviewsCount: 47
  },
  {
    id: "zy-bra-03",
    sku: "ZY-BRA-03",
    barcode: "890100200003",
    title: "Pure Cotton Soft Lounge Bralette",
    category: "Bras",
    subCategory: "Cotton Bra",
    price: 289,
    costPrice: 105,
    stock: 34,
    sizes: ["S (30-32)", "M (32-34)", "L (34-36)"],
    image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=800&q=80",
    description: "100% combed organic cotton double-layer front with an elasticated underbust band. Free of synthetics, ideal for home wear and sleep.",
    material: "95% Organic Cotton, 5% Lycra",
    badge: "100% Cotton",
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: "zy-bra-04",
    sku: "ZY-BRA-04",
    barcode: "890100200004",
    title: "Anti-Slip Strapless Bandeau Bra",
    category: "Bras",
    subCategory: "Bandeau",
    price: 329,
    costPrice: 125,
    stock: 22,
    sizes: ["30B", "32B", "34B", "36B"],
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    description: "Non-slip silicone gripper lining along top and bottom edges keeps this bandeau firmly locked in place under off-shoulder and tube tops.",
    material: "Ice-Silk Lycra with Medical-Grade Silicone Grip",
    badge: "No-Slip",
    rating: 4.7,
    reviewsCount: 31
  },
  {
    id: "zy-bra-05",
    sku: "ZY-BRA-05",
    barcode: "890100200005",
    title: "Delicate Scalloped Lace Bralette",
    category: "Bras",
    subCategory: "Lace Bralette",
    price: 369,
    costPrice: 140,
    stock: 18,
    sizes: ["32B", "34B", "36B"],
    image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
    description: "Soft French floral eyelash lace with gentle triangle cups and adjustable criss-cross back straps. Elegant peak-through detailing.",
    material: "Ultra-soft Non-Itch Nylon Lace, Cotton Cup Lining",
    badge: "Delicate Lace",
    rating: 4.9,
    reviewsCount: 29
  },
  {
    id: "zy-bra-06",
    sku: "ZY-BRA-06",
    barcode: "890100200006",
    title: "Flexi-Fit Low Impact Sports Bra",
    category: "Bras",
    subCategory: "Sports Bra",
    price: 319,
    costPrice: 120,
    stock: 28,
    sizes: ["S (30-32)", "M (32-34)", "L (34-36)"],
    image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
    description: "Racerback sports bra with moisture-wicking quick-dry fabric. Gentle compression support for yoga, walking, and college routines.",
    material: "85% Polyester, 15% Spandex Quick-Dry Tech",
    badge: "Sweat-Wick",
    rating: 4.8,
    reviewsCount: 35
  },

  // ==========================================
  // 3. GIRLS UNDERWEAR & PANTIES
  // ==========================================
  {
    id: "zy-und-01",
    sku: "ZY-UND-01",
    barcode: "890100300001",
    title: "Silk-Touch Laser-Cut Seamless Briefs (Pack of 2)",
    category: "Underwear",
    subCategory: "Seamless Briefs",
    price: 299,
    costPrice: 110,
    stock: 40,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80",
    description: "Zero panty line guaranteed (No VPL). Bonded laser-cut edges with a 100% antibacterial pure cotton inner gusset for hygiene and ease.",
    material: "Ultra-fine Microfibre + 100% Organic Cotton Gusset",
    badge: "No VPL",
    rating: 4.9,
    reviewsCount: 52
  },
  {
    id: "zy-und-02",
    sku: "ZY-UND-02",
    barcode: "890100300002",
    title: "Pure Cotton Comfort Hipsters (Pack of 2)",
    category: "Underwear",
    subCategory: "Cotton Hipsters",
    price: 249,
    costPrice: 90,
    stock: 45,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
    description: "Long-staple combed cotton hipsters with soft micro-elastic waistbands that leave no marks on delicate skin.",
    material: "100% Combed Breathable Cotton",
    badge: "100% Cotton",
    rating: 4.9,
    reviewsCount: 48
  },
  {
    id: "zy-und-03",
    sku: "ZY-UND-03",
    barcode: "890100300003",
    title: "Ice-Silk Anti-Chafe Boyshorts",
    category: "Underwear",
    subCategory: "Boyshorts",
    price: 229,
    costPrice: 85,
    stock: 35,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    description: "Cooling ice-silk thigh-smoothing shorts. Prevents painful inner thigh friction under skirts, suits, and dresses.",
    material: "CoolMax Ice-Silk Fabric, Seamless Edges",
    badge: "Anti-Chafing",
    rating: 4.9,
    reviewsCount: 41
  },
  {
    id: "zy-und-04",
    sku: "ZY-UND-04",
    barcode: "890100300004",
    title: "Breathable Modal Low-Rise Bikini Briefs (Pack of 2)",
    category: "Underwear",
    subCategory: "Bikini Briefs",
    price: 259,
    costPrice: 95,
    stock: 30,
    sizes: ["S", "M", "L"],
    image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=800&q=80",
    description: "Cloud-soft beechwood modal fibre with smooth narrow sides. Breathable, hypoallergenic, and prevents sweat irritation.",
    material: "95% Micro-Modal, 5% Elastane",
    badge: "Ultra-Soft",
    rating: 4.8,
    reviewsCount: 26
  },
  {
    id: "zy-und-05",
    sku: "ZY-UND-05",
    barcode: "890100300005",
    title: "High-Waist Gentle Tummy Hug Briefs",
    category: "Underwear",
    subCategory: "High Waist Briefs",
    price: 279,
    costPrice: 100,
    stock: 26,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    description: "Full back coverage panty with a wide 3-inch ribbed waistband that provides gentle tummy smoothing without squeezing.",
    material: "Combed Cotton Blend, Double Gusset",
    badge: "Tummy Hug",
    rating: 4.7,
    reviewsCount: 33
  }
];

export const STORE_SETTINGS = {
  name: "ZOYARA",
  tagline: "Fashion & Comfort",
  address: "Shop 4, Luxury Arcade, Main Market, New Delhi - 110049",
  phone: "+91 98765 43210",
  whatsappNumber: "919876543210",
  email: "care@zoyara.in",
  gstin: "07AAAAZ0000A1Z5", // GSTIN for billing
  receiptFooter: "Thank you for shopping with ZOYARA. For hygiene standards, intimate wear cannot be returned once opened. Jewellery exchange within 7 days with tag.",
  thermalSize: "80mm", // '58mm' or '80mm'
  upiId: "zoyara.store@okaxis", // Dynamic UPI QR code ID
  taxRate: 3, // 3% composite GST for fashion jewellery & garments
  staffPin: "1234", // Staff portal access PIN
  
  // Payment Gateway (Razorpay)
  razorpayKeyId: "rzp_test_1DP5mmOlF5G5ag", // Official Razorpay test key / Configurable in Staff Settings
  razorpayEnabled: true,

  // Full Technical SEO Settings
  seoTitle: "ZOYARA — Fashion & Comfort | Anti-Tarnish Jewellery & Everyday Intimates",
  seoDescription: "ZOYARA — Fashion & Comfort. Curated 18K anti-tarnish waterproof jewellery, zero-wire bras, and seamless intimates crafted for everyday elegance.",
  seoKeywords: "zoyara, fashion and comfort, anti-tarnish jewellery, 18k jewellery, waterproof jewellery, wirefree bras, seamless underwear, affordable luxury jewellery india",
  seoRobots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  siteUrl: "https://zoyara.vercel.app",
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
      id: "store-delhi",
      name: "ZOYARA Flagship Boutique",
      address: "Shop 4, Luxury Arcade, Main Market, South Extension",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110049",
      phone: "+91 98765 43210",
      hours: "10:30 AM – 9:00 PM (All 7 Days)",
      mapsUrl: "https://maps.google.com/?q=South+Extension+New+Delhi"
    },
    {
      id: "store-mumbai",
      name: "ZOYARA Experience Studio",
      address: "G-12, Palladium Galleria, High Street Phoenix, Lower Parel",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400013",
      phone: "+91 98112 23344",
      hours: "11:00 AM – 9:30 PM",
      mapsUrl: "https://maps.google.com/?q=Lower+Parel+Mumbai"
    }
  ]
};
