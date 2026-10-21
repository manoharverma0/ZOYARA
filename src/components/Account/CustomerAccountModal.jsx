import React, { useState } from "react";
import { 
  X, 
  User, 
  Package, 
  MapPin, 
  FileText, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Phone,
  Mail
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { getOnlineOrders, logoutCustomer } from "../../services/storage";

export default function CustomerAccountModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onLogout,
  onViewInvoice 
}) {
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'profile' | 'addresses'

  if (!isOpen) return null;

  const allOrders = getOnlineOrders();
  // Filter orders matching current user's phone or show all if guest/patron
  const userOrders = currentUser
    ? allOrders.filter(o => o.customerPhone?.replace(/\D/g, "") === currentUser.phone?.replace(/\D/g, ""))
    : allOrders;

  const handleLogout = () => {
    logoutCustomer();
    onLogout();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#121214]/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E6DCCF] flex flex-col my-auto max-h-[92vh] overflow-hidden relative text-[#1B1A18]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#F7F2EA] border-b border-[#E6DCCF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center font-serif text-lg font-bold">
              {currentUser?.name?.charAt(0) || "Z"}
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-[#18382D] leading-tight">
                {currentUser?.name || "Patron Account"}
              </h3>
              <p className="text-xs text-[#746B62] font-mono">
                +91 {currentUser?.phone || "Guest"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#E6DCCF] text-[#746B62] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E6DCCF] bg-white px-5 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "orders" ? "border-[#18382D] text-[#18382D]" : "border-transparent text-[#746B62] hover:text-[#1B1A18]"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Order History ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "profile" ? "border-[#18382D] text-[#18382D]" : "border-transparent text-[#746B62] hover:text-[#1B1A18]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "addresses" ? "border-[#18382D] text-[#18382D]" : "border-transparent text-[#746B62] hover:text-[#1B1A18]"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved Addresses</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#FFFDFA]">
          {activeTab === "orders" && (
            <div className="space-y-4">
              {userOrders.length === 0 ? (
                <div className="py-12 text-center text-[#746B62]">
                  <Package className="w-12 h-12 mx-auto text-[#B88D4E] mb-3 opacity-60" />
                  <p className="font-serif text-lg text-[#1B1A18] mb-1">No orders yet</p>
                  <p className="text-xs max-w-xs mx-auto">
                    Explore our curated collection of fine anti-tarnish jewellery and wirefree intimates.
                  </p>
                </div>
              ) : (
                userOrders.map((ord) => (
                  <div 
                    key={ord.orderId}
                    className="p-4 sm:p-5 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F7F2EA] text-xs">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#18382D]">
                          #{ord.orderId}
                        </span>
                        <span className="text-[#746B62] ml-2">
                          • {new Date(ord.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          ord.status === "Delivered" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-[#E7ECE4] text-[#18382D] border border-[#C2D4BE]"
                        }`}>
                          {ord.status}
                        </span>
                        
                        {/* Instant Bill / Invoice Viewer Button */}
                        <button
                          onClick={() => onViewInvoice(ord)}
                          className="px-3 py-1 bg-[#F7F2EA] hover:bg-[#E6DCCF] text-[#18382D] rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 border border-[#E6DCCF]"
                          title="View and print official GST Tax Bill"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#B88D4E]" />
                          <span>View Tax Bill</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Items preview */}
                    <div className="space-y-2">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 object-cover rounded-md bg-[#F7F2EA] border border-[#E6DCCF] shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#1B1A18] truncate">{item.title}</div>
                            <div className="text-[11px] text-[#746B62] font-mono">
                              Size: {item.selectedSize || "Free Size"} • Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="font-mono font-semibold text-[#18382D]">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer with total and tracking timeline */}
                    <div className="pt-3 border-t border-[#F7F2EA] flex flex-wrap items-center justify-between text-xs text-[#746B62] gap-2">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#B88D4E]" />
                        <span>Delivery Address: {ord.shippingAddress?.city || "New Delhi"}, {ord.shippingAddress?.pincode}</span>
                      </div>
                      <div className="text-right">
                        <span>Total Paid: </span>
                        <strong className="font-mono text-sm text-[#18382D]">{formatCurrency(ord.finalTotal)}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-md space-y-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                  <User className="w-4 h-4 text-[#B88D4E]" />
                  <span>Patron Information</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[#746B62] block text-[11px]">Full Name</span>
                    <span className="font-medium text-sm text-[#1B1A18]">{currentUser?.name || "ZOYARA Patron"}</span>
                  </div>
                  <div>
                    <span className="text-[#746B62] block text-[11px]">Primary Mobile (OTP Verified)</span>
                    <span className="font-mono text-sm text-[#1B1A18]">+91 {currentUser?.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#746B62] block text-[11px]">Email Address</span>
                    <span className="text-sm text-[#1B1A18]">{currentUser?.email || "Not specified"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="max-w-md space-y-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#18382D]">Default Delivery Address</span>
                  <span className="text-[10px] bg-[#E7ECE4] text-[#18382D] px-2 py-0.5 rounded font-medium">Default</span>
                </div>
                <p className="text-[#746B62] leading-relaxed">
                  {currentUser?.address || "B-42, South Extn, Part 2"}<br />
                  {currentUser?.city || "New Delhi"} - {currentUser?.pincode || "110049"}, India<br />
                  Phone: +91 {currentUser?.phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
