import React, { useState } from "react";
import { 
  Scan, 
  Barcode as BarcodeIcon, 
  Package, 
  ExternalLink, 
  Lock, 
  Store, 
  Users, 
  BookOpen, 
  BarChart3 
} from "lucide-react";
import POSScreen from "../POS/POSScreen";
import BarcodeStudio from "../BarcodeStudio/BarcodeStudio";
import InventoryScreen from "../Inventory/InventoryScreen";
import KhataScreen from "./KhataScreen";
import ExpenseScreen from "./ExpenseScreen";
import ReportsScreen from "./ReportsScreen";
import { getVyaparMetrics } from "../../services/storage";
import { formatCurrency } from "../../utils/barcode";

export default function StaffTerminal({ 
  products, 
  settings, 
  onRefreshData, 
  onExitToWebsite 
}) {
  // Active Tab: 'pos', 'inventory', 'khata', 'expenses', 'reports', 'barcodes'
  const [activeStaffTab, setActiveStaffTab] = useState("pos");

  const metrics = getVyaparMetrics();

  const tabs = [
    { 
      id: "pos", 
      label: "POS Billing", 
      icon: Scan, 
      badge: "Fast Counter" 
    },
    { 
      id: "inventory", 
      label: "Stock & Inventory", 
      icon: Package, 
      badge: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} Low` : null,
      badgeColor: "bg-amber-100 text-amber-800"
    },
    { 
      id: "khata", 
      label: "Customer Khata (Udhaar)", 
      icon: Users, 
      badge: metrics.totalReceivables > 0 ? formatCurrency(metrics.totalReceivables) : null,
      badgeColor: "bg-rose-100 text-rose-800 font-mono"
    },
    { 
      id: "expenses", 
      label: "Day Book & Expenses", 
      icon: BookOpen, 
      badge: null 
    },
    { 
      id: "reports", 
      label: "Vyapar P&L & GST", 
      icon: BarChart3, 
      badge: "Reports" 
    },
    { 
      id: "barcodes", 
      label: "Barcode & Tag Studio", 
      icon: BarcodeIcon, 
      badge: "Print" 
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col font-sans">
      {/* Internal Staff Terminal Header */}
      <header className="bg-[#18181B] text-[#FAF8F5] border-b border-[#2E2E33] sticky top-0 z-40 shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          
          {/* Brand & Terminal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-[#D4AF37]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-widest text-lg font-normal text-white">
                  ZOYARA
                </span>
                <span className="hidden sm:inline px-2 py-0.5 text-[9px] font-mono uppercase bg-[#2E281F] text-[#D4AF37] border border-[#594622] rounded">
                  Vyapar Suite
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-[#A1A1AA] font-mono">
                POS • Khata • Inventory • P&amp;L
              </p>
            </div>
          </div>

          {/* Desktop Navigation Pill Switcher */}
          <nav className="hidden lg:flex items-center space-x-1 p-1 bg-[#27272A] rounded-xl border border-[#3F3F46]">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeStaffTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStaffTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FAF8F5] text-[#18181B] shadow-xs font-semibold"
                      : "text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46]/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#8C6D3F]" : ""}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      tab.badgeColor || (isActive ? "bg-[#EAE4D9] text-[#594622]" : "bg-[#3F3F46] text-[#D4D4D8]")
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Exit to Customer Website */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExitToWebsite}
              className="px-3.5 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] hover:text-white border border-[#3F3F46] rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title="Return to public customer store"
            >
              <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Back to Customer Website</span>
              <ExternalLink className="w-3 h-3 text-[#A1A1AA]" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scrollbar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-[#27272A] px-3 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeStaffTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStaffTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                  isActive ? "bg-white text-black font-semibold shadow-xs" : "text-[#A1A1AA] hover:bg-[#27272A]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Terminal View */}
      <main className="flex-1">
        {activeStaffTab === "pos" && (
          <POSScreen
            products={products}
            settings={settings}
            onRefreshData={onRefreshData}
          />
        )}

        {activeStaffTab === "inventory" && (
          <InventoryScreen
            products={products}
            settings={settings}
            onRefreshData={onRefreshData}
          />
        )}

        {activeStaffTab === "khata" && (
          <KhataScreen
            settings={settings}
            onRefreshData={onRefreshData}
          />
        )}

        {activeStaffTab === "expenses" && (
          <ExpenseScreen
            onRefreshData={onRefreshData}
          />
        )}

        {activeStaffTab === "reports" && (
          <ReportsScreen
            settings={settings}
          />
        )}

        {activeStaffTab === "barcodes" && (
          <BarcodeStudio
            products={products}
          />
        )}
      </main>
    </div>
  );
}
