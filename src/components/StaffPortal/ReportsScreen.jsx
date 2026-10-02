import React, { useState, useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Printer, 
  Package, 
  FileText, 
  Award
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { 
  getSales, 
  getExpenses, 
  getProducts, 
  getParties
} from "../../services/storage";

export default function ReportsScreen({ settings }) {
  const [reportPeriod, setReportPeriod] = useState("all"); // 'today', 'month', 'all'
  const sales = getSales();
  const expenses = getExpenses();
  const products = getProducts();
  const parties = getParties();

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  // Period-filtered sales & expenses
  const filteredSales = useMemo(() => {
    if (reportPeriod === "today") return sales.filter(s => s.date && s.date.startsWith(todayStr));
    if (reportPeriod === "month") return sales.filter(s => s.date && s.date.startsWith(currentMonthStr));
    return sales;
  }, [sales, reportPeriod, todayStr, currentMonthStr]);

  const filteredExpenses = useMemo(() => {
    if (reportPeriod === "today") return expenses.filter(e => e.date && e.date.startsWith(todayStr));
    if (reportPeriod === "month") return expenses.filter(e => e.date && e.date.startsWith(currentMonthStr));
    return expenses;
  }, [expenses, reportPeriod, todayStr, currentMonthStr]);

  // Financial Calculations
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.finalTotal, 0);
  const totalUnitsSold = filteredSales.reduce(
    (sum, s) => sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );

  const totalCOGS = filteredSales.reduce((sum, s) => {
    const cost = s.items.reduce((c, item) => {
      const p = products.find(prod => prod.id === item.id);
      return c + (p ? p.costPrice * item.quantity : 0);
    }, 0);
    return sum + cost;
  }, 0);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const netMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Stock Valuation
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalCostValuation = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.costPrice || 0)), 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);
  const unrealizedProfit = totalRetailValuation - totalCostValuation;

  // Receivables
  const totalReceivables = parties.reduce((sum, p) => sum + (p.balance || 0), 0);

  // Top Selling Items
  const topProducts = useMemo(() => {
    const map = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!map[item.id]) {
          map[item.id] = {
            id: item.id,
            title: item.title,
            sku: item.sku,
            category: item.category || "Jewellery",
            qty: 0,
            revenue: 0
          };
        }
        map[item.id].qty += item.quantity;
        map[item.id].revenue += item.quantity * item.price;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  // CSV Export Generators
  const exportSalesCSV = () => {
    const headers = ["Invoice Number", "Date", "Customer Name", "Customer Phone", "Payment Method", "Items Count", "Subtotal", "Discount", "Tax", "Grand Total"];
    const rows = sales.map(s => [
      s.billNumber,
      new Date(s.date).toISOString().slice(0, 10),
      `"${s.customerName || "Walk-in Guest"}"`,
      s.customerPhone || "",
      s.paymentMethod,
      s.items.reduce((sum, i) => sum + i.quantity, 0),
      s.subtotal,
      s.discountAmount || 0,
      s.taxAmount || 0,
      s.finalTotal
    ]);

    downloadCSVFile([headers, ...rows], `ZOYARA_Sales_Report_${todayStr}.csv`);
  };

  const exportStockCSV = () => {
    const headers = ["SKU", "Barcode", "Product Title", "Category", "SubCategory", "Selling Price", "Cost Price", "Current Stock", "Cost Valuation", "Retail Valuation"];
    const rows = products.map(p => [
      p.sku,
      p.barcode || "",
      `"${p.title}"`,
      p.category,
      p.subCategory || "",
      p.price,
      p.costPrice || 0,
      p.stock || 0,
      (p.stock || 0) * (p.costPrice || 0),
      (p.stock || 0) * (p.price || 0)
    ]);

    downloadCSVFile([headers, ...rows], `ZOYARA_Stock_Valuation_${todayStr}.csv`);
  };

  const exportExpensesCSV = () => {
    const headers = ["Date", "Expense Title", "Category", "Payment Mode", "Amount", "Note"];
    const rows = expenses.map(e => [
      new Date(e.date).toISOString().slice(0, 10),
      `"${e.title}"`,
      e.category,
      e.paymentMode,
      e.amount,
      `"${e.note || ""}"`
    ]);

    downloadCSVFile([headers, ...rows], `ZOYARA_Expenses_${todayStr}.csv`);
  };

  const downloadCSVFile = (dataArray, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + dataArray.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C6D3F] uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Vyapar Premium Analytics & Auditing</span>
          </div>
          <h1 className="text-2xl font-serif text-[#18181B] font-semibold mt-1">
            Profit & Loss, GST & Business Reports
          </h1>
          <p className="text-xs text-[#7A6D5E]">
            Financial transparency for retail operations, inventory valuation, and tax accounting.
          </p>
        </div>

        {/* Period Filter & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#DFD5C6] text-xs">
            <button
              onClick={() => setReportPeriod("today")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportPeriod === "today" ? "bg-[#18181B] text-white font-medium" : "text-[#7A6D5E] hover:bg-[#FAF8F5]"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setReportPeriod("month")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportPeriod === "month" ? "bg-[#18181B] text-white font-medium" : "text-[#7A6D5E] hover:bg-[#FAF8F5]"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setReportPeriod("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportPeriod === "all" ? "bg-[#18181B] text-white font-medium" : "text-[#7A6D5E] hover:bg-[#FAF8F5]"
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={exportSalesCSV}
            className="px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#18181B] border border-[#DDD2C2] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Download Sales Register CSV for CA / Tax"
          >
            <Download className="w-3.5 h-3.5 text-[#8C6D3F]" />
            <span>Sales CSV</span>
          </button>

          <button
            onClick={exportStockCSV}
            className="px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#18181B] border border-[#DDD2C2] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Download Stock Valuation Report"
          >
            <Download className="w-3.5 h-3.5 text-[#8C6D3F]" />
            <span>Stock CSV</span>
          </button>

          <button
            onClick={exportExpensesCSV}
            className="px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#18181B] border border-[#DDD2C2] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Download Expenses Register CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#8C6D3F]" />
            <span>Expenses CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-[#18181B] hover:bg-[#2A2A2E] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs no-print"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Profit & Loss Statement Card */}
      <div className="bg-white rounded-2xl border border-[#DFD5C6] shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-serif font-bold text-[#18181B]">
              Vyapar Profit & Loss Statement ({reportPeriod.toUpperCase()})
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8C7E6C]">
            Based on {filteredSales.length} invoices & {filteredExpenses.length} expense vouchers
          </span>
        </div>

        {/* P&L Numbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
          {/* Revenue */}
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8]">
            <div className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Gross Sales (Revenue)</div>
            <div className="text-xl font-bold font-mono text-[#18181B] mt-1">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-[10px] text-[#8C7E6C] mt-1">{totalUnitsSold} items sold</p>
          </div>

          {/* COGS */}
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8]">
            <div className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Cost of Goods (COGS)</div>
            <div className="text-xl font-bold font-mono text-amber-800 mt-1">
              -{formatCurrency(totalCOGS)}
            </div>
            <p className="text-[10px] text-[#8C7E6C] mt-1">Direct product inventory cost</p>
          </div>

          {/* Gross Profit */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <div className="text-xs font-medium text-emerald-900 uppercase tracking-wider">Gross Margin</div>
            <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
              {formatCurrency(grossProfit)}
            </div>
            <p className="text-[10px] text-emerald-700 mt-1">Revenue minus COGS</p>
          </div>

          {/* Operating Expenses */}
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8]">
            <div className="text-xs font-medium text-[#7A6D5E] uppercase tracking-wider">Store Overheads</div>
            <div className="text-xl font-bold font-mono text-rose-700 mt-1">
              -{formatCurrency(totalExpenses)}
            </div>
            <p className="text-[10px] text-[#8C7E6C] mt-1">From Day Book logs</p>
          </div>

          {/* Net Business Profit */}
          <div className="p-4 bg-black text-white rounded-xl shadow-md border border-[#333]">
            <div className="text-xs font-medium text-[#D4AF37] uppercase tracking-wider flex items-center justify-between">
              <span>Net Business Profit</span>
              <span className="font-mono text-[11px]">{netMarginPercent}%</span>
            </div>
            <div className={`text-2xl font-bold font-mono mt-1 ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Clear in-pocket bottom line</p>
          </div>
        </div>
      </div>

      {/* Second Row: Stock Valuation & Udhaar/Khata Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Stock Valuation Card */}
        <div className="bg-white rounded-2xl border border-[#DFD5C6] shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8C6D3F]" />
              <h3 className="text-sm font-semibold text-[#18181B]">Inventory Asset Valuation</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-800 font-semibold">
              {totalStockUnits} Pieces in Stock
            </span>
          </div>

          <div className="space-y-3.5 pt-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-[#E8E2D8]">
              <span className="text-[#5A5044]">Total Stock Purchase Value (Cost):</span>
              <span className="font-mono font-bold text-[#18181B] text-sm">
                {formatCurrency(totalCostValuation)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dashed border-[#E8E2D8]">
              <span className="text-[#5A5044]">Total Retail Selling Value (MRP):</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                {formatCurrency(totalRetailValuation)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dashed border-[#E8E2D8]">
              <span className="text-[#5A5044]">Projected Retail Margin in Stock:</span>
              <span className="font-mono font-bold text-blue-700">
                +{formatCurrency(unrealizedProfit)}
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl text-[11px] text-[#7A6D5E] leading-relaxed">
              💡 <strong>Vyapar Insight:</strong> Your store holds {formatCurrency(totalRetailValuation)} worth of fast-moving Jewellery, Bras, and Panties. Replenish items whose stock drops below 5 units.
            </div>
          </div>
        </div>

        {/* GST & Khata Receivables Summary */}
        <div className="bg-white rounded-2xl border border-[#DFD5C6] shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8C6D3F]" />
              <h3 className="text-sm font-semibold text-[#18181B]">Taxation & Outstanding Credit (Udhaar)</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 text-amber-800 font-semibold">
              GSTIN: {settings?.gstin || "Composition"}
            </span>
          </div>

          <div className="space-y-3.5 pt-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-[#E8E2D8]">
              <span className="text-[#5A5044]">Total Taxable Turnover (All Sales):</span>
              <span className="font-mono font-bold text-[#18181B] text-sm">
                {formatCurrency(totalRevenue)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dashed border-[#E8E2D8]">
              <span className="text-[#5A5044]">Tax / GST Collected:</span>
              <span className="font-mono font-bold text-emerald-800">
                {formatCurrency(filteredSales.reduce((s, b) => s + (b.taxAmount || 0), 0))}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dashed border-[#E8E2D8]">
              <span className="text-[#5A5044]">Current Market Receivables (Customer Udhaar):</span>
              <span className="font-mono font-bold text-amber-800 text-sm">
                {formatCurrency(totalReceivables)}
              </span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              🔔 <strong>Udhaar Alert:</strong> You have {formatCurrency(totalReceivables)} in pending customer credit. Use the <strong>Khata & Parties</strong> tab to send instant WhatsApp payment reminders.
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products Leaderboard */}
      <div className="bg-white rounded-2xl border border-[#DFD5C6] shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-sm font-semibold text-[#18181B]">Bestseller Creations Leaderboard</h3>
          </div>
          <span className="text-xs text-[#8C7E6C]">Ranked by customer demand</span>
        </div>

        <div className="divide-y divide-[#E8E2D8] pt-2">
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#8C7E6C]">
              No sales logged yet to determine bestsellers.
            </p>
          ) : (
            topProducts.map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#DDD2C2] flex items-center justify-center font-bold text-[11px] text-[#8C6D3F]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-[#18181B]">{item.title}</div>
                    <div className="text-[10px] text-[#8C7E6C] font-mono">
                      SKU: {item.sku} • Category: {item.category}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-800">{item.qty} units sold</div>
                  <div className="text-[10px] text-[#8C7E6C]">{formatCurrency(item.revenue)} total revenue</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
