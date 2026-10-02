import React, { useState, useMemo } from "react";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  X, 
  TrendingDown
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { 
  getExpenses, 
  addExpense, 
  deleteExpense, 
  getSales 
} from "../../services/storage";

export default function ExpenseScreen({ onRefreshData }) {
  const [expenses, setExpenses] = useState(() => getExpenses());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Form State
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "Packaging",
    amount: "",
    paymentMode: "cash",
    note: ""
  });

  const categories = [
    "Packaging",
    "Store Decor",
    "Staff & Salaries",
    "Utilities & Power",
    "Refreshments & Tea",
    "Logistics & Courier",
    "Shop Rent",
    "Miscellaneous"
  ];

  const refreshExpenses = () => {
    const updated = getExpenses();
    setExpenses(updated);
    if (onRefreshData) onRefreshData();
  };

  // Day Book Computations (Today's Cash Flow)
  const sales = useMemo(() => getSales(), []);
  const todayStr = new Date().toISOString().slice(0, 10);

  const todaysSales = useMemo(() => {
    return sales.filter(s => s.date && s.date.startsWith(todayStr));
  }, [sales, todayStr]);

  const todaysExpenses = useMemo(() => {
    return expenses.filter(e => e.date && e.date.startsWith(todayStr));
  }, [expenses, todayStr]);

  const totalCashSalesToday = useMemo(() => {
    return todaysSales
      .filter(s => s.paymentMethod === "cash")
      .reduce((sum, s) => sum + s.finalTotal, 0);
  }, [todaysSales]);

  const totalCashExpensesToday = useMemo(() => {
    return todaysExpenses
      .filter(e => e.paymentMode === "cash")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [todaysExpenses]);

  const netCashInHand = totalCashSalesToday - totalCashExpensesToday;

  const totalExpensesAllTime = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.note && e.note.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [expenses, categoryFilter, searchQuery]);

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert("Please provide an expense title and valid amount.");
      return;
    }

    addExpense({
      title: expenseForm.title.trim(),
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      paymentMode: expenseForm.paymentMode,
      note: expenseForm.note.trim()
    });

    setIsAddExpenseOpen(false);
    setExpenseForm({ title: "", category: "Packaging", amount: "", paymentMode: "cash", note: "" });
    refreshExpenses();
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("Delete this expense record?")) {
      deleteExpense(id);
      refreshExpenses();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C6D3F] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Vyapar Cash Book & Day Book</span>
          </div>
          <h1 className="text-2xl font-serif text-[#18181B] font-semibold mt-1">
            Day Book & Store Expenses
          </h1>
          <p className="text-xs text-[#7A6D5E]">
            Track counter cash in vs cash out, operating overheads, and petty cash flow.
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="px-4 py-2.5 bg-[#18181B] hover:bg-[#2A2A2E] text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Record Daily Expense</span>
        </button>
      </div>

      {/* Day Book Cash Register Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {/* Cash In Today */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Today's Cash In (Sales)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            {formatCurrency(totalCashSalesToday)}
          </div>
          <p className="text-[11px] text-[#8C7E6C] mt-1">Received from counter cash sales</p>
        </div>

        {/* Cash Out Today */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Today's Cash Out (Expenses)</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2 font-mono">
            {formatCurrency(totalCashExpensesToday)}
          </div>
          <p className="text-[11px] text-[#8C7E6C] mt-1">Paid out for petty expenses today</p>
        </div>

        {/* Net Cash in Drawer */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Net Cash in Drawer</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-bold mt-2 font-mono ${netCashInHand >= 0 ? "text-[#18181B]" : "text-rose-700"}`}>
            {formatCurrency(netCashInHand)}
          </div>
          <p className="text-[11px] text-[#8C7E6C] mt-1">Cash In minus Cash Out today</p>
        </div>

        {/* All Time Overheads */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Total Store Overheads</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-800 mt-2 font-mono">
            {formatCurrency(totalExpensesAllTime)}
          </div>
          <p className="text-[11px] text-[#8C7E6C] mt-1">Cumulative operational expenses</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#DFD5C6] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C7E6C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense description or note..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl px-3 py-2 text-[#4A4036] focus:outline-none focus:border-[#18181B] cursor-pointer"
          >
            <option value="all">All Expense Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#DFD5C6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#7A6D5E] uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Expense Title & Note</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D8]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-[#8C7E6C]">
                    No expense entries found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#8C7E6C] text-[11px]">
                      {new Date(exp.date).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#18181B]">{exp.title}</div>
                      {exp.note && <div className="text-[11px] text-[#8C7E6C] mt-0.5">{exp.note}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#5A5044] border border-[#DDD2C2] rounded-full text-[10px] font-medium">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] uppercase font-medium text-[#4A4036]">
                        {exp.paymentMode}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 text-sm">
                      -{formatCurrency(exp.amount)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete expense entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#DFD5C6] max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
              <h3 className="text-base font-semibold text-[#18181B]">Record Store Expense</h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#4A4036] mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="e.g. Tea & snacks for staff, Boutique ribbon roll"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4A4036] mb-1">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A4036] mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="e.g. 250"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                    required
                  />
                </div>
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
                      onClick={() => setExpenseForm({ ...expenseForm, paymentMode: mode })}
                      className={`py-2 text-xs uppercase font-medium rounded-xl border transition-all cursor-pointer ${
                        expenseForm.paymentMode === mode
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
                  Optional Note / Receipt Details
                </label>
                <input
                  type="text"
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  placeholder="e.g. Paid to vendor via GPay, Voucher #44"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD2C2] rounded-xl focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 text-xs text-[#7A6D5E] hover:bg-[#FAF8F5] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#18181B] hover:bg-[#2E2E33] text-white rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
