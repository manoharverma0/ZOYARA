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
  CheckCircle2, 
  User, 
  Phone, 
  Printer, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Tag
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
  
  // Discount
  const [discountType, setDiscountType] = useState("flat"); // 'flat' | 'percent'
  const [discountValue, setDiscountValue] = useState(0);

  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Payment State: 'cash' | 'upi' | 'card' | 'credit'
  const [paymentMethod, setPaymentMethod] = useState("cash");
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
      try { sounds.playScanSuccess(); } catch {}
      addItemToBill(matchedProduct);
      setScanNotice({
        type: "success",
        text: `Scanned: ${matchedProduct.title} (${matchedProduct.sku})`
      });
    } else {
      try { sounds.playError(); } catch {}
      setScanNotice({
        type: "error",
        text: `Barcode not found: "${scannedCode}". Check inventory or SKU.`
      });
    }

    setTimeout(() => setScanNotice(null), 3000);
  }, [products, addItemToBill]);

  // Hardware barcode scanner keystroke listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      const isInputActive = activeTag === "input" || activeTag === "textarea";
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (isInputActive && document.activeElement !== searchInputRef.current && timeDiff > 100) {
        return;
      }

      if (e.key === "Enter") {
        const potentialCode = barcodeBufferRef.current.trim();
        if (potentialCode.length >= 3) {
          e.preventDefault();
          processBarcodeScan(potentialCode);
        }
        barcodeBufferRef.current = "";
        return;
      }

      if (e.key.length === 1) {
        if (timeDiff > 250) {
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

  // Filtered Products
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

  // Complete & Record Sale
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
      taxAmount: Math.round(finalTotal * 0.03 * 100) / 100,
      finalTotal: finalTotal,
      paymentMethod: paymentMethod,
      tenderedAmount: paymentMethod === "cash" ? (tenderedAmount || finalTotal) : finalTotal,
      changeAmount: paymentMethod === "cash" ? changeAmount : 0,
      customerName: customerName.trim() || (paymentMethod === "credit" ? "Khata Customer" : "Walk-in Guest"),
      customerPhone: customerPhone.trim()
    };

    recordSale(saleRecord);
    onRefreshData();

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

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

  // UPI URL for dynamic QR Code
  const upiPayUrl = `upi://pay?pa=${settings?.upiId || "zoyara@upi"}&pn=ZOYARA%20BOUTIQUE&am=${finalTotal}&cu=INR&tn=Invoice%20ZOYARA`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayUrl)}`;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7F2EA] p-3 sm:p-5 flex flex-col font-sans no-print">
      
      {/* Top Banner Notice */}
      {scanNotice && (
        <div 
          className={`mb-3 p-3 rounded-xl flex items-center justify-between text-xs font-medium animate-fadeIn shadow-xs ${
            scanNotice.type === "success" 
              ? "bg-[#18382D] text-white" 
              : "bg-red-800 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {scanNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#B88D4E]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-200" />
            )}
            <span>{scanNotice.text}</span>
          </div>
          <span className="text-[10px] font-mono text-[#E9D9BD] uppercase tracking-wider">
            Hardware Scanner Active
          </span>
        </div>
      )}

      {/* Main Spacious 2-Column POS Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================
            LEFT COLUMN: Product Catalog & Quick-Tap Grid (7 Cols)
            ======================================================== */}
        <div className="lg:col-span-7 flex flex-col bg-[#FFFDFA] rounded-2xl border border-[#E6DCCF] shadow-sm overflow-hidden min-h-[620px]">
          
          {/* Search & Scanner Header */}
          <div className="p-4 border-b border-[#E6DCCF] bg-[#F7F2EA]/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#18382D]">
                  Store Catalog &amp; Fast Search
                </h3>
                <p className="text-[11px] text-[#746B62]">
                  Scan barcode with USB gun or tap products to add directly to invoice.
                </p>
              </div>

              <button
                onClick={() => {
                  const code = prompt("Enter or paste Barcode/SKU to simulate hardware scan:");
                  if (code) processBarcodeScan(code);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-[#18382D] hover:bg-[#234E3F] text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Simulate barcode gun keystroke"
              >
                <Scan className="w-3.5 h-3.5 text-[#B88D4E]" />
                <span>Simulate Gun</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#746B62] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Title, SKU, or Barcode (e.g. ZY-SOL-01)..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E6DCCF] rounded-xl focus:outline-none focus:border-[#18382D] shadow-2xs font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#746B62] hover:text-[#18382D]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: "all", label: "All Items" },
                { id: "Jewellery", label: "💎 Fine Jewellery" },
                { id: "Bras", label: "👙 Bras & Bralettes" },
                { id: "Underwear", label: "🌸 Girls Underwear" }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap text-xs ${
                    activeCategory === cat.id
                      ? "bg-[#18382D] text-white shadow-xs"
                      : "bg-white text-[#746B62] border border-[#E6DCCF] hover:bg-[#F7F2EA]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid (Spacious & Clean) */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-270px)] grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 bg-[#FFFDFA]">
            {filteredProducts.map(product => {
              const inBill = billItems.find(i => i.id === product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    try { sounds.playScanSuccess(); } catch {}
                    addItemToBill(product);
                  }}
                  className={`group p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between relative ${
                    inBill
                      ? "bg-[#F7F2EA] border-[#18382D] shadow-xs ring-1 ring-[#18382D]"
                      : "bg-white border-[#E6DCCF] hover:border-[#B88D4E] hover:shadow-xs"
                  }`}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F7F2EA] mb-2">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {inBill && (
                      <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#18382D] text-[#B88D4E] text-xs font-bold flex items-center justify-center font-mono shadow-xs">
                        {inBill.quantity}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#746B62] font-mono truncate">
                      {product.sku}
                    </div>
                    <div className="text-xs font-medium text-[#1B1A18] line-clamp-1 leading-tight group-hover:text-[#18382D]">
                      {product.title}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#F7F2EA]">
                      <span className="text-xs font-bold text-[#18382D] font-mono">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: Uncluttered Luxury Register (5 Cols)
            ======================================================== */}
        <div className="lg:col-span-5 flex flex-col bg-[#FFFDFA] rounded-2xl border border-[#E6DCCF] shadow-md overflow-hidden">
          
          {/* Register Header */}
          <div className="p-4 bg-[#18382D] text-[#FFFDFA] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <span className="font-serif text-base tracking-wide text-white block leading-tight">
                  Active Invoice Register
                </span>
                <span className="text-[10px] font-mono text-[#E9D9BD]">
                  {billItems.reduce((a, b) => a + b.quantity, 0)} Items Added
                </span>
              </div>
            </div>

            <button
              onClick={clearCurrentBill}
              className="text-xs text-[#E7ECE4] hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Clear active items"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Active Bill Items List */}
          <div className="flex-1 p-3.5 overflow-y-auto max-h-[220px] space-y-2 divide-y divide-[#F7F2EA]">
            {billItems.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-[#746B62] space-y-2">
                <Scan className="w-10 h-10 text-[#B88D4E] animate-bounce" />
                <p className="font-serif text-sm text-[#18382D] font-medium">Ready for First Item</p>
                <p className="text-xs text-[#746B62] max-w-xs">
                  Scan barcode tag or tap any product from the catalog on the left.
                </p>
              </div>
            ) : (
              billItems.map(item => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#1B1A18] truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#746B62] font-mono">
                      {item.sku} • {formatCurrency(item.price)} each
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#E6DCCF] rounded-lg bg-[#F7F2EA]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-[#18382D] hover:bg-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-[#18382D] font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-[#18382D] hover:bg-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-xs font-bold text-[#18382D] font-mono w-16 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#746B62] hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Discount Bar */}
          <div className="p-3.5 bg-[#F7F2EA]/70 border-t border-[#E6DCCF] space-y-2.5">
            
            {/* Customer Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[#746B62] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Customer Phone (WhatsApp bill)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#E6DCCF] rounded-lg text-xs font-mono focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#746B62] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#E6DCCF] rounded-lg text-xs focus:outline-none focus:border-[#18382D]"
                />
              </div>
            </div>

            {/* Discount Selector */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#B88D4E]" />
                <span className="font-medium text-[#746B62]">Discount:</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-[#E6DCCF]/50 p-0.5 rounded-lg border border-[#E6DCCF] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDiscountType("flat")}
                    className={`px-2 py-0.5 rounded ${discountType === "flat" ? "bg-white font-semibold text-[#18382D] shadow-2xs" : "text-[#746B62]"}`}
                  >
                    ₹ Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("percent")}
                    className={`px-2 py-0.5 rounded ${discountType === "percent" ? "bg-white font-semibold text-[#18382D] shadow-2xs" : "text-[#746B62]"}`}
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
                  className="w-16 px-2 py-1 text-xs text-right bg-white border border-[#E6DCCF] rounded-lg font-mono font-semibold"
                />

                <div className="flex gap-1">
                  {[5, 10].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => { setDiscountType("percent"); setDiscountValue(pct); }}
                      className="px-2 py-0.5 text-[10px] bg-white border border-[#E6DCCF] rounded text-[#746B62] hover:bg-[#F7F2EA] cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Totals */}
          <div className="p-4 bg-white border-t border-[#E6DCCF] space-y-3">
            
            {/* Payment Method Pills */}
            <div>
              <span className="text-[11px] font-semibold text-[#746B62] uppercase tracking-wider block mb-1.5">
                Select Payment Mode:
              </span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "bg-[#18382D] text-white border-[#18382D] font-semibold shadow-xs"
                      : "bg-white text-[#746B62] border-[#E6DCCF] hover:bg-[#F7F2EA]"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-[#B88D4E]" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "bg-[#18382D] text-white border-[#18382D] font-semibold shadow-xs"
                      : "bg-white text-[#746B62] border-[#E6DCCF] hover:bg-[#F7F2EA]"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-[#18382D] text-white border-[#18382D] font-semibold shadow-xs"
                      : "bg-white text-[#746B62] border-[#E6DCCF] hover:bg-[#F7F2EA]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>Card POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "credit"
                      ? "bg-amber-700 text-white border-amber-700 font-semibold shadow-xs"
                      : "bg-white text-amber-800 border-amber-300 hover:bg-amber-50"
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Udhaar</span>
                </button>
              </div>
            </div>

            {/* Dynamic UPI QR Panel */}
            {paymentMethod === "upi" && finalTotal > 0 && (
              <div className="p-3 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] flex items-center gap-4 animate-fadeIn">
                <img
                  src={qrCodeImageUrl}
                  alt="UPI QR Code"
                  className="w-20 h-20 border border-[#E6DCCF] rounded-lg p-1 bg-white shrink-0 shadow-2xs"
                />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-[#18382D]">Scan with Any UPI App</div>
                  <div className="text-[11px] text-[#746B62]">GPay • PhonePe • Paytm • Cred</div>
                  <div className="font-mono text-xs font-bold text-emerald-800">
                    Amount: {formatCurrency(finalTotal)}
                  </div>
                </div>
              </div>
            )}

            {/* Cash Tendered & Change Panel */}
            {paymentMethod === "cash" && finalTotal > 0 && (
              <div className="p-3 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#746B62]">Cash Received:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">₹</span>
                    <input
                      type="number"
                      value={tenderedAmount || ""}
                      onChange={(e) => setTenderedAmount(Number(e.target.value))}
                      placeholder={finalTotal.toString()}
                      className="w-24 px-2.5 py-1 text-xs text-right bg-white border border-[#E6DCCF] rounded-md font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-1.5 text-[11px]">
                  {[100, 200, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTenderedAmount(val)}
                      className="flex-1 py-1 bg-white hover:bg-[#E6DCCF] border border-[#E6DCCF] rounded text-[#18382D] font-mono cursor-pointer"
                    >
                      ₹{val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTenderedAmount(finalTotal)}
                    className="flex-1 py-1 bg-[#18382D] text-white rounded font-mono font-medium cursor-pointer"
                  >
                    Exact
                  </button>
                </div>

                {tenderedAmount >= finalTotal && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-[#E6DCCF] font-bold text-emerald-800">
                    <span>Return Change:</span>
                    <span>{formatCurrency(changeAmount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-[#746B62]">
                <span>Items Subtotal:</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-semibold text-[#18382D] pt-2 border-t border-[#E6DCCF]">
                <span>Bill Grand Total:</span>
                <span className="text-xl font-mono text-[#18382D] font-bold">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Complete Sale & Print Bill Button */}
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={billItems.length === 0}
              className={`w-full py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                billItems.length === 0
                  ? "bg-[#E6DCCF] text-[#746B62] cursor-not-allowed"
                  : "bg-[#18382D] hover:bg-[#234E3F] text-white"
              }`}
            >
              <Printer className="w-4 h-4 text-[#B88D4E]" />
              <span>Checkout &amp; Print GST Bill • {formatCurrency(finalTotal)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* POS Thermal / A4 Receipt Modal */}
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
