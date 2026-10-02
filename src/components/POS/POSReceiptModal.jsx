import React, { useState } from "react";
import { 
  X, 
  Printer, 
  MessageCircle, 
  CheckCircle2, 
  RotateCcw, 
  Copy, 
  Check, 
  Send 
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";

export default function POSReceiptModal({ sale, settings, onClose, onNewSale }) {
  const [paperSize, setPaperSize] = useState(settings?.thermalSize || "58mm");
  const [phoneInput, setPhoneInput] = useState(sale?.customerPhone || "");
  const [isCopied, setIsCopied] = useState(false);

  if (!sale) return null;

  const currentPhone = phoneInput.trim() || sale.customerPhone || "";

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppMessage = () => {
    const isCredit = sale.paymentMethod === "credit";
    const statusText = isCredit ? "⚠️ PENDING DUE (UDHAAR)" : "✅ FULLY PAID";

    const itemsText = sale.items
      .map((item, idx) => {
        const sizeInfo = item.selectedSize || (item.sizes && item.sizes[0]) ? ` [${item.selectedSize || item.sizes[0]}]` : "";
        return `${idx + 1}. *${item.title}*${sizeInfo}\n   ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`;
      })
      .join("\n");

    return (
      `✨ *${(settings?.name || "ZOYARA").toUpperCase()} ATELIER — E-INVOICE* ✨\n` +
      `----------------------------------------\n` +
      `*Invoice No:* #${sale.billNumber}\n` +
      `*Date:* ${new Date(sale.date).toLocaleString("en-IN")}\n` +
      `*Customer:* ${sale.customerName || "Valued Patron"}\n` +
      (settings?.gstin ? `*GSTIN:* ${settings.gstin}\n` : "") +
      `----------------------------------------\n` +
      `*ITEMS PURCHASED:*\n${itemsText}\n` +
      `----------------------------------------\n` +
      `*Subtotal:* ${formatCurrency(sale.subtotal)}\n` +
      (sale.discountAmount > 0 ? `*Discount Applied:* -${formatCurrency(sale.discountAmount)}\n` : "") +
      (sale.taxAmount > 0 ? `*GST / Tax:* ${formatCurrency(sale.taxAmount)}\n` : "") +
      `*Grand Total:* *${formatCurrency(sale.finalTotal)}*\n` +
      `*Status:* ${statusText}\n` +
      `*Payment Mode:* ${sale.paymentMethod.toUpperCase()}\n` +
      `----------------------------------------\n` +
      (settings?.upiId ? `💳 *Store UPI ID:* \`${settings.upiId}\`\n` : "") +
      `🏬 *Store Address:* ${settings?.address || "Main Market"}\n` +
      `📞 *Helpdesk:* ${settings?.phone || "+91 98765 43210"}\n` +
      `----------------------------------------\n` +
      `_${settings?.receiptFooter || "Thank you for shopping with us!"}_ 🌸`
    );
  };

  const handleSendWhatsAppBill = () => {
    if (!currentPhone) {
      alert("Please enter customer's 10-digit WhatsApp number.");
      return;
    }

    const message = encodeURIComponent(generateWhatsAppMessage());
    const cleanPhone = currentPhone.replace(/\D/g, "");
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank");
  };

  const handleCopyMessage = () => {
    const rawMsg = generateWhatsAppMessage();
    navigator.clipboard.writeText(rawMsg);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/60 backdrop-blur-xs">
      <div 
        className="bg-[#FAF8F5] w-full max-w-xl rounded-2xl shadow-2xl border border-[#DFD5C6] flex flex-col max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Format Selector */}
        <div className="p-4 bg-white border-b border-[#E8E2D8] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-semibold text-[#18181B]">Sale Invoice Generated</h3>
              <p className="text-[11px] text-[#8C7E6C] font-mono">Invoice #{sale.billNumber} • {sale.paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size Selector */}
            <div className="flex items-center bg-[#EFE9DF] p-0.5 rounded-lg border border-[#DDD2C2] text-xs">
              <button
                onClick={() => setPaperSize("58mm")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  paperSize === "58mm" ? "bg-white text-[#18181B] font-semibold shadow-xs" : "text-[#7A6D5E]"
                }`}
              >
                58mm Thermal
              </button>
              <button
                onClick={() => setPaperSize("80mm")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  paperSize === "80mm" ? "bg-white text-[#18181B] font-semibold shadow-xs" : "text-[#7A6D5E]"
                }`}
              >
                80mm POS
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EFE9DF] text-[#7A6D5E] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp Dispatch Bar */}
        <div className="px-6 py-3 bg-[#EAF7EE] border-b border-[#C8EAD1] flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs font-medium text-[#1E6B39] whitespace-nowrap">WhatsApp No:</span>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Enter 10-digit mobile..."
                className="px-2.5 py-1 text-xs bg-white border border-[#A7DBB6] rounded-lg focus:outline-none focus:border-[#25D366] w-36 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyMessage}
              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-[#FAF8F5] text-[#1E6B39] border border-[#A7DBB6] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              title="Copy WhatsApp message text"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Copied!" : "Copy Text"}</span>
            </button>

            <button
              onClick={handleSendWhatsAppBill}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Bill</span>
            </button>
          </div>
        </div>

        {/* Live Thermal Receipt Canvas Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#EBE5DB] flex justify-center items-start">
          <div 
            id="print-receipt-container"
            className={`bg-white shadow-md border border-dashed border-[#DDD2C2] text-black transition-all ${
              paperSize === "58mm" ? "receipt-58mm" : "receipt-80mm"
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {/* Store Header */}
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <div className="text-base font-bold tracking-widest uppercase font-serif">
                {settings?.name || "ZOYARA"}
              </div>
              <div className="text-[10px] tracking-wider text-gray-700 uppercase">
                {settings?.tagline || "Atelier • Lingerie & Fine Jewellery"}
              </div>
              <div className="text-[9px] text-gray-600 mt-0.5">
                {settings?.address || "Main Market, Retail Arcade"}
              </div>
              <div className="text-[9px] text-gray-600">
                Ph: {settings?.phone || "+91 98765 43210"}
              </div>
              {settings?.gstin && (
                <div className="text-[9px] text-gray-600 font-bold">GSTIN: {settings.gstin}</div>
              )}
            </div>

            {/* Bill Meta */}
            <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>INV: #{sale.billNumber}</span>
                <span>{new Date(sale.date).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>TIME: {new Date(sale.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                <span className={`uppercase font-bold ${sale.paymentMethod === "credit" ? "text-red-700" : ""}`}>
                  {sale.paymentMethod === "credit" ? "UDHAAR / CREDIT" : sale.paymentMethod}
                </span>
              </div>
              {(sale.customerPhone || currentPhone) && (
                <div className="flex justify-between text-gray-700">
                  <span>CUST: {sale.customerName || "Guest"}</span>
                  <span>{currentPhone || sale.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <div className="py-2 border-b border-dashed border-gray-400 text-[10px]">
              <div className="flex justify-between font-bold pb-1 border-b border-gray-200">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/4 text-center">QTY</span>
                <span className="w-1/4 text-right">TOTAL</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {sale.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="w-1/2 pr-1">
                      <div className="font-semibold truncate">{item.title}</div>
                      <div className="text-[9px] text-gray-500 font-mono">
                        {item.sku} @ ₹{item.price}
                      </div>
                    </div>
                    <div className="w-1/4 text-center">{item.quantity}</div>
                    <div className="w-1/4 text-right font-medium">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>Subtotal ({sale.items.reduce((a, b) => a + b.quantity, 0)} pcs):</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.discountAmount)}</span>
                </div>
              )}
              {sale.taxAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (GST):</span>
                  <span>{formatCurrency(sale.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300">
                <span>TOTAL AMOUNT:</span>
                <span>{formatCurrency(sale.finalTotal)}</span>
              </div>

              {sale.paymentMethod === "cash" && sale.tenderedAmount > 0 && (
                <div className="pt-1 text-[9px] text-gray-700 space-y-0.5 border-t border-dotted border-gray-200">
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>{formatCurrency(sale.tenderedAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change Returned:</span>
                    <span>{formatCurrency(sale.changeAmount || 0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Polite Brand Footer */}
            <div className="pt-3 pb-1 text-center text-[9px] text-gray-600 space-y-1">
              <div className="font-serif italic text-[11px] text-black">
                "Elegance is an attitude."
              </div>
              <div>{settings?.receiptFooter || "Intimate wear non-returnable. Jewellery exchange 7 days."}</div>
              <div className="text-[8px] text-gray-400 pt-1">POWERED BY ZOYARA VYAPAR POS</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar Action Buttons */}
        <div className="p-4 bg-white border-t border-[#E8E2D8] flex flex-wrap items-center justify-between gap-3 no-print">
          <button
            onClick={onNewSale}
            className="px-4 py-2 text-xs font-medium text-[#5E5245] hover:text-[#18181B] bg-[#EFE9DF] hover:bg-[#E5DDCF] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Next Customer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#18181B] hover:bg-[#2B2B30] text-[#FAF8F5] rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Print Thermal Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
