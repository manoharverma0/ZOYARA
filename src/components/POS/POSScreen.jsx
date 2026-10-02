import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  Scan, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle, 
  User, 
  Phone, 
  Printer, 
  AlertCircle, 
  RotateCcw 
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency } from "../../utils/barcode";
import { recordSale } from "../../services/storage";
import { sounds } from "../../utils/audio";
import POSReceiptModal from "./POSReceiptModal";

export default function POSScreen({ products, settings, onRefreshData }) {
  // POS Order State
  const [billItems, setBillItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Discount & Taxes
  const [discountType, setDiscountType] = useState("flat"); // 'flat' or 'percent'
  const [discountValue, setDiscountValue] = useState(0);

  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash', 'upi', 'card'
  const [tenderedAmount, setTenderedAmount] = useState(0);

  // Completed Sale Modal State
  const [completedSale, setCompletedSale] = useState(null);

  // Notification Banner
  const [scanNotice, setScanNotice] = useState(null);

  // Global Barcode Gun Keystroke Buffer
  const barcodeBufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const searchInputRef = useRef(null);

  const addItemToBill = useCallback((product) => {
    setBillItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id);
      if (existing) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const processBarcodeScan = useCallback((scannedCode) => {
    const cleanCode = scannedCode.trim().toUpperCase();
    const matchedProduct = products.find(
      p => (p.barcode && p.barcode.toUpperCase() === cleanCode) || 
           (p.sku && p.sku.toUpperCase() === cleanCode)
    );

    if (matchedProduct) {
      sounds.playScanSuccess();
      addItemToBill(matchedProduct);
      setScanNotice({
        type: "success",
        text: `Scanned: ${matchedProduct.title} (${matchedProduct.sku})`
      });
    } else {
      sounds.playError();
      setScanNotice({
        type: "error",
        text: `Barcode not found: "${scannedCode}". Check inventory or SKU.`
      });
    }

    setTimeout(() => setScanNotice(null), 3500);
  }, [products, addItemToBill]);

  // --- HARDWARE BARCODE SCANNER LISTENER ---
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // If user is currently typing in an input field other than quick search, don't hijack unless it's a super fast scanner
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      const isInputActive = activeTag === "input" || activeTag === "textarea";
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (isInputActive && document.activeElement !== searchInputRef.current && timeDiff > 100) {
        return;
      }

      // Barcode scanners type rapidly (usually < 50ms between characters)
      if (e.key === "Enter") {
        const potentialCode = barcodeBufferRef.current.trim();
        if (potentialCode.length >= 3) {
          e.preventDefault();
          processBarcodeScan(potentialCode);
        }
        barcodeBufferRef.current = "";
        return;
      }

      // If typed within fast scanner cadence or accumulating
      if (e.key.length === 1) {
        if (timeDiff > 250) {
          // Reset buffer if delay too long (likely human typing)
          barcodeBufferRef.current = e.key;
        } else {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [processBarcodeScan]);


  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    setBillItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const removeItem = (id) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCurrentBill = () => {
    if (billItems.length === 0) return;
    if (window.confirm("Clear all items from current bill?")) {
      setBillItems([]);
      setDiscountValue(0);
      setCustomerPhone("");
      setCustomerName("");
      setTenderedAmount(0);
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [billItems]);

  const discountAmount = useMemo(() => {
    if (discountType === "percent") {
      return Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100);
    }
    return Math.min(subtotal, Math.max(0, discountValue));
  }, [subtotal, discountType, discountValue]);

  const finalTotal = Math.max(0, subtotal - discountAmount);
  const changeAmount = Math.max(0, tenderedAmount - finalTotal);

  // Filtered Products for Manual Quick Tap
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (activeCategory === "Jewellery" && p.category !== "Jewellery") return false;
      if (activeCategory === "Bras" && p.category !== "Bras") return false;
      if (activeCategory === "Underwear" && p.category !== "Underwear") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
        );
      }
      return true;
    });
  }, [products, activeCategory, searchQuery]);

  // Complete and Record Sale
  const handleCompleteSale = () => {
    if (billItems.length === 0) {
      alert("Please add at least one item to checkout.");
      return;
    }

    if (paymentMethod === "credit" && (!customerPhone.trim() || !customerName.trim())) {
      alert("For Credit / Udhaar (Khata) bills, Customer Name and Mobile Number are required.");
      return;
    }

    const billNumber = Date.now().toString().slice(-6);
    const saleRecord = {
      id: "sale-" + Date.now(),
      billNumber: billNumber,
      date: new Date().toISOString(),
      items: billItems,
      subtotal: subtotal,
      discountAmount: discountAmount,
      taxAmount: 0,
      finalTotal: finalTotal,
      paymentMethod: paymentMethod,
      tenderedAmount: paymentMethod === "cash" ? (tenderedAmount || finalTotal) : finalTotal,
      changeAmount: paymentMethod === "cash" ? changeAmount : 0,
      customerName: customerName.trim() || (paymentMethod === "credit" ? "Khata Customer" : "Walk-in Guest"),
      customerPhone: customerPhone.trim()
    };

    recordSale(saleRecord);
    onRefreshData();

    // Celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setCompletedSale(saleRecord);
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    setBillItems([]);
    setDiscountValue(0);
    setTenderedAmount(0);
    setCustomerName("");
    setCustomerPhone("");
    setScanNotice(null);
  };

  // Dynamic UPI URL for QR Code
  const upiPayUrl = `upi://pay?pa=${settings?.upiId || "zoyara@upi"}&pn=ZOYARA%20ATELIER&am=${finalTotal}&cu=INR&tn=Bill%20ZOYARA`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiPayUrl)}`;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4EFE6] p-3 sm:p-5 flex flex-col no-print">
      
      {/* Top Scanner Notice Alert */}
      {scanNotice && (
        <div 
          className={`mb-3 p-3 rounded-xl flex items-center justify-between text-xs font-medium animate-slideDown shadow-md ${
            scanNotice.type === "success" 
              ? "bg-emerald-800 text-emerald-50" 
              : "bg-red-800 text-red-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {scanNotice.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-300" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-300" />
            )}
            <span>{scanNotice.text}</span>
          </div>
          <span className="text-[10px] opacity-80 uppercase tracking-widest font-mono">Scanner Active</span>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Product Quick-Tap & Search Grid (5 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col bg-white rounded-2xl border border-[#DFD5C6] shadow-xs overflow-hidden">
          
          {/* Search Header */}
          <div className="p-3.5 border-b border-[#E8E2D8] bg-[#FAF8F5] space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C7E6C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan barcode or type SKU / Title..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#DFD5C6] rounded-xl focus:outline-none focus:border-[#18181B] font-mono"
                />
              </div>

              {/* Barcode Test Scanner Button (Simulate Hardware Scan) */}
              <button
                onClick={() => {
                  const code = prompt("Enter or paste Barcode/SKU to simulate hardware scan gun:");
                  if (code) processBarcodeScan(code);
                }}
                className="px-3 py-2 text-xs font-medium bg-[#EFE9DF] hover:bg-[#E5DDCF] text-[#4A4036] rounded-xl border border-[#DDD2C2] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Simulate barcode gun keystroke"
              >
                <Scan className="w-3.5 h-3.5 text-[#8C6D3F]" />
                <span className="hidden sm:inline">Simulate Scan</span>
              </button>
            </div>

            {/* Category Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "All Items" },
                { id: "Jewellery", label: "💎 Fine Jewellery" },
                { id: "Bras", label: "👙 Bras & Bralettes" },
                { id: "Underwear", label: "🌸 Girls Underwear" }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-[#18181B] text-[#FAF8F5]"
                      : "bg-[#EFE9DF] text-[#6E6152] hover:bg-[#E5DDCF]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 p-3.5 overflow-y-auto max-h-[calc(100vh-270px)] grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filteredProducts.map(product => {
              const inBill = billItems.find(i => i.id === product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    sounds.playScanSuccess();
                    addItemToBill(product);
                  }}
                  className={`group p-2 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between relative ${
                    inBill
                      ? "bg-[#FAF8F5] border-[#C5A880] shadow-xs ring-1 ring-[#C5A880]"
                      : "bg-white border-[#E8E2D8] hover:border-[#C5A880] hover:shadow-sm"
                  }`}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F3EDE3] mb-1.5">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    {inBill && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#18181B] text-[#D4AF37] text-[10px] font-bold flex items-center justify-center">
                        {inBill.quantity}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] text-[#8C7E6C] font-mono truncate">
                      {product.sku}
                    </div>
                    <div className="text-xs font-medium text-[#1A1A1E] truncate">
                      {product.title}
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#F2ECE3]">
                      <span className="text-xs font-semibold text-[#18181B]">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Checkout Register & Payment (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col bg-white rounded-2xl border border-[#DFD5C6] shadow-md overflow-hidden">
          
          {/* Register Header */}
          <div className="p-3.5 bg-[#18181B] text-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-serif text-lg tracking-wide text-white">Current Invoice</span>
              <span className="text-[11px] font-mono text-[#D4AF37] px-2 py-0.5 bg-[#2B2B30] rounded">
                {billItems.reduce((a, b) => a + b.quantity, 0)} Items
              </span>
            </div>

            <button
              onClick={clearCurrentBill}
              className="text-xs text-[#A89C8E] hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Clear active items"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Active Bill Items List */}
          <div className="flex-1 p-3 overflow-y-auto max-h-[260px] space-y-2 divide-y divide-[#F2ECE3]">
            {billItems.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-[#8C7E6C]">
                <Scan className="w-8 h-8 text-[#C5A880] mb-2 animate-bounce" />
                <p className="font-serif text-sm text-[#18181B]">Ready for Barcode Scan</p>
                <p className="text-[11px] text-[#8C7E6C] max-w-xs mt-0.5">
                  Point barcode gun at any jewellery tag or tap a product on the left catalog.
                </p>
              </div>
            ) : (
              billItems.map(item => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#1A1A1E] truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[#8C7E6C] font-mono">
                      {item.sku} • {formatCurrency(item.price)} each
                    </div>
                  </div>

                  {/* Qty Changer */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center border border-[#DFD5C6] rounded-md bg-[#FAF8F5]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-[#5E5245] hover:bg-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-[#18181B] font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-[#5E5245] hover:bg-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-[#18181B] w-14 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#A89C8E] hover:text-red-600 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Discount Controls */}
          <div className="p-3 bg-[#FAF8F5] border-t border-[#E8E2D8] space-y-2.5">
            
            {/* Customer Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Phone className="w-3 h-3 text-[#8C7E6C] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Customer Phone (for WhatsApp bill)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-white border border-[#DFD5C6] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>
              <div className="relative">
                <User className="w-3 h-3 text-[#8C7E6C] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Customer Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-white border border-[#DFD5C6] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>
            </div>

            {/* Discount Selector */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-[#6E6152]">Discount:</span>
              
              <div className="flex bg-[#EFE9DF] p-0.5 rounded-md border border-[#DDD2C2] text-[10px]">
                <button
                  onClick={() => setDiscountType("flat")}
                  className={`px-2 py-0.5 rounded ${discountType === "flat" ? "bg-white font-semibold shadow-xs" : ""}`}
                >
                  ₹ Flat
                </button>
                <button
                  onClick={() => setDiscountType("percent")}
                  className={`px-2 py-0.5 rounded ${discountType === "percent" ? "bg-white font-semibold shadow-xs" : ""}`}
                >
                  % Off
                </button>
              </div>

              <input
                type="number"
                min="0"
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                placeholder="0"
                className="w-16 px-2 py-1 text-xs text-right bg-white border border-[#DFD5C6] rounded-md font-mono"
              />

              {/* Preset buttons */}
              <div className="flex gap-1">
                {[5, 10].map(pct => (
                  <button
                    key={pct}
                    onClick={() => { setDiscountType("percent"); setDiscountValue(pct); }}
                    className="px-1.5 py-0.5 text-[10px] bg-white border border-[#DFD5C6] rounded text-[#6E6152] hover:bg-[#EFE9DF] cursor-pointer"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Summary */}
          <div className="p-3.5 bg-[#F4EFE6] border-t border-[#DFD5C6] space-y-3">
            
            {/* Payment Method Tabs */}
            <div>
              <span className="text-[11px] font-medium text-[#6E6152] block mb-1.5">
                Payment Mode:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "bg-[#18181B] text-[#FAF8F5] border-[#18181B] font-semibold"
                      : "bg-white text-[#4A4036] border-[#DFD5C6] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Cash</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "bg-[#18181B] text-[#FAF8F5] border-[#18181B] font-semibold"
                      : "bg-white text-[#4A4036] border-[#DFD5C6] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>UPI / QR</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-[#18181B] text-[#FAF8F5] border-[#18181B] font-semibold"
                      : "bg-white text-[#4A4036] border-[#DFD5C6] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Card / POS</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("credit")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "credit"
                      ? "bg-amber-700 text-white border-amber-700 font-semibold shadow-xs"
                      : "bg-white text-amber-800 border-amber-300 hover:bg-amber-50"
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Udhaar / Khata</span>
                </button>
              </div>
            </div>

            {/* Credit / Udhaar Notice */}
            {paymentMethod === "credit" && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Credit Sale (Khata Ledger)</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  This bill of {formatCurrency(finalTotal)} will be booked to customer <strong>{customerName || "Customer"}</strong>'s account as pending receivable. You can send payment reminders via WhatsApp anytime.
                </p>
              </div>
            )}

            {/* UPI Dynamic QR Display */}
            {paymentMethod === "upi" && finalTotal > 0 && (
              <div className="p-3 bg-white rounded-xl border border-[#DFD5C6] flex items-center gap-3">
                <img
                  src={qrCodeImageUrl}
                  alt="UPI QR Code"
                  className="w-20 h-20 border rounded-lg p-1 bg-white"
                />
                <div className="text-xs space-y-0.5">
                  <div className="font-semibold text-[#18181B]">Scan to Pay via Any UPI</div>
                  <div className="text-[11px] text-[#6E6152]">GPay, PhonePe, Paytm, BHIM</div>
                  <div className="font-mono text-xs font-bold text-emerald-700">
                    Amount: {formatCurrency(finalTotal)}
                  </div>
                </div>
              </div>
            )}

            {/* Cash Tender & Change Calculator */}
            {paymentMethod === "cash" && finalTotal > 0 && (
              <div className="p-2.5 bg-white rounded-xl border border-[#DFD5C6] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6E6152]">Cash Tendered:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">₹</span>
                    <input
                      type="number"
                      value={tenderedAmount || ""}
                      onChange={(e) => setTenderedAmount(Number(e.target.value))}
                      placeholder={finalTotal.toString()}
                      className="w-24 px-2 py-1 text-xs text-right bg-[#FAF8F5] border border-[#DFD5C6] rounded font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Quick notes buttons */}
                <div className="flex gap-1.5">
                  {[200, 500, 1000].map(val => (
                    <button
                      key={val}
                      onClick={() => setTenderedAmount(val)}
                      className="flex-1 py-1 text-[10px] bg-[#EFE9DF] hover:bg-[#E5DDCF] rounded text-[#4A4036] font-mono cursor-pointer"
                    >
                      ₹{val}
                    </button>
                  ))}
                  <button
                    onClick={() => setTenderedAmount(finalTotal)}
                    className="flex-1 py-1 text-[10px] bg-[#18181B] text-white rounded font-mono cursor-pointer"
                  >
                    Exact
                  </button>
                </div>

                {tenderedAmount >= finalTotal && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-[#F2ECE3] font-bold text-emerald-800">
                    <span>Return Change:</span>
                    <span>{formatCurrency(changeAmount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Total Calculations */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#6E6152]">
                <span>Items Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#18181B] pt-1 border-t border-[#DFD5C6]">
                <span>Bill Grand Total:</span>
                <span className="text-xl font-mono">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCompleteSale}
              disabled={billItems.length === 0}
              className={`w-full py-3.5 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                billItems.length === 0
                  ? "bg-[#D5CDBD] text-[#8C7E6C] cursor-not-allowed"
                  : "bg-[#18181B] hover:bg-[#2B2B30] text-[#FAF8F5]"
              }`}
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Checkout & Print Bill • {formatCurrency(finalTotal)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* POS Thermal Receipt Modal */}
      {completedSale && (
        <POSReceiptModal
          sale={completedSale}
          settings={settings}
          onClose={() => setCompletedSale(null)}
          onNewSale={handleNewSale}
        />
      )}
    </div>
  );
}
