import React, { useState } from "react";
import { 
  Save, 
  Globe, 
  Store, 
  CreditCard, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  MapPin, 
  Phone, 
  Code2, 
  Tag, 
  Eye, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { saveStoreSettings } from "../../services/storage";
import { applyDynamicSeo } from "../../utils/seo";

export default function StoreSettingsScreen({ settings, onRefreshData }) {
  const [formData, setFormData] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState("seo"); // 'seo' | 'general' | 'razorpay' | 'stores' | 'custom_html'
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
