import React, { useState, useMemo } from "react";
import { 
  Package, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Receipt, 
  Store, 
  RefreshCw, 
  CheckCircle2,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import { formatCurrency } from "../../utils/barcode";
import { 
  getSales, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  exportDatabaseBackup, 
  importDatabaseBackup,
  saveStoreSettings,
  resetAllDataToDefault
} from "../../services/storage";
import POSReceiptModal from "../POS/POSReceiptModal";

export default function InventoryScreen({ products, settings, onRefreshData }) {
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog', 'sales', 'settings'
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Add/Edit Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "",
    sku: "",
    barcode: "",
    category: "Jewellery",
    subCategory: "Earrings",
    price: 249,
    costPrice: 90,
    stock: 20,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    description: "",
    material: "",
    badge: ""
  });

  // Settings form state
  const [storeSettingsForm, setStoreSettingsForm] = useState({ ...settings });
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  // Sales History & Receipt reprint state
  const sales = useMemo(() => getSales(), []);
  const [reprintSale, setReprintSale] = useState(null);

  // KPI Calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysSales = sales.filter(s => s.date && s.date.startsWith(todayStr));

  const todaysRevenue = todaysSales.reduce((sum, s) => sum + s.finalTotal, 0);
  const todaysUnitsSold = todaysSales.reduce(
    (sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0),
    0
  );

  const todaysProfit = todaysSales.reduce((sum, s) => {
    const saleCost = s.items.reduce((cSum, item) => {
      const prod = products.find(p => p.id === item.id);
      return cSum + (prod ? prod.costPrice * item.quantity : 0);
    }, 0);
    return sum + (s.finalTotal - saleCost);
  }, 0);

  const lowStockCount = products.filter(p => p.stock <= 5).length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
        );
      }
      return true;
    });
  }, [products, categoryFilter, searchQuery]);

  // Handle Add Product
  const handleOpenAddModal = () => {
    const newBarcode = generateRandomBarcode("Jewellery");
    const nextSkuNum = (products.length + 1).toString().padStart(2, "0");
    setProductForm({
      title: "",
      sku: `ZY-JWL-${nextSkuNum}`,
      barcode: newBarcode,
      category: "Jewellery",
      subCategory: "Earrings",
      price: 249,
      costPrice: 90,
      stock: 25,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      description: "Handcrafted minimalist everyday creation.",
      material: "Anti-Tarnish 18K Polish",
      badge: "New Arrival"
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setProductForm({ ...prod });
    setEditingProduct(prod);
    setIsAddModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setProductForm(prev => ({ ...prev, image: compressedDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.sku) {
      alert("Please enter Product Title and SKU");
      return;
    }

    if (editingProduct) {
      updateProduct({ ...productForm, id: editingProduct.id });
    } else {
      addProduct({ ...productForm, id: "prod-" + Date.now() });
    }

    setIsAddModalOpen(false);
    onRefreshData();
  };

  const handleDeleteProduct = (id, title) => {
    if (window.confirm(`Delete product "${title}" from catalog?`)) {
      deleteProduct(id);
      onRefreshData();
    }
  };

  const handleStockQuickAdjust = (prod, change) => {
    const newStock = Math.max(0, (prod.stock || 0) + change);
    updateProduct({ ...prod, stock: newStock });
    onRefreshData();
  };

  // Settings Save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveStoreSettings(storeSettingsForm);
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 3000);
    onRefreshData();
  };

  // File Import for Backup
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = importDatabaseBackup(evt.target.result);
      if (res.success) {
        alert("Database backup restored successfully!");
        onRefreshData();
      } else {
        alert("Failed to import backup: " + res.error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4EFE6] p-4 sm:p-6 no-print">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top KPIs Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#DFD5C6] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8C7E6C] uppercase tracking-wider font-semibold">
                Today's Revenue
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#18181B] mt-0.5">
                {formatCurrency(todaysRevenue)}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">
                {todaysSales.length} bills settled
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#DDD2C2] flex items-center justify-center text-[#D4AF37]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#DFD5C6] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8C7E6C] uppercase tracking-wider font-semibold">
                Units Sold Today
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#18181B] mt-0.5">
                {todaysUnitsSold} pcs
              </div>
              <div className="text-[10px] text-[#6E6152] mt-0.5">Jewellery & Intimates</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#DDD2C2] flex items-center justify-center text-[#8C6D3F]">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#DFD5C6] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8C7E6C] uppercase tracking-wider font-semibold">
                Today's Est. Profit
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-0.5">
                {formatCurrency(todaysProfit)}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Net margin after cost</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#DFD5C6] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8C7E6C] uppercase tracking-wider font-semibold">
                Low Stock Alert
              </span>
              <div className={`text-xl sm:text-2xl font-bold font-mono mt-0.5 ${lowStockCount > 0 ? "text-amber-700" : "text-[#18181B]"}`}>
                {lowStockCount} items
              </div>
              <div className="text-[10px] text-[#6E6152] mt-0.5">Stock &le; 5 units</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Catalog vs Sales Ledger vs Store Settings) */}
        <div className="flex items-center justify-between border-b border-[#DFD5C6] pb-2">
          <div className="flex items-center gap-2">
            {[
              { id: "catalog", label: "Product Catalog & Stock", icon: Package },
              { id: "sales", label: "Daily Sales History", icon: Receipt },
              { id: "settings", label: "Shop Settings & Backups", icon: Store }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[#18181B] text-[#FAF8F5] shadow-xs"
                      : "bg-white text-[#6E6152] hover:bg-[#EFE9DF] border border-[#DFD5C6]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D4AF37]" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "catalog" && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#18181B] hover:bg-[#2B2B30] text-[#FAF8F5] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add New Product</span>
            </button>
          )}
        </div>

        {/* TAB 1: PRODUCT CATALOG & STOCK */}
        {activeTab === "catalog" && (
          <div className="bg-white rounded-2xl border border-[#DFD5C6] shadow-xs overflow-hidden">
            
            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-[#E8E2D8] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8C7E6C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by SKU, Barcode, or Name..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DFD5C6] rounded-xl focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {[
                  { id: "all", label: "All Stock" },
                  { id: "Jewellery", label: "💎 Jewellery" },
                  { id: "Bras", label: "👙 Bras & Bralettes" },
                  { id: "Underwear", label: "🌸 Underwear" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      categoryFilter === cat.id
                        ? "bg-[#18181B] text-white"
                        : "bg-[#EFE9DF] text-[#6E6152] hover:bg-[#E5DDCF]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#8C7E6C] uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3 pl-4">Item</th>
                    <th className="p-3">SKU & Barcode</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Cost Price</th>
                    <th className="p-3">Selling Price</th>
                    <th className="p-3">Margin</th>
                    <th className="p-3 text-center">Stock Count</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE3]">
                  {filteredProducts.map(prod => {
                    const margin = prod.price - (prod.costPrice || 0);
                    const marginPct = Math.round((margin / prod.price) * 100);

                    return (
                      <tr key={prod.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3 pl-4 flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-10 h-10 object-cover rounded-lg bg-[#EFE9DF] border border-[#DFD5C6] shrink-0"
                          />
                          <div>
                            <div className="font-medium text-[#18181B]">{prod.title}</div>
                            <div className="text-[10px] text-[#8C7E6C]">{prod.subCategory}</div>
                          </div>
                        </td>

                        <td className="p-3 font-mono">
                          <div className="font-semibold text-[#18181B]">{prod.sku}</div>
                          <div className="text-[10px] text-[#8C7E6C]">{prod.barcode || "No Barcode"}</div>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            prod.category === "Jewellery" 
                              ? "bg-amber-50 text-amber-800 border border-amber-200" 
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}>
                            {prod.category}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-[#6E6152]">
                          {formatCurrency(prod.costPrice || 0)}
                        </td>

                        <td className="p-3 font-mono font-bold text-[#18181B]">
                          {formatCurrency(prod.price)}
                        </td>

                        <td className="p-3">
                          <span className="text-emerald-700 font-medium font-mono">
                            +{marginPct}% ({formatCurrency(margin)})
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5 border border-[#DFD5C6] rounded-lg px-2 py-1 bg-white">
                            <button
                              onClick={() => handleStockQuickAdjust(prod, -1)}
                              className="text-[#6E6152] hover:text-black font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className={`font-mono font-bold px-2 ${prod.stock <= 5 ? "text-amber-700" : "text-[#18181B]"}`}>
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => handleStockQuickAdjust(prod, +1)}
                              className="text-[#6E6152] hover:text-black font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="p-3 text-right pr-4 space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 hover:bg-[#EFE9DF] rounded-lg text-[#6E6152] transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.title)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY SALES HISTORY */}
        {activeTab === "sales" && (
          <div className="bg-white rounded-2xl border border-[#DFD5C6] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E8E2D8] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-serif text-lg text-[#18181B] font-normal">
                Counter Settlement Ledger ({sales.length} Bills)
              </h3>
              <span className="text-xs text-[#8C7E6C] font-mono">
                Total Lifetime Revenue: {formatCurrency(sales.reduce((a, b) => a + b.finalTotal, 0))}
              </span>
            </div>

            {sales.length === 0 ? (
              <div className="py-16 text-center text-[#8C7E6C]">
                <Receipt className="w-10 h-10 text-[#C5A880] mx-auto mb-2 opacity-60" />
                <p className="font-serif text-base text-[#18181B]">No sales transactions yet</p>
                <p className="text-xs">Complete a sale in the POS tab to see live invoices here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#8C7E6C] uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 pl-4">Invoice #</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items Purchased</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Bill Total</th>
                      <th className="p-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE3]">
                    {sales.map(sale => (
                      <tr key={sale.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3 pl-4 font-mono font-bold text-[#18181B]">
                          #{sale.billNumber}
                        </td>
                        <td className="p-3 text-[#6E6152]">
                          {new Date(sale.date).toLocaleDateString("en-IN")},{" "}
                          {new Date(sale.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-[#18181B]">
                            {sale.customerName || "Walk-in Guest"}
                          </div>
                          <div className="text-[10px] text-[#8C7E6C] font-mono">
                            {sale.customerPhone || "—"}
                          </div>
                        </td>
                        <td className="p-3 text-[#5E5245]">
                          {sale.items.map(i => `${i.title} (x${i.quantity})`).join(", ")}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-[#EFE9DF] text-[10px] uppercase font-semibold font-mono">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-sm text-[#18181B]">
                          {formatCurrency(sale.finalTotal)}
                        </td>
                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => setReprintSale(sale)}
                            className="px-3 py-1 bg-[#18181B] text-white rounded-lg text-[11px] hover:bg-[#2B2B30] cursor-pointer"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STORE SETTINGS & DATA SAFETY BACKUPS */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Store Information Form */}
            <div className="bg-white p-6 rounded-2xl border border-[#DFD5C6] shadow-xs">
              <h3 className="font-serif text-xl text-[#18181B] font-normal mb-1">
                Store & Receipt Configuration
              </h3>
              <p className="text-xs text-[#8C7E6C] mb-4">
                Customize store name, contact, and WhatsApp e-bill details.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Brand Name:</label>
                  <input
                    type="text"
                    value={storeSettingsForm.name}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, name: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Tagline:</label>
                  <input
                    type="text"
                    value={storeSettingsForm.tagline}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, tagline: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Physical Address:</label>
                  <input
                    type="text"
                    value={storeSettingsForm.address}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, address: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#6E6152] font-medium mb-1">Counter Phone:</label>
                    <input
                      type="text"
                      value={storeSettingsForm.phone}
                      onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, phone: e.target.value })}
                      className="w-full p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#6E6152] font-medium mb-1">WhatsApp E-Bill No.:</label>
                    <input
                      type="text"
                      value={storeSettingsForm.whatsappNumber}
                      onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, whatsappNumber: e.target.value })}
                      className="w-full p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">UPI ID (For Dynamic QR Scanner):</label>
                  <input
                    type="text"
                    value={storeSettingsForm.upiId}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, upiId: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg font-mono"
                    placeholder="e.g. zayara@okaxis"
                  />
                </div>

                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Receipt Footer Note:</label>
                  <textarea
                    rows="2"
                    value={storeSettingsForm.receiptFooter}
                    onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, receiptFooter: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#18181B] hover:bg-[#2B2B30] text-[#FAF8F5] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#D4AF37]" />
                    <span>Save Settings</span>
                  </button>

                  {settingsSavedNotice && (
                    <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Settings Saved!
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Offline Data Backup & Restore */}
            <div className="bg-white p-6 rounded-2xl border border-[#DFD5C6] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-serif text-xl text-[#18181B] font-normal mb-1">
                  Database Safety & 100% Offline Backups
                </h3>
                <p className="text-xs text-[#8C7E6C] leading-relaxed mb-4">
                  All your sales history, inventory counts, and custom barcode tags are stored locally in your browser with zero recurring software fees.
                </p>

                <div className="space-y-3 text-xs">
                  {/* Export Backup */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DFD5C6] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#18181B]">Download Store Backup</div>
                      <div className="text-[11px] text-[#6E6152]">Export all products & transactions to a secure .JSON file</div>
                    </div>
                    <button
                      onClick={exportDatabaseBackup}
                      className="px-4 py-2 bg-[#18181B] text-white rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-[#2B2B30]"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Export</span>
                    </button>
                  </div>

                  {/* Import Backup */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DFD5C6] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#18181B]">Restore From Backup</div>
                      <div className="text-[11px] text-[#6E6152]">Upload a previously exported .JSON backup file</div>
                    </div>
                    <label className="px-4 py-2 bg-[#EFE9DF] text-[#4A4036] hover:bg-[#E5DDCF] rounded-xl flex items-center gap-1.5 cursor-pointer border border-[#DDD2C2]">
                      <Upload className="w-3.5 h-3.5 text-[#8C6D3F]" />
                      <span>Import</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Reset to Default Seed */}
              <div className="pt-4 border-t border-[#F2ECE3]">
                <button
                  onClick={() => {
                    if (window.confirm("Reset all products and sales to initial default demo data?")) {
                      resetAllDataToDefault();
                      onRefreshData();
                      alert("Database reset to initial demo products.");
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo Products & Clean Ledger</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] w-full max-w-lg rounded-2xl border border-[#DFD5C6] shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] mb-4">
              <h3 className="font-serif text-xl text-[#18181B] font-normal">
                {editingProduct ? "Edit Product" : "Add New Creation"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#7A6D5E] hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6E6152] font-medium mb-1">Product Title:</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg"
                  placeholder="e.g. Luna Pearl Huggies"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">SKU Code:</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg font-mono uppercase"
                    placeholder="e.g. ZY-JWL-10"
                  />
                </div>
                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Barcode (EAN/Code-128):</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg font-mono"
                    placeholder="8901001..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Category:</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg cursor-pointer"
                  >
                    <option value="Jewellery">💎 Fine Jewellery</option>
                    <option value="Bras">👙 Bras & Bralettes</option>
                    <option value="Underwear">🌸 Girls Underwear / Panties</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Sub-Category:</label>
                  <input
                    type="text"
                    value={productForm.subCategory}
                    onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                    className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg"
                    placeholder="e.g. Rings, Bralettes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Cost Price (₹):</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Retail Price (₹):</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#6E6152] font-medium mb-1">Stock Count:</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* Product Photo: Upload File or URL + Live Preview */}
              <div>
                <label className="block text-[#6E6152] font-medium mb-1">Product Photo / Image:</label>
                <div className="flex items-center gap-3 p-2.5 bg-white border border-[#DFD5C6] rounded-xl">
                  {/* Thumbnail Preview */}
                  <div className="w-16 h-16 rounded-lg bg-[#F7F2EA] border border-[#E6DCCF] overflow-hidden shrink-0 flex items-center justify-center">
                    {productForm.image ? (
                      <img
                        src={productForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#A09383]" />
                    )}
                  </div>

                  {/* Actions: Upload from File / Camera OR Paste URL */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1.5 bg-[#18181B] hover:bg-[#2B2B30] text-white rounded-lg text-[10px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Camera className="w-3 h-3 text-[#D4AF37]" />
                        <span>Upload Photo / Camera</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-[#A09383]">Auto-compressed</span>
                    </div>

                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full p-1.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded text-[10px] text-[#4A4036] truncate"
                      placeholder="Or paste web image URL (https://...)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#6E6152] font-medium mb-1">Description & Material:</label>
                <textarea
                  rows="2"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2 bg-white border border-[#DFD5C6] rounded-lg"
                  placeholder="Anti-tarnish, featherlight alloy..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#DFD5C6] rounded-xl text-[#6E6152] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#18181B] text-white rounded-xl font-semibold cursor-pointer hover:bg-[#2B2B30]"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-Print POS Receipt Modal */}
      {reprintSale && (
        <POSReceiptModal
          sale={reprintSale}
          settings={settings}
          onClose={() => setReprintSale(null)}
          onNewSale={() => setReprintSale(null)}
        />
      )}
    </div>
  );
}
