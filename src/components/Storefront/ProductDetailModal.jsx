import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  MapPin
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  isInCart,
  isInWishlist,
  onToggleWishlist,
  allProducts = [],
  onSelectProduct
}) {
  const [selectedSize, setSelectedSize] = useState(() => 
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard"
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'care' | 'shipping'

  // ESC key listener
  useEffect(() => {
    if (!product) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [product, onClose]);

  if (!product) return null;

  const originalPrice = product.originalPrice || Math.round(product.price * 1.6);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setPincodeStatus({ success: false, message: "Please enter a valid 6-digit Indian PIN code." });
      return;
    }
    setPincodeStatus({
      success: true,
      message: `Delivery available to ${pincode}! Estimated delivery in 2-3 business days. Free shipping on orders above ₹499.`
    });
  };

  const handleAdd = () => {
    onAddToCart({
      ...product,
      selectedSize,
      quantity
    });
  };

  const handleInstantBuy = () => {
    onBuyNow({
      ...product,
      selectedSize,
      quantity
    });
  };

  const relatedItems = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.badge === product.badge))
    .slice(0, 3);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#121214]/65 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#E6DCCF] flex flex-col md:flex-row relative my-auto max-h-[92vh] text-[#1B1A18]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-[#1B1A18] shadow-sm transition-all cursor-pointer border border-[#E6DCCF]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Product Visual Studio (50%) */}
        <div className="md:w-1/2 bg-[#F7F2EA] relative flex flex-col justify-between p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[#E6DCCF]">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#E6DCCF] shadow-sm flex items-center justify-center group">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-[#18382D] text-[#B88D4E] text-[10px] font-semibold tracking-widest uppercase rounded-full shadow-xs">
                {product.badge}
              </span>
            )}
            
            {/* Wishlist toggle on image */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#18382D] shadow-xs transition-transform active:scale-90 cursor-pointer"
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? "fill-[#18382D] text-[#18382D]" : "text-[#746B62]"}`} />
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-[#746B62]">
            <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#E6DCCF]">
              <Sparkles className="w-3.5 h-3.5 text-[#B88D4E] shrink-0" />
              <span>Anti-Tarnish 18K Polish</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#E6DCCF]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Hypoallergenic Core</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Specifications & Actions (50%) */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-[11px] text-[#746B62] uppercase tracking-widest">
              <span>{product.category} • {product.subCategory || "Atelier Selection"}</span>
              <span className="font-mono">{product.sku}</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#18382D] leading-tight">
              {product.title}
            </h2>

            {/* Price & Perceived Savings */}
            <div className="flex items-baseline gap-3 pb-2 border-b border-[#F7F2EA]">
              <span className="font-mono text-2xl font-bold text-[#18382D]">
                {formatCurrency(product.price)}
              </span>
              <span className="font-mono text-sm text-[#746B62] line-through">
                {formatCurrency(originalPrice)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-[#E7ECE4] px-2 py-0.5 rounded">
                Save {discountPercent}%
              </span>
            </div>

            {/* Product Description */}
            <p className="text-xs text-[#746B62] leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Size Picker */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#18382D] uppercase tracking-wider text-[11px]">
                    Select Size: <strong className="font-mono text-[#B88D4E]">{selectedSize}</strong>
                  </span>
                  <span className="text-[#746B62] text-[11px] font-mono">
                    Stock: {product.stock || 25} available
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-[#18382D] text-white shadow-xs"
                          : "bg-white hover:bg-[#F7F2EA] text-[#1B1A18] border border-[#E6DCCF]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#746B62]">Quantity:</span>
              <div className="flex items-center border border-[#E6DCCF] rounded-lg bg-white overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-[#746B62] hover:bg-[#F7F2EA] cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1 font-mono font-semibold text-[#18382D]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-[#746B62] hover:bg-[#F7F2EA] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Bag & Buy Now with 1-Click */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className="py-3 px-4 bg-[#FFFDFA] hover:bg-[#F7F2EA] text-[#18382D] border-2 border-[#18382D] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-[#B88D4E]" />
                <span>{isInCart ? "Added in Bag (+1)" : "Add to Bag"}</span>
              </button>

              <button
                type="button"
                onClick={handleInstantBuy}
                className="py-3 px-4 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#B88D4E]" />
                <span>Buy Now (1-Click)</span>
              </button>
            </div>

            {/* PIN Code Delivery Estimator */}
            <div className="pt-2">
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="flex-1 flex items-center bg-white border border-[#E6DCCF] rounded-lg px-2.5 py-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#746B62] mr-1.5 shrink-0" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit delivery PIN"
                    className="w-full text-xs font-mono bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#F7F2EA] hover:bg-[#E6DCCF] text-[#18382D] text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#E6DCCF]"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className={`text-[11px] mt-1.5 ${pincodeStatus.success ? "text-emerald-700" : "text-red-600"}`}>
                  {pincodeStatus.message}
                </p>
              )}
            </div>

            {/* Material & Hygiene Details Tabs */}
            <div className="pt-3 border-t border-[#F7F2EA] text-xs space-y-2">
              <div className="flex border-b border-[#E6DCCF] text-[11px] font-semibold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-1.5 mr-4 border-b-2 cursor-pointer ${
                    activeTab === "details" ? "border-[#18382D] text-[#18382D]" : "border-transparent text-[#746B62]"
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab("care")}
                  className={`pb-1.5 mr-4 border-b-2 cursor-pointer ${
                    activeTab === "care" ? "border-[#18382D] text-[#18382D]" : "border-transparent text-[#746B62]"
                  }`}
                >
                  Care &amp; Polish
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-1.5 border-b-2 cursor-pointer ${
                    activeTab === "shipping" ? "border-[#18382D] text-[#18382D]" : "border-transparent text-[#746B62]"
                  }`}
                >
                  Delivery &amp; Exchange
                </button>
              </div>

              {activeTab === "details" && (
                <div className="space-y-1 text-[#746B62] text-[11px] leading-relaxed pt-1">
                  <div>• Material: <strong className="text-[#1B1A18]">{product.material || "18K Plated Stainless Steel / Hypoallergenic Alloy"}</strong></div>
                  <div>• Finish: Vacuum PVD Anti-Tarnish Coating</div>
                  <div>• Packaging: Complimentary ZOYARA gift box with velvet pouch</div>
                </div>
              )}

              {activeTab === "care" && (
                <div className="space-y-1 text-[#746B62] text-[11px] leading-relaxed pt-1">
                  <div>• Water &amp; Shower friendly under normal daily wear.</div>
                  <div>• Avoid spraying alcohol-based perfume directly on the pieces.</div>
                  <div>• Store in the provided individual airtight pouch after gentle wipe.</div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-1 text-[#746B62] text-[11px] leading-relaxed pt-1">
                  <div>• Shipped via Bluedart / Delhivery / Xpressbees within 24h.</div>
                  <div>• Jewellery exchange allowed within 7 days with barcode intact.</div>
                  <div>• Underwear &amp; intimate pieces non-returnable once opened for hygiene standards.</div>
                </div>
              )}
            </div>

            {/* Related Pieces */}
            {relatedItems.length > 0 && (
              <div className="pt-3 border-t border-[#F7F2EA]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#746B62] block mb-2">
                  Complete the Ensemble
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {relatedItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onSelectProduct(item)}
                      className="p-1.5 bg-[#F7F2EA]/60 rounded-lg border border-[#E6DCCF] cursor-pointer hover:bg-[#F7F2EA] transition-colors"
                    >
                      <img src={item.image} alt={item.title} className="w-full h-12 object-cover rounded bg-white mb-1" />
                      <div className="text-[10px] truncate font-medium text-[#1B1A18]">{item.title}</div>
                      <div className="text-[10px] font-mono text-[#18382D] font-semibold">{formatCurrency(item.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
