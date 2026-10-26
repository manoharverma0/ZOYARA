import React from "react";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle, 
  Gift, 
  ArrowRight, 
  Lock, 
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { STORE_SETTINGS } from "../../data/initialProducts";

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  _onClearCart,
  onProceedCheckout 
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleSendWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    const itemsSummary = cartItems
      .map((item, idx) => `${idx + 1}. *${item.title}* (${item.selectedSize || "Standard"}) - Qty: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`)
      .join("\n");

    const message = encodeURIComponent(
      `*NEW ONLINE ORDER — ZOYARA ATELIER & BOUTIQUE* ✨\n\n` +
      `*Ordered Items:*\n${itemsSummary}\n\n` +
      `*Subtotal:* ${formatCurrency(subtotal)}\n` +
      `*Delivery:* ${subtotal >= freeShippingThreshold ? "FREE EXPRESS" : "Standard ₹49"}\n\n` +
      `Please confirm stock availability and share payment QR / bank details.`
    );

    const whatsappNum = STORE_SETTINGS.whatsappNumber || "919876543210";
    window.open(`https://wa.me/${whatsappNum}?text=${message}`, "_blank");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-[#121214]/65 backdrop-blur-xs transition-opacity animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-[#E6DCCF] relative text-[#1B1A18]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E6DCCF] flex items-center justify-between bg-[#F7F2EA]">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif text-2xl text-[#18382D] font-normal tracking-wide">
              Your Shopping Bag
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#18382D] text-[#FFFDFA] font-medium font-mono">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E6DCCF] text-[#746B62] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-3 bg-[#E7ECE4] border-b border-[#C2D4BE] text-xs">
          <div className="flex items-center justify-between mb-1.5 text-[#18382D]">
            <span className="font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B88D4E]" />
              {subtotal >= freeShippingThreshold ? (
                <strong>You've unlocked FREE Express Shipping! 🎉</strong>
              ) : (
                <span>Add <strong>{formatCurrency(remainingForFreeShipping)}</strong> more for <strong>FREE Delivery</strong></span>
              )}
            </span>
            <span className="font-mono text-[11px] font-bold">{shippingProgress}%</span>
          </div>
          <div className="w-full bg-[#C2D4BE] rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-[#18382D] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${shippingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#F7F2EA]">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#746B62] py-16">
              <div className="w-16 h-16 rounded-full bg-[#F7F2EA] border border-[#E6DCCF] flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[#B88D4E]" />
              </div>
              <p className="font-serif text-xl text-[#18382D] mb-1">Your bag is currently empty</p>
              <p className="text-xs text-[#746B62] max-w-xs mb-6 leading-relaxed">
                Explore our curated collection of affordable 18K anti-tarnish jewellery, wirefree bras, and seamless underwear.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#18382D] text-white rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-[#234E3F] transition-all cursor-pointer shadow-sm"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={`${item.id}-${item.selectedSize}`} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg bg-[#F7F2EA] border border-[#E6DCCF] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-medium text-[#1B1A18] truncate">
                      {item.title}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.id, item.selectedSize)}
                      className="text-[#746B62] hover:text-red-600 transition-colors cursor-pointer p-0.5"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-[#746B62] font-mono mb-2">
                    {item.selectedSize ? `Size: ${item.selectedSize} • ` : ""}{formatCurrency(item.price)}
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-[#E6DCCF] rounded-md bg-white">
                      <button
                        onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-[#746B62] hover:bg-[#F7F2EA] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-medium text-[#18382D]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-[#746B62] hover:bg-[#F7F2EA] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono font-semibold text-xs text-[#18382D]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Call-to-Actions */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-[#F7F2EA] border-t border-[#E6DCCF] space-y-3">
            
            {/* Complimentary Packaging Note */}
            <div className="flex items-center gap-2 text-[11px] text-[#18382D]">
              <Gift className="w-4 h-4 text-[#B88D4E] shrink-0" />
              <span>Complimentary luxury gift box &amp; velvet pouch included</span>
            </div>

            {/* Calculations */}
            <div className="space-y-1 text-xs text-[#746B62] pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-[#1B1A18]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-mono text-[#1B1A18]">
                  {subtotal >= freeShippingThreshold ? <strong className="text-emerald-800">FREE</strong> : "₹49 (Standard)"}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E6DCCF] text-base font-bold text-[#18382D]">
                <span>Total Amount:</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {/* PRIMARY: Online Checkout & Payment Gateway */}
            <button
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="w-full py-3.5 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-[#B88D4E]" />
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
            </button>

            {/* SECONDARY: Quick WhatsApp Order */}
            <button
              onClick={handleSendWhatsAppOrder}
              className="w-full py-2.5 bg-white hover:bg-[#FFFDFA] text-[#18382D] border border-[#E6DCCF] rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Or Order via WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
