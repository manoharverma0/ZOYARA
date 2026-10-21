import React from "react";
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { formatCurrency } from "../../utils/barcode";

export default function WishlistModal({ 
  isOpen, 
  onClose, 
  wishlistIds, 
  products, 
  onAddToCart, 
  onToggleWishlist,
  onOpenProductDetail 
}) {
  if (!isOpen) return null;

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#121214]/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E6DCCF] flex flex-col my-auto max-h-[90vh] overflow-hidden relative text-[#1B1A18]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#F7F2EA] border-b border-[#E6DCCF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-[#18382D]">
                Your Saved Wishlist
              </h3>
              <p className="text-xs text-[#746B62]">
                {wishlistProducts.length} cherished pieces
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E6DCCF] text-[#746B62] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="py-12 text-center text-[#746B62]">
              <div className="w-12 h-12 rounded-full bg-[#F7F2EA] border border-[#E6DCCF] flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-[#B88D4E]" />
              </div>
              <p className="font-serif text-lg text-[#1B1A18] mb-1">Your wishlist is empty</p>
              <p className="text-xs max-w-xs mx-auto mb-4">
                Click the heart icon on any piece to save it to your personal wishlist for later.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#18382D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#234E3F] transition-all cursor-pointer"
              >
                Explore Catalogue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlistProducts.map(product => (
                <div 
                  key={product.id}
                  className="p-3 bg-white rounded-xl border border-[#E6DCCF] flex gap-3 relative group hover:shadow-sm transition-all"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    onClick={() => { onOpenProductDetail(product); onClose(); }}
                    className="w-20 h-20 object-cover rounded-lg bg-[#F7F2EA] border border-[#E6DCCF] shrink-0 cursor-pointer"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 
                        onClick={() => { onOpenProductDetail(product); onClose(); }}
                        className="text-xs font-medium text-[#1B1A18] truncate cursor-pointer hover:text-[#B88D4E]"
                      >
                        {product.title}
                      </h4>
                      <div className="text-[11px] font-mono font-bold text-[#18382D] mt-0.5">
                        {formatCurrency(product.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => onAddToCart(product)}
                        className="px-3 py-1 bg-[#18382D] hover:bg-[#234E3F] text-white text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3 text-[#B88D4E]" />
                        <span>Add to Bag</span>
                      </button>

                      <button
                        onClick={() => onToggleWishlist(product.id)}
                        className="p-1 text-[#746B62] hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
