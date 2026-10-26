import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  KeyRound,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency } from "../../utils/barcode";
import { createOnlineOrder, validateCoupon, getStoreSettings, saveStoreSettings } from "../../services/storage";

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

  // Payment method: ONLY 'razorpay' (Online) or 'cod' (Offline)
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  
  // Real Razorpay Key ID
  const [razorpayKeyId, setRazorpayKeyId] = useState(
    currentSettings.razorpayKeyId || "rzp_test_1DP5mmOlF5G5ag"
  );
  const [showKeyEditor, setShowKeyEditor] = useState(false);
  const [keySavedNotice, setKeySavedNotice] = useState(false);

  // COD Policy acceptance checkbox
  const [codPolicyAccepted, setCodPolicyAccepted] = useState(true);

  const [formError, setFormError] = useState("");

  useEffect(() => {
    // Ensure Razorpay SDK is loaded
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // COD orders require ₹49 delivery handling fee (refundable if non-damaged)
  // Online Razorpay orders enjoy FREE delivery if >= ₹499
  const isCod = paymentMethod === "cod";
  const shippingFee = isCod ? 49 : (subtotal >= 499 || appliedCoupon?.freeShipping ? 0 : 49);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Save updated Razorpay key
  const handleUpdateRazorpayKey = (newKey) => {
    const trimmed = newKey.trim();
    setRazorpayKeyId(trimmed);
    const updated = { ...getStoreSettings(), razorpayKeyId: trimmed };
    saveStoreSettings(updated);
    setKeySavedNotice(true);
    setTimeout(() => setKeySavedNotice(false), 2500);
  };

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

  // Launch Real Razorpay Payment Dialog
  const launchRealRazorpayCheckout = () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Razorpay checkout SDK is still loading. Please wait a moment and click again.");
      setIsProcessing(false);
      return;
    }

    const keyToUse = razorpayKeyId || currentSettings.razorpayKeyId || "rzp_test_1DP5mmOlF5G5ag";

    const options = {
      key: keyToUse,
      amount: Math.round(finalTotal * 100), // in paise (e.g. ₹399 = 39900 paise)
      currency: "INR",
      name: "ZOYARA",
      description: "Fashion & Comfort — Fine Jewellery & Intimates",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=140&auto=format&fit=crop&q=80",
      prefill: {
        name: fullName.trim(),
        email: email.trim() || "care@zoyara.in",
        contact: phone.trim()
      },
      notes: {
        merchant_name: "ZOYARA Atelier & Boutique",
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
          "Razorpay Payment Failed: " + 
          (response.error?.description || response.error?.reason || "Transaction cancelled") +
          "\n(Code: " + (response.error?.code || "ERR") + ")"
        );
      });
      rzpInstance.open();
    } catch (err) {
      setIsProcessing(false);
      alert("Error initializing Razorpay: " + (err.message || err));
    }
  };

  // Submit order & trigger gateway
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      setFormError("Please fill in all required delivery address fields.");
      return;
    }

    if (phone.replace(/\D/g, "").length !== 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (paymentMethod === "cod") {
      if (!codPolicyAccepted) {
        setFormError("Please accept the COD delivery fee & non-damaged refund terms to proceed.");
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
        completeOrder("Cash on Delivery (COD)", "Pending (COD)", null);
      }, 700);
      return;
    }

    // REAL RAZORPAY ONLINE FLOW
    if (paymentMethod === "razorpay") {
      setIsProcessing(true);
      launchRealRazorpayCheckout();
    }
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
      transactionId: txnId || (isCod ? `cod_ref_${Date.now()}` : `pay_rzp_${Date.now()}`),
      codPolicyApplied: isCod
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
        {/* Top Header - Logo on Left */}
        <div className="p-4 sm:p-5 bg-[#F7F2EA] border-b border-[#E6DCCF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.16em] font-extrabold text-[#18382D] leading-none">
                ZOYARA
              </span>
              <span className="text-[10px] tracking-[0.32em] text-[#B88D4E] uppercase font-bold mt-0.5">
                Fashion &amp; Comfort
              </span>
            </div>
            <span className="text-xs text-[#746B62] border-l border-[#E6DCCF] pl-3 hidden sm:inline font-mono">
              256-Bit SSL Secured Checkout
            </span>
          </div>

          <button
            onClick={onClose}
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
            
            {/* Step 1: Customer Contact & Address */}
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
                    placeholder="10-digit phone"
                    className="w-full px-3 py-2 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#746B62] mb-1">Email (for Tax Invoice &amp; Live Tracking)</label>
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
                    placeholder="Flat / House No., Society / Street Name, Landmark"
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

            {/* Step 2: Payment Gateway Selector (ONLY Razorpay Online OR Cash on Delivery) */}
            <div className="p-5 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F7F2EA]">
                <h4 className="font-serif text-base text-[#18382D] font-medium flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#18382D] text-[#FFFDFA] text-[11px] flex items-center justify-center font-mono">2</span>
                  Select Payment Method
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Razorpay Certified</span>
                </div>
              </div>

              {/* ONLY TWO PAYMENT OPTIONS: RAZORPAY (ONLINE) vs COD (OFFLINE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* 1. RAZORPAY ONLINE GATEWAY */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                    paymentMethod === "razorpay"
                      ? "border-[#18382D] bg-[#18382D] text-white shadow-md ring-2 ring-[#B88D4E]"
                      : "border-[#E6DCCF] hover:bg-[#F7F2EA]/60 text-[#1B1A18] bg-white"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <ShieldCheck className={`w-5 h-5 ${paymentMethod === "razorpay" ? "text-[#E9D9BD]" : "text-[#18382D]"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm tracking-tight flex items-center gap-1">
                        <span className={paymentMethod === "razorpay" ? "text-[#70B4FF]" : "text-[#3395FF]"}>Razor</span>pay Online
                      </span>
                      {paymentMethod === "razorpay" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-1 ${paymentMethod === "razorpay" ? "text-[#E7ECE4]" : "text-[#746B62]"}`}>
                      UPI (GPay/PhonePe/Paytm), Cards, NetBanking.
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono">
                      <span className={`px-1.5 py-0.5 rounded ${paymentMethod === "razorpay" ? "bg-white/15 text-[#E9D9BD]" : "bg-emerald-50 text-emerald-800"}`}>
                        Real Gateway Modal
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${paymentMethod === "razorpay" ? "bg-white/15 text-[#E9D9BD]" : "bg-gray-100 text-gray-700"}`}>
                        0% Surcharge
                      </span>
                    </div>
                  </div>
                </button>

                {/* 2. CASH ON DELIVERY (OFFLINE COD) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                    paymentMethod === "cod"
                      ? "border-[#18382D] bg-[#F7F2EA] text-[#18382D] shadow-md ring-2 ring-[#18382D]"
                      : "border-[#E6DCCF] hover:bg-[#F7F2EA]/60 text-[#1B1A18] bg-white"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-[#E7ECE4] flex items-center justify-center shrink-0 border border-[#C2D4BE]">
                    <Truck className="w-5 h-5 text-[#18382D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm tracking-tight">
                        Cash on Delivery (COD)
                      </span>
                      {paymentMethod === "cod" && (
                        <span className="w-2 h-2 rounded-full bg-[#18382D]"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#746B62] mt-1">
                      Pay cash or UPI upon courier delivery.
                    </p>
                    <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block font-medium">
                      ₹49 Delivery Fee Policy applies
                    </div>
                  </div>
                </button>
              </div>

              {/* Dynamic Details / Policy Panel */}
              <div className="pt-1">
                
                {/* RAZORPAY LIVE PANEL */}
                {paymentMethod === "razorpay" && (
                  <div className="p-4 bg-gradient-to-r from-[#0c2340]/5 via-[#F7F2EA] to-white rounded-xl border border-[#3395FF]/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-[#0c2340] flex items-center gap-1.5">
                        <span className="text-[#3395FF]">Razor</span>pay Live SDK Checkout
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
                      </span>
                    </div>

                    <p className="text-xs text-[#746B62] leading-relaxed">
                      Clicking <strong>Pay via Razorpay</strong> opens the official Razorpay Checkout popup modal directly on your screen:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#18382D] font-medium">
                      <div className="p-2 bg-white rounded-lg border border-[#E6DCCF] text-center shadow-2xs">
                        ⚡ Google Pay / PhonePe / Paytm
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#E6DCCF] text-center shadow-2xs">
                        💳 Visa, RuPay &amp; MasterCards
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#E6DCCF] text-center shadow-2xs">
                        🏦 50+ Banks NetBanking
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#E6DCCF] text-center shadow-2xs">
                        🛍️ Wallets &amp; Cred UPI
                      </div>
                    </div>

                    {/* Live Key ID Display & Quick In-Place Switcher */}
                    <div className="p-2.5 bg-white rounded-lg border border-[#E6DCCF] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <KeyRound className="w-3.5 h-3.5 text-[#B88D4E]" />
                          <span className="text-[#746B62]">Gateway Key ID:</span>
                          <strong className="text-[#18382D] truncate max-w-[180px]">{razorpayKeyId}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowKeyEditor(!showKeyEditor)}
                          className="text-[#3395FF] hover:underline text-[11px] font-semibold cursor-pointer"
                        >
                          {showKeyEditor ? "Close" : "Change Key ID"}
                        </button>
                      </div>

                      {showKeyEditor && (
                        <div className="pt-2 border-t border-[#F7F2EA] space-y-2 animate-fadeIn">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#746B62]">
                            Paste Key ID from Razorpay Dashboard (Settings &gt; API Keys):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={razorpayKeyId}
                              onChange={(e) => handleUpdateRazorpayKey(e.target.value)}
                              placeholder="rzp_test_... or rzp_live_..."
                              className="flex-1 px-3 py-1.5 bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg text-xs font-mono focus:outline-none focus:border-[#18382D]"
                            />
                            <a
                              href="https://dashboard.razorpay.com/app/website-app-settings/api-keys"
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-[#F7F2EA] hover:bg-[#E6DCCF] text-[#18382D] rounded-lg text-xs flex items-center gap-1 transition-colors"
                              title="Open Razorpay Dashboard API Keys"
                            >
                              <span>Get Keys</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          {keySavedNotice && (
                            <p className="text-[10px] text-emerald-700 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Key saved and activated for all checkouts!
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* COD POLICY PANEL */}
                {paymentMethod === "cod" && (
                  <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-300 space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                      <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>COD Delivery Fee &amp; Non-Damaged Refund Guarantee Policy</span>
                    </div>

                    <div className="text-xs text-amber-900/90 space-y-1.5 leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-200">
                      <p>
                        • <strong>Delivery Fee (₹49):</strong> To confirm courier commitment and prevent bogus bookings, a nominal delivery fee of ₹49 is payable for Cash on Delivery.
                      </p>
                      <p className="text-emerald-800 font-medium">
                        • <strong>100% Refundable Guarantee:</strong> If you receive the product and choose to return it in <strong>non-damaged condition</strong> with original tags and hygiene stickers intact, this entire delivery fee will be <strong>100% refunded / credited back</strong> to you.
                      </p>
                    </div>

                    {/* Interactive Policy Checkbox */}
                    <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-xs text-[#18382D] font-medium select-none">
                      <input
                        type="checkbox"
                        checked={codPolicyAccepted}
                        onChange={(e) => setCodPolicyAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#18382D] focus:ring-[#18382D] cursor-pointer"
                      />
                      <span>
                        I understand that the ₹49 COD delivery fee is required, and will be <strong>100% refunded back</strong> if the product is returned non-damaged and intact.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Pay CTA (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Items list preview */}
            <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs space-y-3">
              <h4 className="font-serif text-sm font-semibold text-[#18382D] pb-2 border-b border-[#F7F2EA] flex items-center justify-between">
                <span>Order Summary ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="text-xs font-normal text-[#746B62]">Atelier Dispatch</span>
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-[#F7F2EA] pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-2.5 text-xs">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg bg-[#F7F2EA] border border-[#E6DCCF] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#1B1A18] truncate">{item.title}</div>
                      <div className="text-[11px] text-[#746B62] font-mono">
                        {item.selectedSize || "Free Size"} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-xs text-[#18382D]">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="pt-2 border-t border-[#F7F2EA]">
                {appliedCoupon ? (
                  <div className="p-2.5 bg-[#E7ECE4] rounded-lg border border-[#C2D4BE] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#18382D]">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discount})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-700 hover:underline text-[11px] font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Promo Code (e.g. WELCOME10)"
                      className="flex-1 px-3 py-1.5 text-xs bg-[#FFFDFA] border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#18382D] hover:bg-[#234E3F] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 pt-2 border-t border-[#F7F2EA] text-xs">
                <div className="flex justify-between text-[#746B62]">
                  <span>Items Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount Coupon:</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#746B62]">
                  <span>
                    {isCod ? "COD Delivery & Courier Fee:" : "Express Insured Shipping:"}
                  </span>
                  <span className="font-mono">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      <span>
                        {formatCurrency(shippingFee)}{" "}
                        {isCod && <span className="text-[10px] text-emerald-700 font-sans">(Refundable)</span>}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[#746B62]">
                  <span>GST (3% composite included):</span>
                  <span className="font-mono">₹{Math.round(finalTotal * 0.03 * 100) / 100}</span>
                </div>

                <div className="flex justify-between text-base font-semibold text-[#18382D] pt-2 border-t border-[#E6DCCF]">
                  <span>Grand Total:</span>
                  <span className="text-xl font-mono text-[#18382D] font-bold">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Main Pay CTA Button */}
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-3.5 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>
                  {paymentMethod === "razorpay" 
                    ? `Pay ${formatCurrency(finalTotal)} via Razorpay` 
                    : `Place COD Order • ${formatCurrency(finalTotal)}`}
                </span>
                <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
              </button>

              <div className="text-center pt-1 text-[10px] text-[#746B62]">
                ⚡ Instant E-Invoice &amp; Official Tax Bill generated upon order confirmation.
              </div>
            </div>

            {/* Atelier Guarantees Card */}
            <div className="p-3 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] text-[11px] text-[#746B62] space-y-1.5">
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
