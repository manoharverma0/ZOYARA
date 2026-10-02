import React, { useState } from "react";
import { X, Trash2, Plus, Minus, MessageCircle, Gift, ArrowRight } from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { STORE_SETTINGS } from "../../data/initialProducts";

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSendWhatsAppOrder = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const itemsSummary = cartItems
      .map((item, idx) => `${idx + 1}. *${item.title}* (${item.sku}) - Qty: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`)
      .join("\n");

    const message = encodeURIComponent(
      `*NEW ONLINE ORDER — ZOYARA ATELIER* ✨\n\n` +
      `*Customer Details:*\n` +
      `Name: ${customerName || "Customer"}\n` +
      `Phone: ${customerPhone || "Not provided"}\n` +
      `Delivery Address: ${customerAddress || "Local Store Pickup"}\n\n` +
      `*Ordered Items:*\n${itemsSummary}\n\n` +
      `*Total Order Amount:* ${formatCurrency(subtotal)}\n\n` +
      `Please share payment QR / bank details and confirmation.`
    );

    const whatsappNum = STORE_SETTINGS.whatsappNumber || "919876543210";
    window.open(`https://wa.me/${whatsappNum}?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#121214]/50 backdrop-blur-xs transition-opacity animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-[#FAF8F5] w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-[#DFD5C6] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8E2D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-2xl text-[#18181B] font-normal tracking-wide">
              Your Shopping Bag
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#7A6D5E] font-medium">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EFE9DF] text-[#7A6D5E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#EFE9DF]">
          {cartItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-[#8C7E6C]">
              <div className="w-12 h-12 rounded-full bg-[#EFE9DF] flex items-center justify-center mb-3">
                <Gift className="w-6 h-6 text-[#A39686]" />
              </div>
              <p className="font-serif text-lg text-[#1A1A1E] mb-1">Your bag is currently empty</p>
              <p className="text-xs text-[#8C7E6C] max-w-xs mb-4">
                Explore our curated collection of affordable minimalist jewellery and everyday intimates.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#18181B] text-[#FAF8F5] rounded-full text-xs font-medium tracking-widest uppercase transition-all hover:bg-[#2B2B30] cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg bg-[#EFE9DF] border border-[#DFD5C6] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-[#1A1A1E] truncate mb-0.5">
                    {item.title}
                  </h4>
                  <div className="text-[11px] text-[#8C7E6C] font-mono mb-2">
                    {item.sku} • {formatCurrency(item.price)}
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#DFD5C6] rounded-md bg-white">
                      <button
                        onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity - 1)}
                        className="px-2 py-0.5 hover:bg-[#FAF8F5] text-[#6E6152] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-medium text-[#1A1A1E]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity + 1)}
                        className="px-2 py-0.5 hover:bg-[#FAF8F5] text-[#6E6152] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id, item.selectedSize)}
                      className="text-[#A39686] hover:text-red-600 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#18181B]">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Form & Footer Actions */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-[#F4EFE6] border-t border-[#E8E2D8] space-y-4">
            
            {/* Complimentary Packaging Note */}
            <div className="flex items-center gap-2 text-[11px] text-[#6E6152] bg-[#FAF8F5] p-2.5 rounded-lg border border-[#DFD5C6]">
              <Gift className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>Includes complimentary aesthetic unboxing card & protective pouch.</span>
            </div>

            {/* Quick Customer Inputs for WhatsApp Dispatch */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#DFD5C6] rounded-lg focus:outline-none focus:border-[#18181B]"
              />
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Mobile / WhatsApp No."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-1/2 text-xs px-3 py-2 bg-white border border-[#DFD5C6] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
                <input
                  type="text"
                  placeholder="City / Pincode"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-1/2 text-xs px-3 py-2 bg-white border border-[#DFD5C6] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>
            </div>

            {/* Subtotal & Delivery */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-[#6E6152]">
                <span>Items Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6E6152]">
                <span>Boutique Packaging</span>
                <span className="text-emerald-700 font-medium">Complimentary</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#18181B] pt-2 border-t border-[#DFD5C6]">
                <span>Estimated Total</span>
                <span className="text-base">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {/* WhatsApp Checkout Button */}
            <button
              onClick={handleSendWhatsAppOrder}
              className="w-full py-3 px-4 bg-[#18181B] hover:bg-[#2B2B30] text-[#FAF8F5] rounded-xl font-medium text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Confirm Order on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
