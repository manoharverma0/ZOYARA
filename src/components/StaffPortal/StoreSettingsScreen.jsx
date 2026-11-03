import React, { useState } from "react";
import { 
  Save, 
  Store, 
  CreditCard, 
  Search, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Code2,
  Lock,
  Database,
  Eye,
  EyeOff,
  ShieldCheck,
  ExternalLink,
  LayoutTemplate,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { saveStoreSettings } from "../../services/storage";
import { applyDynamicSeo } from "../../utils/seo";
import { DEFAULT_CATEGORY_TILES } from "../../data/initialProducts";

export default function StoreSettingsScreen({ settings, onRefreshData }) {
  const [formData, setFormData] = useState({ 
    staffPin: "85200",
    supabaseUrl: "",
    supabaseAnonKey: "",
    categoryTiles: DEFAULT_CATEGORY_TILES,
    ...settings 
  });
  const [activeTab, setActiveTab] = useState("landing"); // 'landing' | 'security' | 'seo' | 'general' | 'razorpay' | 'custom_html'
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFileUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        callback(dataUrl);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const categoryTiles = formData.categoryTiles || DEFAULT_CATEGORY_TILES;

  const handleUpdateCategoryTile = (index, field, value) => {
    const updated = [...categoryTiles];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, categoryTiles: updated }));
  };

  const handleAddCategoryTile = () => {
    const newTile = {
      id: `category-${Date.now()}`,
      title: "New Category",
      subtitle: "18K Gold Finish",
      priceTag: "From ₹199",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
    };
    setFormData(prev => ({
      ...prev,
      categoryTiles: [...categoryTiles, newTile]
    }));
  };

  const handleRemoveCategoryTile = (index) => {
    if (categoryTiles.length <= 1) {
      alert("At least one category tile must remain on the landing page.");
      return;
    }
    const updated = categoryTiles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, categoryTiles: updated }));
  };

  const handleResetCategoryTiles = () => {
    if (window.confirm("Reset category showcase tiles back to ZOYARA factory defaults?")) {
      setFormData(prev => ({ ...prev, categoryTiles: DEFAULT_CATEGORY_TILES }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveStoreSettings(formData);
    applyDynamicSeo(formData);
    if (onRefreshData) onRefreshData();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Offline stores handlers
  const handleAddStore = () => {
    const newStore = {
      id: `store-${Date.now()}`,
      name: "ZOYARA New Boutique",
      address: "Main Street, Retail Boulevard",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      phone: "+91 98765 43210",
      hours: "10:30 AM – 9:00 PM",
      mapsUrl: ""
    };
    setFormData(prev => ({
      ...prev,
      offlineStores: [...(prev.offlineStores || []), newStore]
    }));
  };

  const handleUpdateStore = (index, key, val) => {
    const updated = [...(formData.offlineStores || [])];
    updated[index] = { ...updated[index], [key]: val };
    setFormData(prev => ({ ...prev, offlineStores: updated }));
  };

  const handleRemoveStore = (index) => {
    const updated = [...(formData.offlineStores || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, offlineStores: updated }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6DCCF] gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#18382D]">
            Storefront Settings &amp; SEO Suite
          </h2>
          <p className="text-xs text-[#746B62] mt-0.5">
            Manage live SEO meta tags, Google site verification, Google Analytics, Razorpay keys, and offline showroom branches without modifying code.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#B88D4E]" />
          <span>Save All Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>All store settings, SEO tags, Razorpay credentials, and offline locations successfully saved and dynamically updated!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E6DCCF] bg-white rounded-t-xl overflow-x-auto text-xs font-semibold uppercase tracking-wider scrollbar-none">
        {[
          { id: "landing", label: "Landing Page & Categories", icon: LayoutTemplate },
          { id: "security", label: "Admin Password & Supabase", icon: Lock },
          { id: "seo", label: "SEO & Search Engine Meta", icon: Search },
          { id: "general", label: "Brand & Offline Showrooms", icon: Store },
          { id: "razorpay", label: "Razorpay Gateway", icon: CreditCard },
          { id: "custom_html", label: "Custom HTML & Pixel Tags", icon: Code2 }
        ].map(t => {
          const Icon = t.icon;
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isSelected ? "border-[#18382D] text-[#18382D] bg-[#F7F2EA]/40" : "border-transparent text-[#746B62] hover:text-[#18382D]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="bg-white rounded-b-xl border border-t-0 border-[#E6DCCF] p-6 space-y-6 shadow-2xs">
        
        {/* ========================================================
            TAB 0: LANDING PAGE & CATEGORY SHOWCASE TILES
            ======================================================== */}
        {activeTab === "landing" && (
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-serif text-base font-semibold text-[#18382D] flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-[#B88D4E]" />
                  <span>Landing Page Category Tiles &amp; Photos Customizer</span>
                </h3>
                <p className="text-xs text-[#746B62]">
                  Customize the categories, photos, titles, and price tags displayed on the storefront home page. Any edits reflect immediately.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCategoryTiles}
                  className="px-3 py-1.5 bg-white border border-[#E6DCCF] hover:bg-gray-50 text-[#746B62] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset to factory category tiles"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddCategoryTile}
                  className="px-3 py-1.5 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B88D4E]" />
                  <span>Add Category Tile</span>
                </button>
              </div>
            </div>

            {/* Category Tiles Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#18382D]">
                  Shop By Category Grid ({categoryTiles.length} Tiles)
                </span>
                <span className="text-[11px] text-[#746B62]">
                  Drag/Edit photo, title &amp; filter mapping
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTiles.map((tile, idx) => (
                  <div 
                    key={tile.id || idx}
                    className="p-4 bg-[#FFFDFA] rounded-2xl border border-[#E6DCCF] shadow-xs space-y-3 relative hover:border-[#B88D4E]/70 transition-all"
                  >
                    {/* Tile Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#18382D] text-[#B88D4E]">
                        Tile #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategoryTile(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Category Tile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Preview & Upload - Mobile responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F7F2EA] border border-[#E6DCCF] shrink-0 relative group self-center sm:self-auto">
                        <img 
                          src={tile.image} 
                          alt={tile.title} 
                          className="w-full h-full object-cover" 
                        />
                        <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-semibold">
                          <Upload className="w-4 h-4 mb-0.5" />
                          <span>Change</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageFileUpload(e, (dataUrl) => handleUpdateCategoryTile(idx, "image", dataUrl))} 
                          />
                        </label>
                      </div>

                      <div className="flex-1 w-full min-w-0 space-y-1.5">
                        <label className="text-[10px] text-[#746B62] font-semibold block">Photo URL or Device Upload</label>
                        <input
                          type="text"
                          value={tile.image}
                          onChange={(e) => handleUpdateCategoryTile(idx, "image", e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2.5 py-2 bg-white border border-[#E6DCCF] rounded-lg text-xs text-[#1B1A18] focus:outline-none focus:border-[#18382D]"
                        />
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F2EA] hover:bg-[#E6DCCF] rounded-lg text-xs text-[#18382D] font-semibold transition-colors cursor-pointer touch-manipulation">
                          <Upload className="w-3.5 h-3.5 text-[#B88D4E]" />
                          <span>Upload photo from phone / PC</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageFileUpload(e, (dataUrl) => handleUpdateCategoryTile(idx, "image", dataUrl))} 
                          />
                        </label>
                      </div>
                    </div>

                    {/* Title & Price Badge */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#746B62] font-semibold block mb-0.5">Category Title</label>
                        <input
                          type="text"
                          value={tile.title}
                          onChange={(e) => handleUpdateCategoryTile(idx, "title", e.target.value)}
                          placeholder="e.g. Fine Jewellery"
                          className="w-full px-2.5 py-2 bg-white border border-[#E6DCCF] rounded-lg text-xs font-semibold text-[#18382D] focus:outline-none focus:border-[#18382D]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#746B62] font-semibold block mb-0.5">Price Tag Badge</label>
                        <input
                          type="text"
                          value={tile.priceTag}
                          onChange={(e) => handleUpdateCategoryTile(idx, "priceTag", e.target.value)}
                          placeholder="e.g. From ₹399"
                          className="w-full px-2.5 py-2 bg-white border border-[#E6DCCF] rounded-lg text-xs font-mono text-[#18382D] focus:outline-none focus:border-[#18382D]"
                        />
                      </div>
                    </div>

                    {/* Subtitle & Filter mapping */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#746B62] font-semibold block mb-0.5">Subtitle / Tagline</label>
                        <input
                          type="text"
                          value={tile.subtitle}
                          onChange={(e) => handleUpdateCategoryTile(idx, "subtitle", e.target.value)}
                          placeholder="e.g. 18K Gold Plated"
                          className="w-full px-2.5 py-2 bg-white border border-[#E6DCCF] rounded-lg text-xs text-[#746B62] focus:outline-none focus:border-[#18382D]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#746B62] font-semibold block mb-0.5">Filter Category</label>
                        <select
                          value={tile.id}
                          onChange={(e) => handleUpdateCategoryTile(idx, "id", e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-[#E6DCCF] rounded-lg text-xs text-[#18382D] focus:outline-none focus:border-[#18382D] cursor-pointer"
                        >
                          <option value="Jewellery">Jewellery (Fine / 18K)</option>
                          <option value="Bras">Bras &amp; Bralettes</option>
                          <option value="Underwear">Underwear &amp; Panties</option>
                          <option value="antiTarnish">Anti-Tarnish Edit</option>
                          <option value="under250">Budget Under ₹250</option>
                          <option value="all">All Atelier Products</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Section Banner Content */}
            <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#DFD5C6] space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                <Sparkles className="w-4 h-4 text-[#B88D4E]" />
                <span>Hero Headline &amp; Editorial Cover Customizer</span>
              </div>
              <p className="text-xs text-[#746B62]">
                Control the hero typography, banner messaging, and featured editorial photo at the top of the storefront.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#18382D] mb-1">
                      Hero Badge Callout:
                    </label>
                    <input
                      type="text"
                      value={formData.heroBadge || "Quiet Luxury • Anti-Tarnish 18K Polish"}
                      onChange={(e) => handleChange("heroBadge", e.target.value)}
                      placeholder="Quiet Luxury • Anti-Tarnish 18K Polish"
                      className="w-full px-3 py-2 bg-white border border-[#DFD5C6] rounded-xl text-xs text-[#18382D] focus:outline-none focus:border-[#18382D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#18382D] mb-1">
                      Hero Headline:
                    </label>
                    <input
                      type="text"
                      value={formData.heroHeadline || "Fine Jewellery & Intimates,"}
                      onChange={(e) => handleChange("heroHeadline", e.target.value)}
                      placeholder="Fine Jewellery & Intimates,"
                      className="w-full px-3 py-2 bg-white border border-[#DFD5C6] rounded-xl text-xs text-[#18382D] focus:outline-none focus:border-[#18382D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#18382D] mb-1">
                      Hero Subheadline:
                    </label>
                    <input
                      type="text"
                      value={formData.heroSubheadline || "Crafted for Everyday Grace."}
                      onChange={(e) => handleChange("heroSubheadline", e.target.value)}
                      placeholder="Crafted for Everyday Grace."
                      className="w-full px-3 py-2 bg-white border border-[#DFD5C6] rounded-xl text-xs text-[#18382D] focus:outline-none focus:border-[#18382D]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#18382D] mb-1">
                      Hero Featured Editorial Photo:
                    </label>
                    <div className="flex gap-3 items-center">
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#F7F2EA] border border-[#DFD5C6] shrink-0 relative group">
                        <img 
                          src={formData.heroImageUrl || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"} 
                          alt="Hero cover" 
                          className="w-full h-full object-cover" 
                        />
                        <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[9px] font-semibold">
                          <Upload className="w-3.5 h-3.5 mb-0.5" />
                          <span>Change</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageFileUpload(e, (dataUrl) => handleChange("heroImageUrl", dataUrl))} 
                          />
                        </label>
                      </div>

                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={formData.heroImageUrl || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"}
                          onChange={(e) => handleChange("heroImageUrl", e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-2.5 py-1.5 bg-white border border-[#DFD5C6] rounded-lg text-xs text-[#1B1A18] focus:outline-none focus:border-[#18382D]"
                        />
                        <label className="inline-flex items-center gap-1 text-[10px] text-[#18382D] font-semibold hover:underline cursor-pointer pt-0.5">
                          <Upload className="w-3 h-3 text-[#B88D4E]" />
                          <span>Upload hero image from computer</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageFileUpload(e, (dataUrl) => handleChange("heroImageUrl", dataUrl))} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#18382D] mb-1">
                      Hero Paragraph Description:
                    </label>
                    <textarea
                      rows={3}
                      value={formData.heroDescription || "Why should understated luxury cost thousands? ZOYARA crafts vacuum 18K anti-tarnish waterproof jewellery, cloud-soft wireless bralettes, and seamless cotton-gusset intimates — accessible from ₹150 to ₹400."}
                      onChange={(e) => handleChange("heroDescription", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DFD5C6] rounded-xl text-xs text-[#746B62] focus:outline-none focus:border-[#18382D]"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 1: ADMIN SECURITY & SUPABASE CLOUD DATABASE
            ======================================================== */}
        {activeTab === "security" && (
          <div className="space-y-6">
            
            {/* Section A: Admin Password */}
            <div className="p-5 bg-[#FAF8F5] rounded-xl border border-[#DFD5C6] space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                <ShieldCheck className="w-4 h-4 text-[#B88D4E]" />
                <span>Admin Panel Master Security Password</span>
              </div>
              <p className="text-xs text-[#746B62] leading-relaxed">
                This password protects your private store POS, billing terminal, inventory editor, and financial ledgers.
              </p>

              <div className="max-w-md">
                <label className="block text-xs font-semibold text-[#18382D] mb-1">
                  Master Password / PIN:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.staffPin || "85200"}
                    onChange={(e) => handleChange("staffPin", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#DFD5C6] rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-[#18382D]"
                    placeholder="85200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#746B62] hover:text-[#18382D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#A09383] mt-1 block">
                  Current configured password: <code className="font-bold text-[#18382D]">{formData.staffPin || "85200"}</code>
                </span>
              </div>
            </div>

            {/* Section B: Live Cloud Database (Supabase) */}
            <div className="p-5 bg-white rounded-xl border border-[#DFD5C6] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                  <Database className="w-4 h-4 text-[#B88D4E]" />
                  <span>Supabase Live Cloud Database Synchronization</span>
                </div>
                {formData.supabaseUrl && formData.supabaseAnonKey ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Live Cloud Configured
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-semibold">
                    Standalone Local Mode
                  </span>
                )}
              </div>

              <p className="text-xs text-[#746B62] leading-relaxed">
                Connect your free Supabase PostgreSQL database to allow adding, editing, and deleting products live from any device or location. When connected, all customer devices see updates in real time.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#18382D] mb-1">
                    Supabase Project URL:
                  </label>
                  <input
                    type="url"
                    value={formData.supabaseUrl || ""}
                    onChange={(e) => handleChange("supabaseUrl", e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl text-xs font-mono focus:outline-none focus:border-[#18382D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18382D] mb-1">
                    Supabase Anon / Public API Key:
                  </label>
                  <input
                    type="text"
                    value={formData.supabaseAnonKey || ""}
                    onChange={(e) => handleChange("supabaseAnonKey", e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl text-xs font-mono focus:outline-none focus:border-[#18382D]"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-[#F7F2EA] rounded-xl text-[11px] text-[#746B62] space-y-1">
                <div className="font-semibold text-[#18382D] flex items-center gap-1">
                  <span>Quick Setup:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Create a free account at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#18382D] underline font-medium inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
                  <li>Copy and execute the pre-written script <code className="bg-white px-1 py-0.5 rounded border border-[#DFD5C6] font-mono text-[10px]">supabase_schema.sql</code> in the Supabase SQL Editor.</li>
                  <li>Paste your Project URL &amp; Anon Key above and click <strong>Save Settings</strong>.</li>
                </ol>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 1: COMPLETE SEO & GOOGLE SUITE
            ======================================================== */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            
            {/* Google Search Live SERP Snippet Preview */}
            <div className="p-4 bg-[#F7F2EA]/70 rounded-xl border border-[#E6DCCF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#746B62] tracking-wider block">
                Google Search Result (Live Snippet Preview)
              </span>
              <div className="text-[#1a0dab] font-serif text-lg leading-snug hover:underline cursor-pointer">
                {formData.seoTitle || "ZOYARA — Fashion & Comfort | Anti-Tarnish Jewellery & Everyday Intimates"}
              </div>
              <div className="text-[11px] text-[#006621] font-mono">
                {formData.siteUrl || "https://zoyara.vercel.app"}
              </div>
              <p className="text-xs text-[#545454] leading-relaxed">
                {formData.seoDescription || "ZOYARA — Fashion & Comfort. Curated 18K anti-tarnish waterproof jewellery, zero-wire bras, and seamless intimates crafted for everyday elegance."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  SEO Meta Title (Title Tag) *
                </label>
                <input
                  type="text"
                  value={formData.seoTitle || ""}
                  onChange={(e) => handleChange("seoTitle", e.target.value)}
                  placeholder="ZOYARA — Fashion & Comfort | Anti-Tarnish Jewellery & Everyday Intimates"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  SEO Meta Description *
                </label>
                <textarea
                  rows={3}
                  value={formData.seoDescription || ""}
                  onChange={(e) => handleChange("seoDescription", e.target.value)}
                  placeholder="Write compelling meta description summarizing brand, products, and prices..."
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Meta Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.seoKeywords || ""}
                  onChange={(e) => handleChange("seoKeywords", e.target.value)}
                  placeholder="zoyara, fashion and comfort, anti-tarnish jewellery, wirefree bras, seamless underwear, 18k jewellery india"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Google Site Verification Token (`google-site-verification`)
                </label>
                <input
                  type="text"
                  value={formData.googleSiteVerification || ""}
                  onChange={(e) => handleChange("googleSiteVerification", e.target.value)}
                  placeholder="e.g. google-site-verification=xxxxxxx or verification token"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`)
                </label>
                <input
                  type="text"
                  value={formData.googleAnalyticsId || ""}
                  onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
                  placeholder="e.g. G-ZOYARA2026"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Google AdSense / Ads Placement Client ID
                </label>
                <input
                  type="text"
                  value={formData.googleAdsClientId || ""}
                  onChange={(e) => handleChange("googleAdsClientId", e.target.value)}
                  placeholder="e.g. ca-pub-1234567890123456"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Google News / Publisher Name
                </label>
                <input
                  type="text"
                  value={formData.googleNewsPublication || ""}
                  onChange={(e) => handleChange("googleNewsPublication", e.target.value)}
                  placeholder="ZOYARA Fashion & Lifestyle News"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Canonical Site URL
                </label>
                <input
                  type="text"
                  value={formData.siteUrl || ""}
                  onChange={(e) => handleChange("siteUrl", e.target.value)}
                  placeholder="https://zoyara.vercel.app"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Robots Directives
                </label>
                <input
                  type="text"
                  value={formData.seoRobots || ""}
                  onChange={(e) => handleChange("seoRobots", e.target.value)}
                  placeholder="index, follow"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Social Media Open Graph Image URL (og:image)
                </label>
                <input
                  type="text"
                  value={formData.ogImage || ""}
                  onChange={(e) => handleChange("ogImage", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                />
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: BRAND & OFFLINE SHOWROOMS
            ======================================================== */}
        {activeTab === "general" && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.name || "ZOYARA"}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-serif text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline || "Fashion & Comfort"}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="Fashion & Comfort"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-semibold text-[#18382D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Primary Customer Phone / Helpline
                </label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  WhatsApp Concierge Number
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber || ""}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Registered Showroom / Headquarter Address
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  GSTIN (for Tax Invoices)
                </label>
                <input
                  type="text"
                  value={formData.gstin || ""}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Store UPI ID (for Dynamic QR Codes)
                </label>
                <input
                  type="text"
                  value={formData.upiId || ""}
                  onChange={(e) => handleChange("upiId", e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Offline Stores & Showroom Outlets */}
            <div className="pt-4 border-t border-[#E6DCCF] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#18382D]">
                    Offline Store Branches &amp; Showrooms
                  </h3>
                  <p className="text-[#746B62] text-[11px]">
                    Configure physical store addresses shown in footer, invoices, and Schema.org local business structured data.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddStore}
                  className="px-3.5 py-1.5 bg-[#F7F2EA] hover:bg-[#E6DCCF] text-[#18382D] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E6DCCF]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>

              <div className="space-y-3">
                {(formData.offlineStores || []).map((st, idx) => (
                  <div key={st.id || idx} className="p-4 bg-[#F7F2EA]/40 rounded-xl border border-[#E6DCCF] grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveStore(idx)}
                      className="absolute top-3 right-3 text-red-600 hover:text-red-800 p-1"
                      title="Remove branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#746B62] mb-1">Branch Name</label>
                      <input
                        type="text"
                        value={st.name || ""}
                        onChange={(e) => handleUpdateStore(idx, "name", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E6DCCF] rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-[#746B62] mb-1">Street Address</label>
                      <input
                        type="text"
                        value={st.address || ""}
                        onChange={(e) => handleUpdateStore(idx, "address", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E6DCCF] rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#746B62] mb-1">City</label>
                      <input
                        type="text"
                        value={st.city || ""}
                        onChange={(e) => handleUpdateStore(idx, "city", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E6DCCF] rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#746B62] mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={st.pincode || ""}
                        onChange={(e) => handleUpdateStore(idx, "pincode", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E6DCCF] rounded-md font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#746B62] mb-1">Store Phone</label>
                      <input
                        type="text"
                        value={st.phone || ""}
                        onChange={(e) => handleUpdateStore(idx, "phone", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E6DCCF] rounded-md font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: RAZORPAY GATEWAY INTEGRATION
            ======================================================== */}
        {activeTab === "razorpay" && (
          <div className="space-y-5 text-xs max-w-2xl">
            <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                <CreditCard className="w-4 h-4 text-[#B88D4E]" />
                <span>Razorpay Standard Checkout Integration</span>
              </div>
              <p className="text-[#746B62] text-[11px]">
                Accept instant payments via UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards (Visa, Mastercard, RuPay), and NetBanking.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                  Razorpay Key ID (`rzp_live_...` or `rzp_test_...`)
                </label>
                <input
                  type="text"
                  value={formData.razorpayKeyId || ""}
                  onChange={(e) => handleChange("razorpayKeyId", e.target.value)}
                  placeholder="rzp_test_xxxxxxxxxx"
                  className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono focus:outline-none focus:border-[#18382D]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="razorpayEnabled"
                  checked={formData.razorpayEnabled !== false}
                  onChange={(e) => handleChange("razorpayEnabled", e.target.checked)}
                  className="w-4 h-4 rounded text-[#18382D] focus:ring-[#18382D]"
                />
                <label htmlFor="razorpayEnabled" className="text-xs font-semibold text-[#18382D] cursor-pointer">
                  Enable Razorpay Gateway as primary payment option on checkout
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: CUSTOM HTML, ADS PLACEMENTS & SCRIPTS
            ======================================================== */}
        {activeTab === "custom_html" && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                Custom Header HTML / Script Tags (&amp;lt;head&amp;gt;)
              </label>
              <p className="text-[11px] text-[#746B62] mb-1.5">
                Paste Meta Pixel, TikTok Pixel, Google AdSense ad-slot tags, or custom tracking code here.
              </p>
              <textarea
                rows={5}
                value={formData.customHeaderHtml || ""}
                onChange={(e) => handleChange("customHeaderHtml", e.target.value)}
                placeholder="<!-- Paste custom header scripts here -->"
                className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono text-[11px] focus:outline-none focus:border-[#18382D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                Custom Footer HTML / Body End Tags
              </label>
              <textarea
                rows={4}
                value={formData.customFooterHtml || ""}
                onChange={(e) => handleChange("customFooterHtml", e.target.value)}
                placeholder="<!-- Custom body/footer scripts here -->"
                className="w-full px-3 py-2 border border-[#E6DCCF] rounded-lg font-mono text-[11px] focus:outline-none focus:border-[#18382D]"
              />
            </div>
          </div>
        )}

        {/* Bottom Save Action */}
        <div className="pt-4 border-t border-[#E6DCCF] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#B88D4E]" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
