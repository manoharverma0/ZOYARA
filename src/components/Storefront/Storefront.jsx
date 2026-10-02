import React, { useState, useMemo } from "react";
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag, 
  Eye, 
  Check, 
  Feather, 
  Gem, 
  Layers 
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { sounds } from "../../utils/audio";

export default function Storefront({ 
  products, 
  onAddToCart, 
  onOpenProductDetail, 
  cartItems,
  selectedCategory = "all",
  onSelectCategory = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const categories = [
    { id: "all", label: "All Collections" },
    { id: "Jewellery", label: "Fine Jewellery" },
    { id: "Bras", label: "Bras & Bralettes" },
    { id: "Underwear", label: "Girls Underwear" },
    { id: "under250", label: "Under ₹250" },
    { id: "antiTarnish", label: "Anti-Tarnish" }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter strictly for Jewellery, Bras, and Underwear
      if (selectedCategory === "Jewellery" && p.category !== "Jewellery") return false;
      if (selectedCategory === "Bras" && p.category !== "Bras") return false;
      if (selectedCategory === "Underwear" && p.category !== "Underwear") return false;
      if (selectedCategory === "under250" && p.price > 250) return false;
      if (selectedCategory === "antiTarnish" && (!p.badge?.includes("Anti-Tarnish") && !p.material?.toLowerCase().includes("anti-tarnish") && !p.material?.toLowerCase().includes("stainless"))) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "priceLow") return a.price - b.price;
      if (sortBy === "priceHigh") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0; // featured default
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleAddToCartWithAudio = (product) => {
    sounds.playScanSuccess();
    onAddToCart(product);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      
      {/* Editorial Luxury Hero Banner */}
      <section className="relative overflow-hidden bg-[#F3EDE3] border-b border-[#DFD5C6] py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#EADDC9]/50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#E4D5BE]/60 blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F5]/90 border border-[#DDD2C2] text-[#8C6D3F] text-xs uppercase tracking-[0.22em] font-medium mb-6 shadow-2xs backdrop-blur-xs">
            <Gem className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Anti-Tarnish Jewellery &amp; Everyday Intimates</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#1A1A1E] leading-[1.18] mb-5">
            Intimates &amp; Fine Jewellery, <br className="hidden sm:inline" />
            <span className="italic font-serif text-[#786144]">Crafted for Everyday Elegance</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#6E6152] font-sans font-light leading-relaxed mb-8">
            Why should everyday luxury cost thousands? <strong className="font-medium text-[#1A1A1E]">ZOYARA</strong> bridges the gap with 18K anti-tarnish waterproof jewellery, cloud-soft wireless bras, and laser-cut seamless underwear for girls and women.
          </p>

          {/* Clean Hero Quick Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium">
            <button
              onClick={() => onSelectCategory("Jewellery")}
              className={`px-5 py-2.5 rounded-full uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                selectedCategory === "Jewellery"
                  ? "bg-[#18181B] text-white shadow-xs font-semibold"
                  : "bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#18181B] border border-[#DDD2C2] hover:border-[#18181B]"
              }`}
            >
              Fine Jewellery
            </button>
            <button
              onClick={() => onSelectCategory("Bras")}
              className={`px-5 py-2.5 rounded-full uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                selectedCategory === "Bras"
                  ? "bg-[#18181B] text-white shadow-xs font-semibold"
                  : "bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#18181B] border border-[#DDD2C2] hover:border-[#18181B]"
              }`}
            >
              Bras &amp; Bralettes
            </button>
            <button
              onClick={() => onSelectCategory("Underwear")}
              className={`px-5 py-2.5 rounded-full uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                selectedCategory === "Underwear"
                  ? "bg-[#18181B] text-white shadow-xs font-semibold"
                  : "bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#18181B] border border-[#DDD2C2] hover:border-[#18181B]"
              }`}
            >
              Girls Underwear
            </button>
            <button
              onClick={() => onSelectCategory("antiTarnish")}
              className={`px-5 py-2.5 rounded-full uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                selectedCategory === "antiTarnish"
                  ? "bg-[#18181B] text-white shadow-xs font-semibold"
                  : "bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#18181B] border border-[#DDD2C2] hover:border-[#18181B]"
              }`}
            >
              Anti-Tarnish
            </button>
          </div>
        </div>
      </section>

      {/* Brand Pillar Highlights - Clean, Balanced Layout */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F3EDE3]/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D8] shadow-2xs flex items-center justify-center mb-2.5 text-[#8C6D3F]">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <h4 className="font-serif text-sm font-medium text-[#1A1A1E]">18K Anti-Tarnish Finish</h4>
            <p className="text-[11px] text-[#7A6D5E] mt-0.5">Waterproof vacuum PVD plated jewellery</p>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F3EDE3]/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D8] shadow-2xs flex items-center justify-center mb-2.5 text-[#8C6D3F]">
              <Feather className="w-4 h-4 text-[#8C6D3F]" />
            </div>
            <h4 className="font-serif text-sm font-medium text-[#1A1A1E]">Zero-Wire Bralettes</h4>
            <p className="text-[11px] text-[#7A6D5E] mt-0.5">Second-skin comfort with no-dig straps</p>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F3EDE3]/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D8] shadow-2xs flex items-center justify-center mb-2.5 text-[#8C6D3F]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="font-serif text-sm font-medium text-[#1A1A1E]">Pure Cotton Gussets</h4>
            <p className="text-[11px] text-[#7A6D5E] mt-0.5">100% breathable organic inner lining</p>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F3EDE3]/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D8] shadow-2xs flex items-center justify-center mb-2.5 text-[#8C6D3F]">
              <Layers className="w-4 h-4 text-[#8C6D3F]" />
            </div>
            <h4 className="font-serif text-sm font-medium text-[#1A1A1E]">Accessible Luxury Pricing</h4>
            <p className="text-[11px] text-[#7A6D5E] mt-0.5">Premium quality, crafted for everyday wear</p>
          </div>
        </div>
      </section>

      {/* Main Product Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
        
        {/* Category Pill Filters & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-[#18181B] text-[#FAF8F5] font-medium shadow-xs"
                      : "bg-[#EFE9DF]/80 text-[#6B5E4F] hover:bg-[#E5DDCF] border border-[#DDD2C2]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#8C7E6C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search earrings, bras, panties..."
                className="w-full pl-9 pr-7 py-2 text-xs bg-white border border-[#DFD5C6] rounded-full focus:outline-none focus:border-[#18181B] transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white border border-[#DFD5C6] rounded-full px-3 py-2 text-[#4A4036] focus:outline-none focus:border-[#18181B] cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Active Filter Bar */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8C7E6C]">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-[#18181B] font-semibold">{filteredProducts.length}</strong> creations</span>
            {selectedCategory !== "all" && (
              <button 
                onClick={() => onSelectCategory("all")}
                className="text-[11px] text-[#8C6D3F] hover:underline cursor-pointer ml-1"
              >
                (View All)
              </button>
            )}
          </div>
          {filteredProducts.length > 0 && (
            <span className="font-mono text-[11px]">
              Price range: {formatCurrency(Math.min(...filteredProducts.map(p => p.price)))} — {formatCurrency(Math.max(...filteredProducts.map(p => p.price)))}
            </span>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-[#8C7E6C]">
            <p className="font-serif text-xl text-[#1A1A1E] mb-2">No creations matched your criteria</p>
            <p className="text-xs">Try resetting the filter or searching for another term.</p>
            <button
              onClick={() => { onSelectCategory("all"); setSearchQuery(""); }}
              className="mt-4 px-4 py-2 text-xs bg-[#18181B] text-white rounded-full cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {filteredProducts.map(product => {
              const inCart = cartItems.some(i => i.id === product.id);

              return (
                <div 
                  key={product.id}
                  className="group flex flex-col justify-between bg-white rounded-2xl overflow-hidden border border-[#E8E2D8] hover:border-[#C5A880] transition-all hover:shadow-lg"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-[4/5] bg-[#F3EDE3] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-[#18181B]/90 backdrop-blur-xs text-[#D4AF37] text-[9px] font-semibold tracking-widest uppercase rounded-full">
                        {product.badge}
                      </span>
                    )}

                    {/* Hover Quick Action Layer */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        onClick={() => onOpenProductDetail(product)}
                        className="p-2.5 bg-white rounded-full text-[#1A1A1E] shadow-md hover:bg-[#FAF8F5] transition-transform hover:scale-110 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddToCartWithAudio(product)}
                        className="p-2.5 bg-[#18181B] rounded-full text-[#FAF8F5] shadow-md hover:bg-[#2B2B30] transition-transform hover:scale-110 cursor-pointer"
                        title="Add to Shopping Bag"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#8C7E6C] uppercase tracking-wider mb-1 font-mono">
                        <span>{product.category}</span>
                      </div>

                      <h3 
                        onClick={() => onOpenProductDetail(product)}
                        className="font-serif text-base text-[#1A1A1E] font-medium hover:text-[#8C6D3F] transition-colors line-clamp-1 cursor-pointer mb-1"
                      >
                        {product.title}
                      </h3>

                      <p className="text-[11px] text-[#7A6D5E] line-clamp-2 mb-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Sizes indicator */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.sizes.map(s => (
                            <span key={s} className="px-1.5 py-0.5 text-[9px] font-mono bg-[#FAF8F5] text-[#5A5044] border border-[#DDD2C2] rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price and Cart Action */}
                    <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-semibold text-[#18181B]">
                            {formatCurrency(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[11px] text-[#A89C8E] line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCartWithAudio(product)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          inCart
                            ? "bg-[#EFE9DF] text-[#5E5245] border border-[#DDD2C2]"
                            : "bg-[#18181B] text-[#FAF8F5] hover:bg-[#2B2B30]"
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
