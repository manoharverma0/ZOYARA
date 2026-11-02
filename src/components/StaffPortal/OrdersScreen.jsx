import React, { useState, useEffect } from "react";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search, 
  ExternalLink, 
  Printer, 
  Phone, 
  MessageCircle, 
  MapPin, 
  CreditCard, 
  ChevronDown, 
  Send,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Box
} from "lucide-react";
import { getOnlineOrders, updateOnlineOrderStatus } from "../../services/storage";
import { formatCurrency } from "../../utils/barcode";
import InvoiceModal from "../Common/InvoiceModal";

export default function OrdersScreen({ settings, onRefreshData }) {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'Processing' | 'Packed' | 'Dispatched' | 'Delivered'
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Editable tracking info per order
  const [trackingForms, setTrackingForms] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const data = getOnlineOrders();
    setOrders(data);
    // Initialize tracking state
    const initialForms = {};
    data.forEach(o => {
      initialForms[o.orderId] = {
        courierName: o.courierName || "Delhivery",
        awbNumber: o.awbNumber || "",
        trackingUrl: o.trackingUrl || ""
      };
    });
    setTrackingForms(initialForms);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const currentForm = trackingForms[orderId] || {};
    const updated = updateOnlineOrderStatus(orderId, newStatus, currentForm);
    setOrders(updated);
    if (onRefreshData) onRefreshData();
  };

  const handleTrackingUpdate = (orderId, e) => {
    e.preventDefault();
    const currentForm = trackingForms[orderId] || {};
    const updated = updateOnlineOrderStatus(orderId, "Dispatched", currentForm);
    setOrders(updated);
    alert(`Order #${orderId} updated to Dispatched with Tracking AWB: ${currentForm.awbNumber}`);
    if (onRefreshData) onRefreshData();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const sendWhatsAppUpdate = (order) => {
    const form = trackingForms[order.orderId] || {};
    const courier = form.courierName || order.courierName || "Courier Partner";
    const awb = form.awbNumber || order.awbNumber || "Will be shared shortly";
    
    const message = encodeURIComponent(
      `Hello ${order.customerName || "Patron"},\n\n` +
      `✨ Thank you for choosing *${settings?.name || "ZOYARA FASHION & COMFORT"}*!\n\n` +
      `📦 *Order Status Update*\n` +
      `• *Order ID:* ${order.orderId}\n` +
      `• *Status:* ${order.status}\n` +
      `• *Courier Partner:* ${courier}\n` +
      `• *Tracking AWB:* ${awb}\n` +
      `• *Total Amount:* ₹${order.finalTotal} (${order.paymentStatus})\n\n` +
      `Your parcel is securely packed with tamper-proof seal and luxury gift pouch.\n\n` +
      `Need assistance? Reply to this message or call our helpline: ${settings?.phone || "+91 74709 32714"}.\n\n` +
      `Warm regards,\n*ZOYARA Customer Experience Desk*`
    );

    const cleanPhone = (order.customerPhone || "").replace(/\D/g, "");
    const url = `https://wa.me/91${cleanPhone}?text=${message}`;
    window.open(url, "_blank");
  };

  // Metrics
  const totalOrders = orders.length;
  const processingOrders = orders.filter(o => o.status === "Processing" || o.status === "Order Confirmed").length;
  const dispatchedOrders = orders.filter(o => o.status === "Dispatched" || o.status === "In Transit").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

  // Filtering
  const filteredOrders = orders.filter(o => {
    const matchesFilter = filterStatus === "all" || o.status?.toLowerCase() === filterStatus.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      o.orderId?.toLowerCase().includes(query) ||
      o.customerName?.toLowerCase().includes(query) ||
      o.customerPhone?.includes(query) ||
      o.shippingAddress?.city?.toLowerCase().includes(query) ||
      o.shippingAddress?.pincode?.includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Quick KPIs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6DCCF] shadow-sm">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#18382D] flex items-center gap-2">
            <span>Online Orders &amp; Fulfillment</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#18382D] text-[#B88D4E] font-sans font-bold">
              {totalOrders} Total
            </span>
          </h2>
          <p className="text-xs text-[#746B62] mt-0.5">
            Process incoming orders, print shipping labels, manage couriers &amp; notify customers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="p-2 text-[#746B62] hover:text-[#18382D] hover:bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Refresh Orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <a
            href="https://dashboard.razorpay.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-[#0C2340] hover:bg-[#143B66] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#3395FF]" />
            <span>Razorpay Dashboard</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-amber-900 text-xs font-semibold">
            <span>Pending Dispatch</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-950 mt-1">
            {processingOrders}
          </div>
          <p className="text-[11px] text-amber-800 mt-0.5">Pack &amp; hand over to courier</p>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-blue-900 text-xs font-semibold">
            <span>In Transit / Dispatched</span>
            <Truck className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-blue-950 mt-1">
            {dispatchedOrders}
          </div>
          <p className="text-[11px] text-blue-800 mt-0.5">AWB tracking active</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-emerald-900 text-xs font-semibold">
            <span>Delivered Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-950 mt-1">
            {deliveredOrders}
          </div>
          <p className="text-[11px] text-emerald-800 mt-0.5">Successfully fulfilled</p>
        </div>

        <div className="bg-[#F7F2EA] border border-[#E6DCCF] p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#18382D] text-xs font-semibold">
            <span>Online Revenue</span>
            <Package className="w-4 h-4 text-[#B88D4E]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#18382D] mt-1 font-mono">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-[#746B62] mt-0.5">Gross paid online</p>
        </div>
      </div>

      {/* 2. Search & Status Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#746B62] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Phone, Customer or City..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6DCCF] rounded-xl text-xs text-[#1B1A18] focus:outline-none focus:ring-1 focus:ring-[#18382D] shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Orders" },
            { id: "Processing", label: "Processing" },
            { id: "Dispatched", label: "Dispatched" },
            { id: "Delivered", label: "Delivered" }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterStatus(chip.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === chip.id
                  ? "bg-[#18382D] text-[#FFFDFA] shadow-sm"
                  : "bg-white text-[#746B62] border border-[#E6DCCF] hover:bg-[#F7F2EA]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E6DCCF] space-y-3">
            <Box className="w-12 h-12 text-[#B88D4E] mx-auto opacity-75" />
            <h4 className="font-serif text-lg text-[#18382D]">No Orders Match Your Criteria</h4>
            <p className="text-xs text-[#746B62] max-w-sm mx-auto">
              {searchQuery ? "Try searching for a different order ID or phone number." : "When customers place orders via Razorpay on your website, they will appear here instantly."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;
            const currentForm = trackingForms[order.orderId] || { courierName: "Delhivery", awbNumber: "" };

            return (
              <div 
                key={order.orderId}
                className="bg-white rounded-2xl border border-[#E6DCCF] shadow-sm overflow-hidden transition-all hover:border-[#B88D4E]/60"
              >
                {/* Order Summary Bar */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#F7F2EA]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-[#18382D]">
                        #{order.orderId}
                      </span>
                      <button
                        onClick={() => handleCopy(order.orderId, order.orderId)}
                        className="text-gray-400 hover:text-gray-700"
                        title="Copy Order ID"
                      >
                        {copiedOrderId === order.orderId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        order.status === "Delivered" 
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : order.status === "Dispatched"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                      }`}>
                        {order.status}
                      </span>

                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ {order.paymentMethod || "Razorpay"} ({order.paymentStatus || "Paid"})
                      </span>
                    </div>

                    <p className="text-xs text-[#746B62]">
                      Ordered on <span className="font-mono">{new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-right mr-2 hidden sm:block">
                      <div className="font-serif text-lg font-bold text-[#18382D]">
                        ₹{order.finalTotal}
                      </div>
                      <div className="text-[10px] text-[#746B62]">
                        {order.items?.length || 0} items
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="px-3 py-2 rounded-xl bg-[#F7F2EA] hover:bg-[#E6DCCF] text-[#18382D] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E6DCCF]"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#B88D4E]" />
                      <span>Print Invoice</span>
                    </button>

                    <button
                      onClick={() => sendWhatsAppUpdate(order)}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Patron</span>
                    </button>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                      className="p-2 text-[#746B62] hover:bg-[#F7F2EA] rounded-xl transition-colors cursor-pointer"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Always-Visible Compact Row */}
                <div className="p-4 sm:p-5 bg-[#FFFDFA] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer & Address */}
                  <div className="space-y-1.5 border-r md:border-[#E6DCCF] pr-4">
                    <div className="font-semibold text-sm text-[#18382D]">
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-2 text-[#746B62]">
                      <Phone className="w-3 h-3 text-[#B88D4E]" />
                      <a href={`tel:+91${order.customerPhone}`} className="hover:underline font-mono">
                        +91 {order.customerPhone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-[#746B62] pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#B88D4E] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Items Ordered */}
                  <div className="space-y-2 border-r md:border-[#E6DCCF] pr-4">
                    <span className="text-[11px] font-semibold text-[#746B62] uppercase tracking-wider block">
                      Ordered Products ({order.items?.length || 0})
                    </span>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {order.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <img 
                            src={it.image} 
                            alt={it.title}
                            className="w-9 h-9 rounded-lg object-cover border border-[#E6DCCF] shrink-0" 
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[#18382D] truncate text-[11px]">
                              {it.title}
                            </p>
                            <p className="text-[10px] text-[#746B62]">
                              Size: {it.selectedSize || "Free Size"} • Qty: {it.quantity} • ₹{it.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fulfillment Controls */}
                  <div className="space-y-3 bg-[#F7F2EA]/60 p-3.5 rounded-xl border border-[#E6DCCF]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#18382D] uppercase tracking-wider">
                        Fulfillment Status
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className="bg-white border border-[#E6DCCF] rounded-lg px-2 py-1 text-xs font-semibold text-[#18382D] cursor-pointer focus:outline-none"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    <form onSubmit={(e) => handleTrackingUpdate(order.orderId, e)} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[#746B62] block mb-0.5">Courier</label>
                          <input
                            type="text"
                            value={currentForm.courierName}
                            onChange={(e) => setTrackingForms(prev => ({
                              ...prev,
                              [order.orderId]: { ...prev[order.orderId], courierName: e.target.value }
                            }))}
                            placeholder="e.g. Delhivery"
                            className="w-full bg-white border border-[#E6DCCF] rounded-lg px-2 py-1 text-xs text-[#1B1A18] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#746B62] block mb-0.5">AWB / Tracking #</label>
                          <input
                            type="text"
                            value={currentForm.awbNumber}
                            onChange={(e) => setTrackingForms(prev => ({
                              ...prev,
                              [order.orderId]: { ...prev[order.orderId], awbNumber: e.target.value }
                            }))}
                            placeholder="e.g. 142859201"
                            className="w-full bg-white border border-[#E6DCCF] rounded-lg px-2 py-1 text-xs font-mono text-[#1B1A18] focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-[#18382D] hover:bg-[#122a22] text-[#FFFDFA] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Send className="w-3 h-3 text-[#B88D4E]" />
                        <span>Update &amp; Mark Dispatched</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Expanded Details: Financial Breakdown & Gateway Info */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-[#F7F2EA]/40 border-t border-[#E6DCCF] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <span className="font-semibold text-xs text-[#18382D]">Financial Breakdown</span>
                      <div className="space-y-1 text-[#746B62] pt-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-mono">₹{order.subtotal}</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Coupon Discount ({order.couponCode}):</span>
                            <span className="font-mono">-₹{order.discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Shipping Fee:</span>
                          <span className="font-mono">{order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (3% Composite):</span>
                          <span className="font-mono">₹{order.taxAmount || 0}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#18382D] border-t border-[#E6DCCF] pt-1">
                          <span>Final Total:</span>
                          <span className="font-mono">₹{order.finalTotal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-semibold text-xs text-[#18382D]">Payment Gateway Details</span>
                      <div className="p-3 bg-white rounded-xl border border-[#E6DCCF] space-y-1 text-[#746B62] font-mono text-[11px]">
                        <div>Transaction ID: <span className="text-[#18382D] font-bold">{order.transactionId}</span></div>
                        <div>Payment Method: <span className="text-[#18382D] font-bold">{order.paymentMethod}</span></div>
                        <div>Invoice Reference: <span className="text-[#18382D] font-bold">{order.invoiceNumber}</span></div>
                        <div>Customer Email: <span className="text-[#18382D]">{order.customerEmail || "N/A"}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Order Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
          initialFormat="a4"
        />
      )}
    </div>
  );
}
