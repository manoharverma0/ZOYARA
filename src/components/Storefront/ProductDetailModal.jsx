import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Sparkles, MessageCircle, ShoppingBag, Check } from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { STORE_SETTINGS } from "../../data/initialProducts";

export default function ProductDetailModal({ product, onClose, onAddToCart, isInCart }) {
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard"
  );

  // Close on ESC key
  useEffect(() => {
    if (!product) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [product, onClose]);

  if (!product) return null;

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello ZOYARA! ✨ I am interested in purchasing:\n\n*${product.title}*\nSKU: ${product.sku}\nSize: ${selectedSize}\nPrice: ${formatCurrency(product.price)}\n\nPlease let me know availability and delivery details.`
    );
    const whatsappNum = STORE_SETTINGS.whatsappNumber || "919876543210";
    window.open(`https://wa.me/${whatsappNum}?text=${text}`, "_blank");
  };

  const handleAddToCartWithSize = () => {
    onAddToCart({
      ...product,
      selectedSize
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#FAF8F5] w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-[#DFD5C6] flex flex-col md:flex-row relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-[#1A1A1E] shadow-sm transition-all cursor-pointer border border-[#E8E2D8]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Stage */}
        <div className="md:w-1/2 bg-[#F3EDE3] relative min-h-[280px] md:min-h-[420px] overflow-hidden flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover object-center"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-[#18181B] text-[#D4AF37] text-[10px] font-semibold tracking-widest uppercase rounded-full shadow-md">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#8C7E6C] uppercase tracking-widest mb-1">
              <span>{product.category} • {product.subCategory}</span>
              <span className="font-mono">{product.sku}</span>
            </div>

            <h2 className="font-serif text-2xl md:text-3xl text-[#1A1A1E] font-normal tracking-wide mb-2">
              {product.title}
            </h2>

            {/* Price & Perceived Value */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-semibold text-[#18181B]">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-[#A39686] line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              <span className="text-[11px] font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
                Atelier Price
              </span>
            </div>

            <p className="text-xs text-[#5E5245] leading-relaxed mb-4 font-sans">
              {product.description}
            </p>

            {/* Available Sizes Picker */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5 uppercase tracking-wider">
                  Select Size: <span className="font-mono font-bold text-[#8C6D3F]">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-[#18181B] text-white border-[#18181B] font-bold"
                          : "bg-white text-[#4A4036] border-[#DFD5C6] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Guarantee Badges */}
            <div className="space-y-2 p-3 bg-[#F4EFE6] rounded-xl border border-[#DFD5C6] mb-5">
              <div className="flex items-start gap-2 text-xs text-[#4A4036]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#1A1A1E]">Material Integrity</span>
                  <span className="text-[11px] text-[#6E6152]">{product.material}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#4A4036]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#1A1A1E]">Hypoallergenic & Skin-Safe</span>
                  <span className="text-[11px] text-[#6E6152]">Skin-safe finishes, allergy-tested for sensitive skin and all-day comfort.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleAddToCartWithSize}
              className="w-full py-3 px-4 bg-[#18181B] hover:bg-[#2B2B30] text-[#FAF8F5] rounded-xl font-medium text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>Added to Shopping Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add to Bag ({selectedSize}) • {formatCurrency(product.price)}</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsAppInquiry}
              className="w-full py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1B773A] border border-[#25D366]/30 rounded-xl font-medium text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Inquire / Order on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
