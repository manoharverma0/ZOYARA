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
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import POSScreen from "../POS/POSScreen";
import BarcodeStudio from "../BarcodeStudio/BarcodeStudio";
import InventoryScreen from "../Inventory/InventoryScreen";
import KhataScreen from "./KhataScreen";
import ExpenseScreen from "./ExpenseScreen";
import ReportsScreen from "./ReportsScreen";
import StoreSettingsScreen from "./StoreSettingsScreen";
import { getVyaparMetrics } from "../../services/storage";
import { formatCurrency } from "../../utils/barcode";

export default function StaffTerminal({ 
  products, 
  settings, 
  onRefreshData, 
  onExitToWebsite 
}) {
  // Active Tab: 'pos' | 'inventory' | 'khata' | 'expenses' | 'reports' | 'barcodes' | 'settings'
  const [activeStaffTab, setActiveStaffTab] = useState("pos");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const metrics = getVyaparMetrics();

  const tabs = [
    { 
      id: "pos", 
      label: "POS Billing", 
      icon: Scan, 
      desc: "Fast register & thermal print",
      badge: "Active",
      badgeColor: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
    },
    { 
      id: "inventory", 
      label: "Stock & Inventory", 
      icon: Package, 
      desc: "Real-time SKU tracker",
      badge: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} Low` : null,
      badgeColor: "bg-amber-900/60 text-amber-300 border border-amber-700/50"
    },
    { 
      id: "khata", 
      label: "Customer Khata", 
      icon: Users, 
      desc: "Udhaar ledger & reminders",
      badge: metrics.totalReceivables > 0 ? formatCurrency(metrics.totalReceivables) : null,
      badgeColor: "bg-rose-900/60 text-rose-300 font-mono border border-rose-700/50"
    },
    { 
      id: "expenses", 
      label: "Day Book & Expenses", 
      icon: BookOpen, 
      desc: "Store cash inflows & outflows",
      badge: null 
    },
    { 
      id: "reports", 
      label: "Vyapar P&L & GST", 
      icon: BarChart3, 
      desc: "Sales breakdown & tax exports",
      badge: "Reports" 
    },
    { 
      id: "barcodes", 
      label: "Barcode & Tag Studio", 
      icon: BarcodeIcon, 
      desc: "Jewellery tag label printing",
      badge: "Print" 
    },
    { 
      id: "settings", 
      label: "Settings & SEO Suite", 
      icon: SettingsIcon, 
      desc: "Live meta, Google tags & stores",
      badge: "Live" 
    }
  ];

  const currentTabObj = tabs.find(t => t.id === activeStaffTab) || tabs[0];

  return (
    <div className="min-h-screen bg-[#F7F2EA] flex font-sans no-print text-[#1B1A18]">
      
      {/* ========================================================
          1. ELEGANT LEFT SIDEBAR (DESKTOP & TABLET)
          ======================================================== */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#121A16] text-[#FFFDFA] border-r border-[#22332B] flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Sidebar Top: Prominent Brand Identity */}
        <div>
          <div className="p-5 border-b border-[#22332B] flex items-center justify-between">
            <div className="flex flex-col items-start select-none">
              <span className="font-serif text-2xl tracking-[0.16em] font-extrabold text-white leading-none">
                ZOYARA
              </span>
              <span className="text-[10px] tracking-[0.32em] text-[#B88D4E] uppercase font-bold mt-1">
                Fashion &amp; Comfort
              </span>
              <div className="flex items-center gap-1.5 mt-2.5 px-2 py-0.5 rounded-full bg-[#1E2E26] border border-[#2B4237] text-[10px] text-[#A7C0B2]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Vyapar Admin &amp; POS</span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#A7C0B2] hover:bg-[#1E2E26] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Glance */}
          <div className="p-4 mx-3 my-3 bg-[#1A2620] rounded-xl border border-[#27382F] space-y-1.5">
            <div className="text-[10px] font-semibold text-[#8DA697] uppercase tracking-wider flex items-center justify-between">
              <span>Today's Counter</span>
              <span className="text-[#B88D4E] font-mono">{new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-white font-mono leading-none">
                  {formatCurrency(metrics.todaySalesAmount || 0)}
                </div>
                <div className="text-[10px] text-[#8DA697] mt-0.5">{metrics.todaySalesCount || 0} bills booked</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-rose-300 font-mono leading-none">
                  {formatCurrency(metrics.totalReceivables || 0)}
                </div>
                <div className="text-[10px] text-[#8DA697] mt-0.5">Khata Udhaar</div>
              </div>
            </div>
          </div>

          {/* Vertical Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-none">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeStaffTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveStaffTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? "bg-[#1F3329] text-white shadow-xs font-semibold border border-[#304E3F]"
                      : "text-[#A7C0B2] hover:bg-[#18241E] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? "bg-[#B88D4E] text-white" : "bg-[#1E2E26] text-[#B88D4E] group-hover:bg-[#263A30]"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs leading-snug truncate">{tab.label}</div>
                      <div className="text-[10px] text-[#8DA697] font-normal truncate">{tab.desc}</div>
                    </div>
                  </div>

                  {tab.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ml-2 ${
                      tab.badgeColor || (isActive ? "bg-[#2D4537] text-white" : "bg-[#1E2E26] text-[#8DA697]")
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Return to Website */}
        <div className="p-4 border-t border-[#22332B] bg-[#0E1512] space-y-2">
          <button
            onClick={onExitToWebsite}
            className="w-full py-2.5 px-3 bg-[#1A2620] hover:bg-[#25372E] text-white border border-[#2D4035] rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Store className="w-3.5 h-3.5 text-[#B88D4E]" />
            <span>Back to Customer Website</span>
            <ExternalLink className="w-3 h-3 text-[#8DA697]" />
          </button>
          <div className="text-center text-[10px] text-[#6D8577]">
            ZOYARA Atelier • Terminal v2.6 Live
          </div>
        </div>
      </aside>

      {/* Overlay backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ========================================================
          2. MAIN CONTENT AREA (RIGHT)
          ======================================================== */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0">
        
        {/* Top Control Bar */}
        <header className="bg-white border-b border-[#E6DCCF] sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#18382D] hover:bg-[#F7F2EA] cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-[#746B62]">
                <span>Admin Suite</span>
                <ChevronRight className="w-3 h-3" />
                <span className="font-semibold text-[#18382D]">{currentTabObj.label}</span>
              </div>
              <h1 className="font-serif text-lg sm:text-xl font-medium text-[#18382D] leading-tight">
                {currentTabObj.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7ECE4] text-[#18382D] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Register Online</span>
            </span>

            <button
              onClick={onExitToWebsite}
              className="px-3 py-1.5 bg-[#F7F2EA] hover:bg-[#E6DCCF] text-[#18382D] border border-[#E6DCCF] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#B88D4E]" />
              <span className="hidden sm:inline">Storefront</span>
            </button>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 p-2 sm:p-5 overflow-y-auto">
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

          {activeStaffTab === "settings" && (
            <StoreSettingsScreen
              settings={settings}
              onRefreshData={onRefreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
