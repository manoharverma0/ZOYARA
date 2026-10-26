import React, { useState, useMemo } from "react";
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag, 
  Heart, 
  Check, 
  Feather, 
  Gem, 
  ArrowRight, 
  Star, 
  Gift, 
  Truck, 
  ChevronRight
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { sounds } from "../../utils/audio";

export default function Storefront({ 
  products, 
  onAddToCart, 
  onOpenProductDetail, 
  _cartItems,
  selectedCategory = "all",
  onSelectCategory = () => {},
  wishlistIds = [],
  onToggleWishlist = () => {},
  _onOpenInfo = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceFilter, setPriceFilter] = useState("all"); // 'all' | 'under200' | 'under300' | 'above300'
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const categories = [
    { id: "all", label: "All Collections", count: products.length },
    { id: "Jewellery", label: "Fine Jewellery", count: products.filter(p => p.category === "Jewellery").length },
    { id: "Bras", label: "Bras & Bralettes", count: products.filter(p => p.category === "Bras").length },
    { id: "Underwear", label: "Girls Underwear", count: products.filter(p => p.category === "Underwear").length },
    { id: "under250", label: "Under ₹250", count: products.filter(p => p.price <= 250).length },
    { id: "antiTarnish", label: "Anti-Tarnish", count: products.filter(p => p.badge?.includes("Anti-Tarnish") || p.material?.toLowerCase().includes("anti-tarnish") || p.material?.toLowerCase().includes("stainless")).length }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory === "Jewellery" && p.category !== "Jewellery") return false;
      if (selectedCategory === "Bras" && p.category !== "Bras") return false;
      if (selectedCategory === "Underwear" && p.category !== "Underwear") return false;
      if (selectedCategory === "under250" && p.price > 250) return false;
      if (selectedCategory === "antiTarnish" && (!p.badge?.includes("Anti-Tarnish") && !p.material?.toLowerCase().includes("anti-tarnish") && !p.material?.toLowerCase().includes("stainless"))) return false;

      // Subcategory filter
      if (subCategoryFilter !== "all" && p.subCategory !== subCategoryFilter) return false;

      // Price filter
      if (priceFilter === "under200" && p.price > 200) return false;
      if (priceFilter === "under300" && (p.price < 200 || p.price > 300)) return false;
      if (priceFilter === "above300" && p.price < 300) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.badge && p.badge.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "priceLow") return a.price - b.price;
      if (sortBy === "priceHigh") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0; // featured default
    });
  }, [products, selectedCategory, subCategoryFilter, priceFilter, searchQuery, sortBy]);

  const handleAddToCartWithAudio = (product, e) => {
    e.stopPropagation();
    try { sounds.playScanSuccess(); } catch {}
    onAddToCart({
      ...product,
      selectedSize: product.sizes?.[0] || "Free Size"
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F2EA] text-[#1B1A18] pb-16">
      
      {/* ========================================================
          1. EDITORIAL PHOTOGRAPHIC HERO SECTION
          ======================================================== */}
      <section className="relative overflow-hidden bg-[#18382D] text-[#FFFDFA] py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow & gradient overlay */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#B88D4E]/15 blur-3xl pointer-events-none -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-[#E7ECE4]/10 blur-3xl pointer-events-none -ml-28 -mb-28"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text & Campaign Callout (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDFA]/10 border border-[#E9D9BD]/20 text-[#E9D9BD] text-xs uppercase tracking-[0.22em] font-medium backdrop-blur-xs">
              <Gem className="w-3.5 h-3.5 text-[#B88D4E]" />
              <span>Quiet Luxury • Anti-Tarnish 18K Polish</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#FFFDFA] leading-[1.12]">
              Fine Jewellery &amp; Intimates, <br />
              <span className="italic font-serif text-[#E9D9BD]">Crafted for Everyday Grace.</span>
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-xs sm:text-sm text-[#E7ECE4] font-sans font-light leading-relaxed">
              Why should understated luxury cost thousands? <strong className="font-medium text-white">ZOYARA</strong> crafts vacuum 18K anti-tarnish waterproof jewellery, cloud-soft wireless bralettes, and seamless cotton-gusset intimates — accessible from ₹150 to ₹400.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  onSelectCategory("Jewellery");
                  document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 rounded-full bg-[#B88D4E] hover:bg-[#A37B3E] text-white text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                <span>Shop Fine Jewellery</span>
                <ArrowRight className="w-4 h-4 text-[#FFFDFA]" />
              </button>

              <button
                onClick={() => {
                  onSelectCategory("Bras");
                  document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FFFDFA] border border-[#E9D9BD]/30 text-xs uppercase tracking-widest font-medium transition-all cursor-pointer backdrop-blur-xs"
              >
                Zero-Wire Bralettes
              </button>
            </div>

            {/* Micro guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#E9D9BD]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B88D4E]" />
                <span>100% Water Resistant</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Feather className="w-4 h-4 text-[#B88D4E]" />
                <span>No-Poke Wirefree Bras</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#B88D4E]" />
                <span>Complimentary Gift Box</span>
              </div>
            </div>
          </div>

          {/* Right Featured Editorial Visual (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border border-[#E9D9BD]/20 shadow-2xl bg-[#10261E]">
              <img
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
                alt="ZOYARA Fine Jewellery Editorial"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10261E] via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-[#18382D]/85 backdrop-blur-md border border-[#E9D9BD]/30 text-white">
                <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-[#B88D4E]">
                  <span>Featured Atelier Creation</span>
                  <span>₹249</span>
                </div>
                <h4 className="font-serif text-base font-normal mt-0.5 text-white">
                  Aura Baroque Pearl Drop Hoops
                </h4>
                <p className="text-[11px] text-[#E7ECE4] mt-0.5">
                  18K PVD Anti-Tarnish Finish with Freshwater Baroque Pearl
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. SHOP-BY-CATEGORY VISUAL TILES
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-1 mb-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B88D4E]">
            Curated Boutiques
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#18382D] font-normal">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {[
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
          ].map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group cursor-pointer rounded-2xl overflow-hidden border p-3 flex flex-col justify-between transition-all duration-300 relative ${
                  isSelected 
                    ? "bg-[#18382D] text-[#FFFDFA] border-[#18382D] shadow-md" 
                    : "bg-[#FFFDFA] text-[#1B1A18] border-[#E6DCCF] hover:border-[#B88D4E] hover:shadow-xs"
                }`}
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[#F7F2EA] relative">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-xs ${
                    isSelected ? "bg-white text-[#18382D]" : "bg-[#18382D] text-[#B88D4E]"
                  }`}>
                    {cat.priceTag}
                  </span>
                </div>
                <div>
                  <h3 className={`font-serif text-sm font-medium ${isSelected ? "text-white" : "text-[#18382D]"}`}>
                    {cat.title}
                  </h3>
                  <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-[#E9D9BD]" : "text-[#746B62]"}`}>
                    {cat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          3. ANTI-TARNISH CAMPAIGN SPOTLIGHT BANNER
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="rounded-3xl bg-[#18382D] text-white p-6 sm:p-10 lg:p-12 border border-[#E9D9BD]/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="space-y-4 max-w-lg z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E9D9BD] text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#B88D4E]" />
              <span>Vacuum PVD Science</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-4xl font-light leading-snug">
              Say Goodbye to Green Skin &amp; Tarnished Chains.
            </h3>
            <p className="text-xs sm:text-sm text-[#E7ECE4] leading-relaxed">
              Every ZOYARA jewellery piece is finished with an advanced 18K vacuum gold dip over hypoallergenic stainless steel. Wear it to college, in the shower, or through intense summer days without discoloration.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  onSelectCategory("antiTarnish");
                  document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-2.5 bg-[#B88D4E] hover:bg-[#A37B3E] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>View Anti-Tarnish Edit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full md:w-80 aspect-[4/3] rounded-2xl overflow-hidden border border-[#E9D9BD]/20 shadow-xl shrink-0 z-10">
            <img
              src="https://images.unsplash.com/photo-1611591477439-5103fc918f6f?auto=format&fit=crop&w=800&q=80"
              alt="Anti-Tarnish Medallion"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          4. MAIN PRODUCT CATALOGUE & REUSABLE COLLECTION TEMPLATE
          ======================================================== */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Collection Title & Breadcrumb Navigation */}
        <div className="pb-6 border-b border-[#E6DCCF]">
          <div className="flex items-center gap-1.5 text-xs text-[#746B62] mb-1.5">
            <button onClick={() => onSelectCategory("all")} className="hover:text-[#18382D] cursor-pointer">Home</button>
            <span>/</span>
            <span className="text-[#18382D] font-medium">
              {categories.find(c => c.id === selectedCategory)?.label || "Collection"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#18382D] font-normal">
                {selectedCategory === "all" ? "The Atelier Collection" : categories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-xs text-[#746B62] mt-1">
                Showing {filteredProducts.length} curated creations crafted for lasting beauty and ease.
              </p>
            </div>

            {/* Quick Sorting dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#746B62]">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg px-3 py-1.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#18382D] cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Patron Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar (Category chips, Subcategory filters, Price tier buttons) */}
        <div className="py-4 space-y-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setSubCategoryFilter("all");
                  }}
                  className={`px-4 py-2 rounded-full text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#18382D] text-white font-semibold shadow-xs"
                      : "bg-[#FFFDFA] hover:bg-[#F7F2EA] text-[#746B62] border border-[#E6DCCF]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#F7F2EA] text-[#746B62]"
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Subcategory & Price Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            
            {/* Price Tier Filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#746B62] text-[11px] font-semibold uppercase tracking-wider mr-1">Price:</span>
              {[
                { id: "all", label: "All Prices" },
                { id: "under200", label: "Under ₹200" },
                { id: "under300", label: "₹200 - ₹300" },
                { id: "above300", label: "Above ₹300" }
              ].map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setPriceFilter(tier.id)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                    priceFilter === tier.id
                      ? "bg-[#18382D] text-white font-medium"
                      : "bg-white text-[#746B62] hover:bg-[#F7F2EA] border border-[#E6DCCF]"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            {/* Live Search Within Collection */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#746B62] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter this category..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#E6DCCF] rounded-full focus:outline-none focus:border-[#18382D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            RESPONSIVE PRODUCT GRID
            ======================================================== */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-[#746B62] bg-white rounded-2xl border border-[#E6DCCF] my-6">
            <div className="w-12 h-12 rounded-full bg-[#F7F2EA] flex items-center justify-center mx-auto mb-3 text-[#B88D4E]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-[#18382D] mb-1">No products found</h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              Try adjusting your search query, price filter, or selected collection.
            </p>
            <button
              onClick={() => {
                onSelectCategory("all");
                setPriceFilter("all");
                setSearchQuery("");
              }}
              className="px-5 py-2 bg-[#18382D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#234E3F] transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
            {filteredProducts.map(product => {
              const isWishlisted = wishlistIds.includes(product.id);
              const originalPrice = product.originalPrice || Math.round(product.price * 1.6);
              const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

              return (
                <div
                  key={product.id}
                  onClick={() => onOpenProductDetail(product)}
                  className="group bg-[#FFFDFA] rounded-2xl overflow-hidden border border-[#E6DCCF] hover:border-[#B88D4E] transition-all duration-300 flex flex-col justify-between hover:shadow-sm cursor-pointer relative"
                >
                  {/* Image Container with Badges & Wishlist Trigger */}
                  <div className="aspect-square w-full bg-[#F7F2EA] relative overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#18382D] text-[#B88D4E] text-[9px] font-semibold tracking-wider uppercase rounded-full shadow-2xs">
                        {product.badge}
                      </span>
                    )}

                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-[#18382D] shadow-2xs transition-transform active:scale-90 cursor-pointer"
                      title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-[#18382D] text-[#18382D]" : "text-[#746B62]"}`} />
                    </button>

                    {/* Quick Add Overlay on Hover */}
                    <div className="absolute inset-x-2 bottom-2 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCartWithAudio(product, e)}
                        className="w-full py-2 bg-[#18382D]/95 hover:bg-[#18382D] text-white rounded-xl text-[11px] font-semibold tracking-wider uppercase backdrop-blur-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#B88D4E]" />
                        <span>Quick Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#746B62] uppercase tracking-wider mb-1 font-mono">
                        <span>{product.category}</span>
                        {product.rating && (
                          <span className="flex items-center text-[#B88D4E]">
                            <Star className="w-3 h-3 fill-current mr-0.5" />
                            {product.rating}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-sm sm:text-base font-normal text-[#1B1A18] line-clamp-1 group-hover:text-[#B88D4E] transition-colors leading-snug">
                        {product.title}
                      </h3>

                      <p className="text-[11px] text-[#746B62] line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    </div>

                    {/* Price row */}
                    <div className="pt-3 mt-2 border-t border-[#F7F2EA] flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-mono text-sm sm:text-base font-bold text-[#18382D]">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="font-mono text-[11px] text-[#746B62] line-through">
                          {formatCurrency(originalPrice)}
                        </span>
                        {discountPercent > 0 && (
                          <span className="text-[10px] font-semibold text-[#18382D] bg-[#F7F2EA] px-1.5 py-0.5 rounded">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Mobile Quick Add Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCartWithAudio(product, e)}
                        className="sm:hidden p-1.5 rounded-lg bg-[#18382D] text-white hover:bg-[#234E3F] transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#B88D4E]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          5. GIFT EDIT & PACKAGING SECTION
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-[#FFFDFA] rounded-3xl border border-[#E6DCCF] p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xs">
          <div className="space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B88D4E]">
              Complimentary Atelier Gift Packaging
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#18382D] font-light leading-tight">
              Unwrapping Elegance, <br />
              <span className="italic font-serif text-[#B88D4E]">Every Single Order.</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#746B62] leading-relaxed">
              Whether you are treating yourself or surprising a cherished friend, every ZOYARA order arrives nestled inside our bespoke forest-green and ivory gift box, adorned with a satin ribbon and custom velvet storage pouch.
            </p>
            <div className="pt-2 flex items-center gap-6 text-xs text-[#18382D] font-medium">
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#B88D4E]" />
                <span>No Extra Fee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Eco-Friendly Ribbons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B88D4E]" />
                <span>Velvet Protection</span>
              </div>
            </div>
          </div>

          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E6DCCF] shadow-sm bg-[#F7F2EA]">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"
              alt="Luxury Gift Box Packaging"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          6. BRAND PILLARS (THE ZOYARA PROMISE)
          ======================================================== */}
      <section className="bg-[#E7ECE4]/50 border-y border-[#E6DCCF] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mb-3 shadow-xs">
              <Gem className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-sm font-semibold text-[#18382D]">18K Anti-Tarnish Finish</h4>
            <p className="text-[11px] text-[#746B62] mt-1">Waterproof vacuum PVD plated jewellery made for daily wear.</p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mb-3 shadow-xs">
              <Feather className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-sm font-semibold text-[#18382D]">Zero-Wire Wireless Bras</h4>
            <p className="text-[11px] text-[#746B62] mt-1">Second-skin micro-stretch fabric with no-dig, no-pinch comfort.</p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mb-3 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-serif text-sm font-semibold text-[#18382D]">Pure Combed Cotton</h4>
            <p className="text-[11px] text-[#746B62] mt-1">Double-layer hygienic organic gussets for breathable ease.</p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mb-3 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-sm font-semibold text-[#18382D]">Express Pan-India Delivery</h4>
            <p className="text-[11px] text-[#746B62] mt-1">Fast 2-4 day delivery with complimentary shipping above ₹499.</p>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. PATRON REVIEWS & SOCIAL PROOF
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-1 mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B88D4E]">
            Patron Reflections
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#18382D] font-normal">
            Loved Across India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Ananya V.",
              city: "New Delhi",
              rating: 5,
              review: "I wore the Solstice Liquid Herringbone choker in the shower and gym for two straight weeks — zero fading, zero green marks! Unbelievable quality for ₹349.",
              item: "Solstice Liquid Herringbone Choker"
            },
            {
              name: "Pooja S.",
              city: "Mumbai",
              rating: 5,
              review: "The Cloud-Comfort wirefree bralette feels like you're wearing absolutely nothing. Disappears under kurtis and doesn't pinch or squeeze anywhere.",
              item: "Cloud-Comfort Seamless Bralette"
            },
            {
              name: "Simran K.",
              city: "Chandigarh",
              rating: 5,
              review: "The packaging alone looked like a ₹2000 purchase from a luxury designer. The croissant ring is so comfortable and fits perfectly because it is gently adjustable.",
              item: "Elysian Croissant Twisted Ring"
            }
          ].map((rev, idx) => (
            <div key={idx} className="p-6 bg-[#FFFDFA] rounded-2xl border border-[#E6DCCF] space-y-3 shadow-2xs">
              <div className="flex items-center text-[#B88D4E]">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#746B62] leading-relaxed italic font-serif">
                "{rev.review}"
              </p>
              <div className="pt-2 border-t border-[#F7F2EA] flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#18382D] block">{rev.name}</span>
                  <span className="text-[11px] text-[#746B62]">{rev.city} • Verified Patron</span>
                </div>
                <span className="text-[10px] text-[#B88D4E] font-medium">{rev.item}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          8. NEWSLETTER & EXCLUSIVE PRIVILEGE
          ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="rounded-3xl bg-[#18382D] text-white p-8 sm:p-10 text-center space-y-4 border border-[#E9D9BD]/20 shadow-md">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B88D4E]">
            Join the Atelier Circle
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-light">
            Receive 10% Off Your Inaugural Order
          </h3>
          <p className="text-xs text-[#E7ECE4] max-w-md mx-auto leading-relaxed">
            Be the first to discover new anti-tarnish drops, private showroom events, and intimate care secrets.
          </p>

          {newsletterSubmitted ? (
            <div className="p-4 bg-white/10 rounded-2xl max-w-md mx-auto border border-[#B88D4E] text-xs space-y-1">
              <div className="font-semibold text-[#E9D9BD]">Welcome to ZOYARA! 🎉</div>
              <div>Use promo code <strong className="font-mono text-white text-sm bg-[#B88D4E] px-2 py-0.5 rounded">WELCOME10</strong> at checkout for 10% off.</div>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2.5 rounded-full bg-white text-[#1B1A18] text-xs focus:outline-none placeholder-[#746B62]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#B88D4E] hover:bg-[#A37B3E] text-white text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Join Circle
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
