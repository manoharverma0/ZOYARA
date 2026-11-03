import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Tag, 
  AlertCircle,
  Lock,
  CreditCard
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency } from "../../utils/barcode";
import { createOnlineOrder, validateCoupon, getStoreSettings } from "../../services/storage";

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  currentUser, 
  onOrderSuccess,
  onClearCart 
}) {
  const currentSettings = getStoreSettings();

  // Contact & Address
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [street, setStreet] = useState(currentUser?.address || "");
  const [city, setCity] = useState(currentUser?.city || "");
  const [state, setState] = useState(currentUser?.state || "Delhi");
  const [pincode, setPincode] = useState(currentUser?.pincode || "");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState("");

  // Load Razorpay SDK on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = (subtotal >= 499 || appliedCoupon?.freeShipping) ? 0 : 49;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Apply Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const res = validateCoupon(couponCode, subtotal);
    if (res.valid) {
      setAppliedCoupon(res);
      setCouponCode("");
    } else {
      setCouponError(res.error);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // Launch Official Razorpay Checkout
  const launchRazorpayCheckout = () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Payment gateway is initializing. Please click again in 2 seconds.");
      setIsProcessing(false);
      return;
    }

    const razorpayKey = (
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_RAZORPAY_KEY_ID) || 
      currentSettings.razorpayKeyId || 
      "rzp_live_TvZx817mfaHPhW"
    ).trim();

    const options = {
      key: razorpayKey,
      amount: Math.round(finalTotal * 100), // In paise (INR)
      currency: "INR",
      name: "ZOYARA",
      description: "Fine Jewellery & Intimates",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=140&auto=format&fit=crop&q=80",
      prefill: {
        name: fullName.trim(),
        email: email.trim() || "patron@zoyara.in",
        contact: phone.trim()
      },
      notes: {
        merchant_name: "ZOYARA Atelier",
        delivery_address: `${street.trim()}, ${city.trim()} - ${pincode.trim()}`
      },
      theme: {
        color: "#18382D",
        backdrop_color: "rgba(18, 26, 22, 0.85)"
      },
      modal: {
        backdropclose: true,
        escape: true,
        handleback: true,
        ondismiss: function () {
          setIsProcessing(false);
        }
      },
      handler: function (response) {
        setIsProcessing(false);
        completeOrder(
          "Razorpay Online", 
          "Paid", 
          response.razorpay_payment_id || `pay_rzp_${Date.now()}`
        );
      }
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (response) {
        setIsProcessing(false);
        alert(
          "Payment Unsuccessful: " + 
          (response.error?.description || response.error?.reason || "Transaction cancelled")
        );
      });
      rzpInstance.open();
    } catch (err) {
      setIsProcessing(false);
      alert("Payment gateway error: " + (err.message || err));
    }
  };

  // Submit order & trigger gateway
  const handleProceedToPayment = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      setFormError("Please fill in all required delivery address fields.");
      return;
    }

    if (phone.replace(/\D/g, "").length !== 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsProcessing(true);
    launchRazorpayCheckout();
  };

  const completeOrder = (methodTitle, paymentStatus, txnId) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const orderData = {
      customerName: fullName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim(),
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: "India"
      },
      items: cartItems.map(it => ({
        id: it.id,
        title: it.title,
        sku: it.sku,
        price: it.price,
        quantity: it.quantity,
        selectedSize: it.selectedSize || "Free Size",
        image: it.image,
        category: it.category
      })),
      subtotal,
      discountAmount,
      couponCode: appliedCoupon?.code || "",
      shippingFee,
      taxAmount: Math.round(finalTotal * 0.03 * 100) / 100, // 3% GST
      finalTotal,
      paymentMethod: methodTitle,
      paymentStatus,
      transactionId: txnId || `pay_rzp_${Date.now()}`
    };

    const newOrder = createOnlineOrder(orderData);
    onClearCart();
    setIsProcessing(false);
    onClose();
    onOrderSuccess(newOrder);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#121214]/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E6DCCF] flex flex-col my-auto max-h-[95vh] overflow-hidden relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#F7F2EA] border-b border-[#E6DCCF] flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.16em] font-extrabold text-[#18382D] leading-none">
              ZOYARA
            </span>
            <span className="text-[10px] tracking-[0.32em] text-[#B88D4E] uppercase font-bold mt-0.5">
              Secure Checkout
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-[#E6DCCF] text-[#746B62] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Checkout Main Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Shipping & Payment Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Step 1: Delivery Address & Contact */}
            <div className="p-5 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#F7F2EA]">
                <h4 className="font-serif text-base text-[#18382D] font-medium flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#18382D] text-[#FFFDFA] text-[11px] flex items-center justify-center font-mono">1</span>
                  Delivery Address &amp; Contact
                </h4>
                {currentUser && (
                  <span className="text-[11px] text-[#B88D4E] font-medium">Logged in as {currentUser.name}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#746B62] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pooja Sharma"
                    className="w-full px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#746B62] mb-1">Mobile Number (+91) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#746B62] mb-1">Email (for Tax Invoice &amp; Tracking)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pooja.sharma@gmail.com"
                    className="w-full px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#746B62] mb-1">Delivery Street Address *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Flat / House No., Society, Landmark"
                    className="w-full px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#746B62] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#746B62] mb-1">State *</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Delhi"
                      className="w-full px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#746B62] mb-1">PIN Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="110049"
                      className="w-full px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method (Online Razorpay Only) */}
            <div className="p-5 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#F7F2EA]">
                <h4 className="font-serif text-base text-[#18382D] font-medium flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#18382D] text-[#FFFDFA] text-[11px] flex items-center justify-center font-mono">2</span>
                  Payment Method
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {/* Clean Single Online Payment Option */}
              <div className="p-4 rounded-xl border border-[#18382D] bg-[#18382D] text-white shadow-sm flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  <CreditCard className="w-5 h-5 text-[#E9D9BD]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                      Razorpay Online Payment
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/15 text-[#E9D9BD] font-medium">
                      Instant &amp; Zero Fee
                    </span>
                  </div>
                  <p className="text-xs text-[#E7ECE4] mt-1 leading-relaxed">
                    UPI (Google Pay, PhonePe, Paytm), Credit &amp; Debit Cards, NetBanking, and Wallets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Items Summary Card */}
            <div className="p-5 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs space-y-4">
              <h4 className="font-serif text-base text-[#18382D] font-medium pb-2 border-b border-[#F7F2EA] flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-[#746B62] font-sans font-normal">{cartItems.length} items</span>
              </h4>

              {/* Items List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-3 text-xs items-center">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-12 h-14 object-cover rounded-md border border-[#E6DCCF]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#18382D] truncate">{item.title}</p>
                      <p className="text-[11px] text-[#746B62]">{item.selectedSize || "Free Size"} × {item.quantity}</p>
                      <p className="font-mono font-semibold text-[#18382D]">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Form */}
              <div className="pt-2 border-t border-[#F7F2EA]">
                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code} applied (-{formatCurrency(appliedCoupon.discount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-red-600 text-xs font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2 text-xs">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg uppercase tracking-wider font-mono focus:outline-none focus:border-[#18382D]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#18382D] text-white rounded-lg text-xs font-semibold hover:bg-[#234E3F] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-red-600 text-[11px] mt-1">{couponError}</p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="pt-2 border-t border-[#E6DCCF] space-y-2 text-xs">
                <div className="flex justify-between text-[#746B62]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-[#18382D]">{formatCurrency(subtotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#746B62]">
                  <span>Insured Shipping:</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      formatCurrency(shippingFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[#746B62]">
                  <span>GST (Included):</span>
                  <span className="font-mono">₹{Math.round(finalTotal * 0.03 * 100) / 100}</span>
                </div>

                <div className="flex justify-between text-base font-semibold text-[#18382D] pt-2 border-t border-[#E6DCCF]">
                  <span>Grand Total:</span>
                  <span className="text-xl font-mono text-[#18382D] font-bold">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Pay CTA Button */}
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isProcessing || cartItems.length === 0}
                className="w-full py-3.5 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-[#B88D4E]" />
                <span>
                  {isProcessing 
                    ? "Opening Gateway..." 
                    : `Pay ${formatCurrency(finalTotal)} via Razorpay`}
                </span>
                <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
              </button>

              <div className="text-center pt-1 text-[11px] text-[#746B62] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Instant E-Invoice &amp; Tax Bill upon payment</span>
              </div>
            </div>

            {/* Atelier Guarantees Card */}
            <div className="p-3.5 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] text-[11px] text-[#746B62] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#18382D] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#B88D4E]" />
                <span>The ZOYARA Assurance</span>
              </div>
              <div>• 100% Anti-Tarnish 18K Polish Jewellery</div>
              <div>• Hygienic Double-Gusset Cotton Intimates</div>
              <div>• Complimentary Gift Packaging with Ribbon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
