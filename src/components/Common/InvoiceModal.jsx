import React, { useState, useEffect } from "react";
import { 
  X, 
  Printer, 
  MessageCircle, 
  CheckCircle2, 
  Share2, 
  FileText, 
  Receipt, 
  Copy, 
  Check
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { numberToIndianWords } from "../../utils/numberToWords";
import { STORE_SETTINGS } from "../../data/initialProducts";
import { printInvoiceElement } from "../../utils/printHelper";

export default function InvoiceModal({ 
  order, 
  onClose, 
  initialFormat = "a4" // 'a4' or 'thermal80' or 'thermal58'
}) {
  const [format, setFormat] = useState(initialFormat);
  const [isCopied, setIsCopied] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState(order?.customerPhone || "");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const invoiceNum = order.invoiceNumber || order.billNumber || "ZY-INV-2026-0001";
  const orderDate = order.date ? new Date(order.date) : new Date();
  const subtotal = order.subtotal || order.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0;
  const discount = order.discountAmount || 0;
  const shippingFee = order.shippingFee || 0;
  const finalTotal = order.finalTotal || (subtotal - discount + shippingFee);
  
  // Tax calculations (GST @ 3% composite for fashion jewellery & intimates)
  const gstRate = 3;
  const taxableValue = Math.round((finalTotal / (1 + (gstRate / 100))) * 100) / 100;
  const totalTax = Math.round((finalTotal - taxableValue) * 100) / 100;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax - cgst) * 100) / 100;

  const handlePrint = () => {
    printInvoiceElement("printable-bill-root", `ZOYARA-Invoice-${invoiceNum}`);
  };

  const generateWhatsAppMessage = () => {
    const itemsList = (order.items || []).map((it, idx) => 
      `${idx + 1}. *${it.title}* (${it.selectedSize || 'Free Size'}) x ${it.quantity} = ₹${it.price * it.quantity}`
    ).join("\n");

    return encodeURIComponent(
      `✨ *TAX INVOICE — ZOYARA (FASHION & COMFORT)* ✨\n` +
      `----------------------------------------\n` +
      `*Invoice No:* #${invoiceNum}\n` +
      `*Date:* ${orderDate.toLocaleDateString("en-IN")}\n` +
      `*Customer:* ${order.customerName || "Valued Patron"}\n` +
      `*Status:* ✅ ${order.paymentStatus || "PAID"}\n` +
      `*Payment Method:* ${(order.paymentMethod || 'Online').toUpperCase()}\n` +
      (order.transactionId ? `*Transaction ID:* ${order.transactionId}\n` : "") +
      `----------------------------------------\n` +
      `*ORDERED ITEMS:*\n${itemsList}\n` +
      `----------------------------------------\n` +
      `*Subtotal:* ${formatCurrency(subtotal)}\n` +
      (discount > 0 ? `*Discount Applied:* -${formatCurrency(discount)}\n` : "") +
      `*Net Taxable:* ${formatCurrency(taxableValue)}\n` +
      `*GST (3%):* ${formatCurrency(totalTax)}\n` +
      `*Grand Total:* *${formatCurrency(finalTotal)}*\n` +
      `----------------------------------------\n` +
      `📍 Store: ${STORE_SETTINGS.address || "Main Market, New Delhi"}\n` +
      `🌐 View Order: https://zoyara.vercel.app\n` +
      `_${STORE_SETTINGS.receiptFooter || "Thank you for shopping with ZOYARA Atelier!"}_ 🌸`
    );
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = (whatsappPhone || order.customerPhone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${fullPhone}?text=${generateWhatsAppMessage()}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://zoyara.vercel.app/?invoice=${invoiceNum}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#121214]/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E6DCCF] flex flex-col my-auto max-h-[95vh] overflow-hidden relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Header (hidden during print) */}
        <div className="p-4 bg-[#F7F2EA] border-b border-[#E6DCCF] flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#18382D] text-[#FFFDFA] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-[#B88D4E]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#1B1A18] leading-tight">
                Tax Invoice &amp; Official Bill
              </h3>
              <p className="text-xs text-[#746B62] font-mono">
                #{invoiceNum} • {orderDate.toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          {/* Format selector tabs */}
          <div className="flex items-center gap-1.5 bg-[#FFFDFA] p-1 rounded-xl border border-[#E6DCCF] text-xs">
            <button
              onClick={() => setFormat("a4")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                format === "a4" ? "bg-[#18382D] text-white font-medium shadow-xs" : "text-[#746B62] hover:text-[#1B1A18]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 GST Invoice</span>
            </button>
            <button
              onClick={() => setFormat("thermal80")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                format === "thermal80" ? "bg-[#18382D] text-white font-medium shadow-xs" : "text-[#746B62] hover:text-[#1B1A18]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>80mm POS</span>
            </button>
            <button
              onClick={() => setFormat("thermal58")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                format === "thermal58" ? "bg-[#18382D] text-white font-medium shadow-xs" : "text-[#746B62] hover:text-[#1B1A18]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>58mm Mini</span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E6DCCF] text-[#746B62] hover:text-[#1B1A18] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp & Quick Actions Bar */}
        <div className="px-5 py-2.5 bg-[#E7ECE4] border-b border-[#D4DFD0] flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#18382D]" />
            <span className="text-[#18382D] font-medium">WhatsApp E-Bill:</span>
            <input
              type="tel"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="10-digit mobile"
              className="px-2.5 py-1 bg-white border border-[#C2D4BE] rounded-lg text-xs font-mono w-32 focus:outline-none focus:border-[#18382D]"
            />
            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Share2 className="w-3 h-3 text-[#B88D4E]" />
              <span>Send E-Bill</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 bg-white hover:bg-[#F7F2EA] text-[#1B1A18] border border-[#C2D4BE] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? "Link Copied" : "Copy E-Link"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#B88D4E] hover:bg-[#A37B3E] text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Bill Render Area with dedicated print isolation wrapper */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#EFE9DF]/40 flex justify-center items-start">
          
          <div id="printable-bill-root" className="w-full flex justify-center">
            {format === "a4" ? (
              /* ========================================================
                 A4 LUXURY GST TAX INVOICE FORMAT
                 ======================================================== */
              <div className="tax-invoice-a4 bg-[#FFFDFA] border border-[#E6DCCF] shadow-sm rounded-xl p-6 sm:p-8 w-full max-w-3xl text-[#1B1A18] font-sans">
                
                {/* Header row with Logo, Brand & Tax Invoice badge */}
                <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-[#E6DCCF] gap-4">
                  <div>
                    <span className="font-serif text-3xl sm:text-4xl tracking-[0.2em] font-medium text-[#18382D] leading-none block">
                      ZOYARA
                    </span>
                    <span className="text-[10px] tracking-[0.35em] uppercase font-sans text-[#746B62] block mt-1 font-semibold">
                      Fashion &amp; Comfort
                    </span>
                    <p className="text-[11px] text-[#746B62] mt-2 leading-relaxed">
                      Shop 4, Luxury Arcade, Main Market, New Delhi - 110049<br />
                      GSTIN: <strong className="font-mono text-[#1B1A18]">{STORE_SETTINGS.gstin || "07AAAAZ0000A1Z5"}</strong> • State: Delhi (07)<br />
                      Phone: {STORE_SETTINGS.phone || "+91 98765 43210"} • Web: zoyara.vercel.app
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-block px-3 py-1 bg-[#18382D] text-[#B88D4E] text-[11px] font-semibold tracking-widest uppercase rounded">
                      TAX INVOICE
                    </span>
                    <div className="text-xs text-[#746B62] mt-2 space-y-0.5">
                      <div>Invoice No: <strong className="font-mono text-[#1B1A18]">#{invoiceNum}</strong></div>
                      <div>Date: <strong className="text-[#1B1A18]">{orderDate.toLocaleDateString("en-IN")}</strong></div>
                      <div>Time: {orderDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                      <div>Place of Supply: <strong className="text-[#1B1A18]">Delhi (07)</strong></div>
                    </div>
                  </div>
                </div>

                {/* Customer Billed-To & Shipped-To Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-[#E6DCCF] text-xs">
                  <div>
                    <h4 className="text-[10px] font-semibold tracking-wider text-[#746B62] uppercase mb-1">
                      Billed &amp; Shipped To:
                    </h4>
                    <p className="font-semibold text-sm text-[#1B1A18]">
                      {order.customerName || order.shippingAddress?.fullName || "Valued Patron"}
                    </p>
                    <p className="text-[#746B62] mt-0.5 leading-relaxed">
                      {order.shippingAddress?.street || order.customerAddress || "Local Store Pickup"}<br />
                      {order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ""}
                      {order.shippingAddress?.state ? `${order.shippingAddress.state} - ` : ""}
                      {order.shippingAddress?.pincode || ""}<br />
                      Phone: <span className="font-mono font-medium text-[#1B1A18]">{order.customerPhone || whatsappPhone || "N/A"}</span>
                      {order.customerEmail && <span> • Email: {order.customerEmail}</span>}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <h4 className="text-[10px] font-semibold tracking-wider text-[#746B62] uppercase mb-1">
                      Payment &amp; Logistics:
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div>
                        Payment Mode: <strong className="uppercase font-mono text-[#18382D]">{order.paymentMethod || "Online (UPI)"}</strong>
                      </div>
                      <div>
                        Payment Status: <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7ECE4] text-[#18382D]">
                          {order.paymentStatus || "PAID"}
                        </span>
                      </div>
                      {order.transactionId && (
                        <div className="text-[11px] font-mono text-[#746B62]">
                          Ref / Txn: {order.transactionId}
                        </div>
                      )}
                      <div className="text-[11px] text-[#746B62]">
                        Packaging: Complimentary Luxury Gift Box
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="py-4">
                  <table className="w-full text-left text-xs border-collapse invoice-table">
                    <thead>
                      <tr className="border-b-2 border-[#18382D] text-[10px] tracking-wider uppercase text-[#18382D] font-bold">
                        <th className="py-2.5 pr-2">#</th>
                        <th className="py-2.5 pr-2">Item Description</th>
                        <th className="py-2.5 pr-2">HSN</th>
                        <th className="py-2.5 pr-2 text-center">Size</th>
                        <th className="py-2.5 pr-2 text-center">Qty</th>
                        <th className="py-2.5 pr-2 text-right">Unit Rate</th>
                        <th className="py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6DCCF]">
                      {(order.items || []).map((item, idx) => (
                        <tr key={idx} className="py-2.5">
                          <td className="py-2.5 pr-2 font-mono text-[#746B62] text-[11px]">{idx + 1}</td>
                          <td className="py-2.5 pr-2 font-medium text-[#1B1A18]">
                            <div>{item.title}</div>
                            <div className="text-[10px] text-[#746B62] font-mono">{item.sku}</div>
                          </td>
                          <td className="py-2.5 pr-2 font-mono text-[11px] text-[#746B62]">
                            {item.hsn || (item.category === "Jewellery" ? "7117" : "6212")}
                          </td>
                          <td className="py-2.5 pr-2 text-center text-[11px] text-[#746B62]">
                            {item.selectedSize || (item.sizes && item.sizes[0]) || "Free Size"}
                          </td>
                          <td className="py-2.5 pr-2 text-center font-mono font-medium">{item.quantity}</td>
                          <td className="py-2.5 pr-2 text-right font-mono">{formatCurrency(item.price)}</td>
                          <td className="py-2.5 text-right font-mono font-semibold text-[#18382D]">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Taxes calculation breakdown */}
                <div className="pt-4 border-t-2 border-[#18382D] grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                  {/* Left: Rupee in words & Authorized Signatory */}
                  <div className="space-y-4">
                    <div className="p-3 bg-[#F7F2EA] rounded-lg border border-[#E6DCCF]">
                      <div className="text-[10px] uppercase font-bold text-[#746B62] tracking-wider mb-0.5">
                        Amount Chargeable (in words):
                      </div>
                      <div className="text-xs font-serif italic text-[#18382D] font-medium leading-relaxed">
                        {numberToIndianWords(finalTotal)}
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-[#746B62] space-y-1">
                      <div className="font-semibold text-[#1B1A18]">Declaration &amp; Warranty:</div>
                      <div>1. Certified anti-tarnish 18K gold vacuum finish. Hypoallergenic stainless core.</div>
                      <div>2. Underwear &amp; intimate garments non-returnable once opened for hygiene standards.</div>
                      <div>3. Jewellery exchange accepted within 7 days with barcode tag intact.</div>
                    </div>
                  </div>

                  {/* Right: Calculated Totals */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 text-[#746B62]">
                      <span>Subtotal (Gross):</span>
                      <span className="font-mono">{formatCurrency(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between py-1 text-emerald-800">
                        <span>Coupon / Promotional Discount:</span>
                        <span className="font-mono">-{formatCurrency(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 text-[#746B62]">
                      <span>Delivery &amp; Complimentary Packaging:</span>
                      <span className="font-mono">{shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}</span>
                    </div>

                    <div className="flex justify-between py-1 text-[#746B62]">
                      <span>Net Taxable Value:</span>
                      <span className="font-mono">{formatCurrency(taxableValue)}</span>
                    </div>

                    <div className="flex justify-between py-1 text-[#746B62] text-[11px]">
                      <span>CGST @ 1.5%:</span>
                      <span className="font-mono">{formatCurrency(cgst)}</span>
                    </div>

                    <div className="flex justify-between py-1 text-[#746B62] text-[11px]">
                      <span>SGST @ 1.5%:</span>
                      <span className="font-mono">{formatCurrency(sgst)}</span>
                    </div>

                    <div className="flex justify-between py-2.5 border-t-2 border-[#18382D] text-sm sm:text-base font-bold text-[#18382D]">
                      <span>TOTAL INVOICE AMOUNT:</span>
                      <span className="font-mono">{formatCurrency(finalTotal)}</span>
                    </div>

                    {/* Authorized Stamp */}
                    <div className="pt-4 text-right">
                      <div className="text-[10px] uppercase tracking-wider text-[#746B62]">For ZOYARA ATELIER</div>
                      <div className="h-10 flex items-center justify-end">
                        <span className="font-serif italic text-base text-[#18382D] border-b border-dashed border-[#B88D4E] pb-0.5">
                          Zoyara Signatory
                        </span>
                      </div>
                      <div className="text-[9px] text-[#746B62] font-mono">Authorised Representative</div>
                    </div>
                  </div>
                </div>

                {/* Footer Brand Line */}
                <div className="mt-8 pt-4 border-t border-dashed border-[#E6DCCF] text-center text-[10px] text-[#746B62]">
                  This is a computer-generated tax invoice verified under GST Laws. Thank you for celebrating quiet luxury with ZOYARA.
                </div>
              </div>
            ) : (
              /* ========================================================
                 THERMAL POS FORMAT (80MM OR 58MM)
                 ======================================================== */
              <div 
                className={`bg-white text-black p-4 border border-dashed border-gray-400 font-mono shadow-sm ${
                  format === "thermal58" ? "receipt-58mm" : "receipt-80mm"
                }`}
              >
                {/* Header */}
                <div className="text-center pb-2 border-b border-dashed border-gray-400">
                  <div className="font-serif text-lg font-bold uppercase tracking-widest text-black">
                    ZOYARA
                  </div>
                  <div className="text-[10px] uppercase tracking-wider">
                    Atelier &amp; Boutique
                  </div>
                  <div className="text-[9px] text-gray-700 mt-0.5">
                    {STORE_SETTINGS.address || "Shop 4, Luxury Arcade, Main Market"}
                  </div>
                  <div className="text-[9px] text-gray-700">
                    Ph: {STORE_SETTINGS.phone || "+91 98765 43210"}
                  </div>
                  <div className="text-[9px] font-bold mt-0.5">
                    GSTIN: {STORE_SETTINGS.gstin || "07AAAAZ0000A1Z5"}
                  </div>
                </div>

                {/* Meta */}
                <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>INV: #{invoiceNum}</span>
                    <span>{orderDate.toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIME: {orderDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="font-bold uppercase">{order.paymentStatus || "PAID"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MODE: {(order.paymentMethod || "Online").toUpperCase()}</span>
                    <span>POS / WEB</span>
                  </div>
                  <div className="flex justify-between text-gray-800">
                    <span>CUST: {order.customerName || "Patron"}</span>
                    <span>{order.customerPhone || whatsappPhone || ""}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-2 border-b border-dashed border-gray-400 text-[10px]">
                  <div className="flex justify-between font-bold pb-1 border-b border-gray-300">
                    <span className="w-1/2">ITEM</span>
                    <span className="w-1/4 text-center">QTY</span>
                    <span className="w-1/4 text-right">AMT</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {(order.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div className="w-1/2 pr-1">
                          <div className="font-semibold truncate">{it.title}</div>
                          <div className="text-[9px] text-gray-600 font-mono">
                            {it.sku} {it.selectedSize ? `[${it.selectedSize}]` : ""} @ ₹{it.price}
                          </div>
                        </div>
                        <div className="w-1/4 text-center">{it.quantity}</div>
                        <div className="w-1/4 text-right font-medium">₹{it.price * it.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between font-semibold">
                      <span>Discount:</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[9px] text-gray-700">
                    <span>Net Taxable:</span>
                    <span>{formatCurrency(taxableValue)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-700">
                    <span>GST (3%):</span>
                    <span>{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300">
                    <span>TOTAL AMOUNT:</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2 text-center text-[9px] text-gray-700 space-y-1">
                  <div className="font-serif italic text-black">"Crafted for Everyday Elegance"</div>
                  <div>Intimate wear non-returnable. Jewellery exchange 7 days with tag.</div>
                  <div className="text-[8px] text-gray-500 pt-1">*** THANK YOU FOR VISITING ZOYARA ***</div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Bottom Close / Action */}
        <div className="p-4 bg-[#FFFDFA] border-t border-[#E6DCCF] flex items-center justify-between no-print">
          <span className="text-xs text-[#746B62]">
            Need help with your invoice? WhatsApp +91 98765 43210
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#18382D] hover:bg-[#234E3F] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Bill
          </button>
        </div>
      </div>
    </div>
  );
}
