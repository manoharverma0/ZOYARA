import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  MessageCircle, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  MapPin, 
  History, 
  X, 
  Check, 
  Trash2 
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { 
  getParties, 
  addOrUpdateParty, 
  recordPartyPayment, 
  deleteParty 
} from "../../services/storage";

export default function KhataScreen({ settings, onRefreshData }) {
  const [parties, setParties] = useState(() => getParties());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'pending', 'settled'

  // Modal states
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState(false);
  const [selectedPartyForPayment, setSelectedPartyForPayment] = useState(null);
  const [selectedPartyForHistory, setSelectedPartyForHistory] = useState(null);

  // New Party Form
  const [partyForm, setPartyForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    openingBalance: 0
  });

  // Payment Settlement Form
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paymentNote, setPaymentNote] = useState("Payment received in counter");

  const refreshParties = () => {
    const updated = getParties();
    setParties(updated);
    if (onRefreshData) onRefreshData();
  };

  // Metrics
  const totalReceivables = useMemo(() => {
    return parties.reduce((sum, p) => sum + (p.balance || 0), 0);
  }, [parties]);

  const customersWithDue = useMemo(() => {
    return parties.filter(p => (p.balance || 0) > 0).length;
  }, [parties]);

  // Filtered List
  const filteredParties = useMemo(() => {
    return parties.filter(p => {
      if (filterType === "pending" && (p.balance || 0) <= 0) return false;
      if (filterType === "settled" && (p.balance || 0) > 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.address && p.address.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [parties, filterType, searchQuery]);

  // Handle WhatsApp Payment Reminder
  const handleSendWhatsAppReminder = (party) => {
    if (!party.phone) {
      alert("Customer phone number not available.");
      return;
    }

    const storeName = settings?.name || "ZOYARA";
    const upiId = settings?.upiId || "zoyara.store@okaxis";
    const balanceStr = formatCurrency(party.balance);

    const message = encodeURIComponent(
      `✨ *PAYMENT REMINDER — ${storeName.toUpperCase()}* ✨\n\n` +
      `Dear *${party.name}* ji,\n` +
      `Warm greetings from *${storeName}*!\n\n` +
      `This is a friendly reminder regarding your pending Khata / credit balance of *${balanceStr}*.\n\n` +
      `📲 *Instant UPI Payment ID:* \`${upiId}\`\n` +
      `🏬 *Store Address:* ${settings?.address || "Main Market"}\n` +
      `📞 *Contact:* ${settings?.phone || "+91 98765 43210"}\n\n` +
      `_If you have already settled this payment, please disregard this notice. Thank you for your valued patronage!_ 🌸`
    );

    const cleanPhone = party.phone.replace(/\D/g, "");
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank");
  };

  // Submit Payment Settlement
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    recordPartyPayment(
      selectedPartyForPayment.id,
      Number(paymentAmount),
      paymentMode,
      paymentNote
    );

    setSelectedPartyForPayment(null);
    setPaymentAmount("");
    refreshParties();
  };

  const handleDeleteParty = (partyId, partyName) => {
    if (window.confirm(`Remove "${partyName}" from the Khata ledger? This cannot be undone.`)) {
      deleteParty(partyId);
      refreshParties();
    }
  };

  // Submit New Party
  const handleSaveNewParty = (e) => {
    e.preventDefault();
    if (!partyForm.name.trim() || !partyForm.phone.trim()) {
      alert("Customer name and phone number are required.");
      return;
    }

    addOrUpdateParty({
      name: partyForm.name.trim(),
      phone: partyForm.phone.trim(),
      email: partyForm.email.trim(),
      address: partyForm.address.trim(),
      balance: Number(partyForm.openingBalance || 0)
    });

    setIsAddPartyModalOpen(false);
    setPartyForm({ name: "", phone: "", email: "", address: "", openingBalance: 0 });
    refreshParties();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & KPI Stat Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C6D3F] uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Vyapar Party & Khata Ledger</span>
          </div>
          <h1 className="text-2xl font-serif text-[#18181B] font-semibold mt-1">
            Customer Credit & Udhaar Management
          </h1>
          <p className="text-xs text-[#7A6D5E]">
            Track customer balances, settle counter payments, and send 1-click WhatsApp reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddPartyModalOpen(true)}
          className="px-4 py-2.5 bg-[#18181B] hover:bg-[#2A2A2E] text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Add New Customer Party</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Total Receivables (Udhaar)</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#92400E] mt-2 font-mono">
            {formatCurrency(totalReceivables)}
          </div>
          <p className="text-[11px] text-[#8C7E6C] mt-1">Pending payment across {customersWithDue} customer(s)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Total Registered Parties</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#18181B] mt-2 font-mono">
            {parties.length}
          </div>
          <p className="text-[11px] text-[#8C7E6C] mt-1">Customers enrolled in ZOYARA Khata</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Settled Accounts</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            {parties.filter(p => (p.balance || 0) <= 0).length}
          </div>
          <p className="text-[11px] text-[#8C7E6C] mt-1">Accounts with zero pending dues</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DFD5C6] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C7E6C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterType === "all" ? "bg-[#18181B] text-white" : "bg-[#FAF8F5] text-[#7A6D5E] hover:bg-[#EFE9DF]"
            }`}
          >
            All Parties ({parties.length})
          </button>
          <button
            onClick={() => setFilterType("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterType === "pending" ? "bg-amber-600 text-white" : "bg-[#FAF8F5] text-[#7A6D5E] hover:bg-[#EFE9DF]"
            }`}
          >
            Pending Due ({customersWithDue})
          </button>
          <button
            onClick={() => setFilterType("settled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterType === "settled" ? "bg-emerald-700 text-white" : "bg-[#FAF8F5] text-[#7A6D5E] hover:bg-[#EFE9DF]"
            }`}
          >
            Settled
          </button>
        </div>
      </div>

      {/* Customer Parties Table */}
      <div className="bg-white rounded-2xl border border-[#DFD5C6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#7A6D5E] uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Contact & Location</th>
                <th className="py-3 px-4 text-right">Total Billed</th>
                <th className="py-3 px-4 text-right">Pending Due (Udhaar)</th>
                <th className="py-3 px-4 text-center">Khata Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D8]">
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-[#8C7E6C]">
                    No customer parties found matching your search.
                  </td>
                </tr>
              ) : (
                filteredParties.map((party) => {
                  const hasDue = (party.balance || 0) > 0;

                  return (
                    <tr key={party.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#18181B] flex items-center gap-2">
                          <span>{party.name}</span>
                          {hasDue ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-100 text-amber-800 font-bold">
                              DUE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                              CLEARED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8C7E6C] font-mono">
                          Joined: {party.createdAt ? new Date(party.createdAt).toLocaleDateString("en-IN") : "Recent"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#5A5044]">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#8C7E6C]" />
                          <span>{party.phone}</span>
                        </div>
                        {party.address && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#8C7E6C] mt-0.5">
                            <MapPin className="w-3 h-3 text-[#8C7E6C]" />
                            <span className="truncate max-w-xs">{party.address}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-[#18181B]">
                        {formatCurrency(party.totalPurchases || 0)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={hasDue ? "text-amber-700 text-sm" : "text-emerald-700"}>
                          {formatCurrency(party.balance || 0)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Settle Payment Button */}
                          {hasDue && (
                            <button
                              onClick={() => {
                                setSelectedPartyForPayment(party);
                                setPaymentAmount(party.balance);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-all text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Record payment received"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Settle</span>
                            </button>
                          )}

                          {/* WhatsApp Reminder Button */}
                          {hasDue && (
                            <button
                              onClick={() => handleSendWhatsAppReminder(party)}
                              className="px-2.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#146C36] border border-[#25D366]/40 rounded-lg font-medium transition-all text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Send 1-Click WhatsApp Payment Reminder"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                              <span>WhatsApp</span>
                            </button>
                          )}

                          {/* View History */}
                          <button
                            onClick={() => setSelectedPartyForHistory(party)}
                            className="p-1.5 rounded-lg hover:bg-[#EFE9DF] text-[#7A6D5E] transition-colors cursor-pointer"
                            title="View Payment & Khata History"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Delete Party */}
                          <button
                            onClick={() => handleDeleteParty(party.id, party.name)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-[#A39686] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove customer from Khata"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Settle Payment */}
      {selectedPartyForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#DFD5C6] max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
              <div>
                <h3 className="text-base font-semibold text-[#18181B]">Record Payment Settlement</h3>
                <p className="text-xs text-[#7A6D5E] font-mono">Customer: {selectedPartyForPayment.name}</p>
              </div>
              <button
                onClick={() => setSelectedPartyForPayment(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 pt-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                <span className="text-amber-900">Total Outstanding Balance:</span>
                <span className="font-mono font-bold text-amber-900 text-sm">
                  {formatCurrency(selectedPartyForPayment.balance)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4036] mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedPartyForPayment.balance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4036] mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["cash", "upi", "card"].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 text-xs uppercase font-medium rounded-xl border transition-all cursor-pointer ${
                        paymentMode === mode
                          ? "bg-[#18181B] text-white border-[#18181B]"
                          : "bg-[#FAF8F5] text-[#5A5044] border-[#DDD2C2]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4036] mb-1">
                  Settlement Note
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPartyForPayment(null)}
                  className="px-4 py-2 text-xs text-[#7A6D5E] hover:bg-[#FAF8F5] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Customer Party */}
      {isAddPartyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#DFD5C6] max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
              <h3 className="text-base font-semibold text-[#18181B]">Add Customer to Khata</h3>
              <button
                onClick={() => setIsAddPartyModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewParty} className="space-y-3 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#4A4036] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={partyForm.name}
                  onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4036] mb-1">
                  Mobile Number (for WhatsApp Bill) *
                </label>
                <input
                  type="tel"
                  value={partyForm.phone}
                  onChange={(e) => setPartyForm({ ...partyForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4036] mb-1">
                  Address / City
                </label>
                <input
                  type="text"
                  value={partyForm.address}
                  onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
                  placeholder="e.g. Sector 15, Near City Plaza"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4036] mb-1">
                  Opening Udhaar / Balance (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={partyForm.openingBalance}
                  onChange={(e) => setPartyForm({ ...partyForm, openingBalance: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartyModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#7A6D5E] hover:bg-[#FAF8F5] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#18181B] hover:bg-[#2E2E33] text-white rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Customer Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Customer Khata Payment History */}
      {selectedPartyForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#DFD5C6] max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
              <div>
                <h3 className="text-base font-semibold text-[#18181B]">{selectedPartyForHistory.name} — Khata History</h3>
                <p className="text-xs text-[#7A6D5E] font-mono">Mobile: {selectedPartyForHistory.phone}</p>
              </div>
              <button
                onClick={() => setSelectedPartyForHistory(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 max-h-80 overflow-y-auto">
              <div className="flex justify-between p-3 bg-[#FAF8F5] rounded-xl text-xs font-mono">
                <span>Current Balance Due:</span>
                <span className="font-bold text-amber-800">{formatCurrency(selectedPartyForHistory.balance || 0)}</span>
              </div>

              <h4 className="text-xs font-semibold text-[#4A4036] uppercase tracking-wider">Settlement Records</h4>
              {(!selectedPartyForHistory.paymentHistory || selectedPartyForHistory.paymentHistory.length === 0) ? (
                <p className="text-xs text-[#8C7E6C] text-center py-6">No historical settlements recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedPartyForHistory.paymentHistory.map((rec) => (
                    <div key={rec.id} className="p-3 border border-[#E8E2D8] rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-emerald-800">
                          +{formatCurrency(rec.amount)} ({rec.paymentMode.toUpperCase()})
                        </div>
                        <div className="text-[10px] text-[#8C7E6C]">{rec.note}</div>
                      </div>
                      <div className="text-right text-[10px] text-[#8C7E6C] font-mono">
                        {new Date(rec.date).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E2D8] flex justify-end">
              <button
                onClick={() => setSelectedPartyForHistory(null)}
                className="px-4 py-2 text-xs font-medium bg-[#18181B] text-white rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
