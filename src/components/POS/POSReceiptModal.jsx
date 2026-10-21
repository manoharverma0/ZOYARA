import React from "react";
import InvoiceModal from "../Common/InvoiceModal";

export default function POSReceiptModal({ sale, settings, onClose, onNewSale }) {
  if (!sale) return null;

  // Adapt POS sale record to unified invoice format
  const invoiceOrder = {
    orderId: `POS-${sale.billNumber}`,
    invoiceNumber: sale.billNumber,
    date: sale.date,
    status: "Completed (Store Counter)",
    paymentMethod: sale.paymentMethod === "credit" ? "UDHAAR / CREDIT" : (sale.paymentMethod || "CASH").toUpperCase(),
    paymentStatus: sale.paymentMethod === "credit" ? "Due (Udhaar)" : "Paid",
    customerName: sale.customerName || "Walk-in Patron",
    customerPhone: sale.customerPhone || "",
    items: (sale.items || []).map(i => ({
      id: i.id,
      title: i.title,
      sku: i.sku,
      price: i.price,
      quantity: i.quantity,
      selectedSize: i.selectedSize || (i.sizes && i.sizes[0]) || "Standard",
      category: i.category || "Jewellery"
    })),
    subtotal: sale.subtotal,
    discountAmount: sale.discountAmount || 0,
    taxAmount: sale.taxAmount || 0,
    finalTotal: sale.finalTotal,
    tenderedAmount: sale.tenderedAmount,
    changeAmount: sale.changeAmount
  };

  return (
    <InvoiceModal
      order={invoiceOrder}
      initialFormat={settings?.thermalSize === "80mm" ? "thermal80" : "thermal58"}
      onClose={() => {
        onClose();
        if (onNewSale) onNewSale();
      }}
    />
  );
}
