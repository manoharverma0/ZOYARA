import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Storefront from "./components/Storefront/Storefront";
import ProductDetailModal from "./components/Storefront/ProductDetailModal";
import CartDrawer from "./components/Storefront/CartDrawer";
import StaffTerminal from "./components/StaffPortal/StaffTerminal";
import StaffAuthModal from "./components/StaffPortal/StaffAuthModal";
import { getProducts, getStoreSettings } from "./services/storage";
import { Sparkles, MessageCircle, MapPin, Phone, Lock } from "lucide-react";

export default function App() {
  // View mode: 'website' (customer facing) or 'staff' (private back-office)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get("portal") === "staff" || 
        urlParams.get("portal") === "billing" || 
        window.location.hash === "#staff" || 
        window.location.hash === "#billing" ||
        window.location.hash === "#pos"
      ) {
        return "staff";
      }
    } catch {
      // ignore
    }
    return "website";
  });
  const [isStaffAuthModalOpen, setIsStaffAuthModalOpen] = useState(false);

  // Products and Settings — initialize eagerly to avoid setState-in-effect
  const [products, setProducts] = useState(() => getProducts());
  const [settings, setSettings] = useState(() => getStoreSettings());

  // Category selection for storefront
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Shopping bag state — persisted to sessionStorage so page refresh doesn't lose items
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem("zayara_cart");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load data
  const loadData = () => {
    const loadedProducts = getProducts();
    const loadedSettings = getStoreSettings();
    setProducts(loadedProducts);
    setSettings(loadedSettings);
  };

  // Persist cart to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("zayara_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === product.selectedSize);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (id, selectedSize, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id, selectedSize);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === id && item.selectedSize === selectedSize ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (id, selectedSize) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Open Staff Portal
  const handleRequestStaffPortal = () => {
    // If previously unlocked on this device, grant immediate access
    const isRemembered = localStorage.getItem("zayara_staff_authenticated") === "true";
    if (isRemembered) {
      setViewMode("staff");
    } else {
      setIsStaffAuthModalOpen(true);
    }
  };

  // IF STAFF TERMINAL IS ACTIVE:
  if (viewMode === "staff") {
    return (
      <StaffTerminal
        products={products}
        settings={settings}
        onRefreshData={loadData}
        onExitToWebsite={() => {
          setViewMode("website");
          // Clear query/hash if present
          if (window.location.search.includes("portal=") || window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }}
      />
    );
  }

  // DEFAULT: PURE LUXURY CUSTOMER FACING WEBSITE
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1E] flex flex-col font-sans selection:bg-[#C5A880]/30 selection:text-[#111113]">
      
      {/* Customer Navbar with Staff Portal trigger */}
      <Navbar
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          window.scrollTo({ top: 400, behavior: "smooth" });
        }}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        onRequestStaffPortal={handleRequestStaffPortal}
      />

      {/* Customer Storefront & Lookbook */}
      <main className="flex-1">
        <Storefront
          products={products}
          onAddToCart={handleAddToCart}
          onOpenProductDetail={(prod) => setSelectedProduct(prod)}
          cartItems={cartItems}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </main>

      {/* Customer Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isInCart={cartItems.some(i => i.id === selectedProduct.id && (!i.selectedSize || i.selectedSize === (selectedProduct.sizes?.[0] || "Standard")))}
        />
      )}

      {/* Customer Shopping Bag Slide-out Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Luxury Customer Footer */}
      <footer className="bg-[#18181B] text-[#FAF8F5] pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-[#2E2E33] no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2B2B30]">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <span className="font-serif text-3xl tracking-[0.25em] font-normal text-white">
              ZOYARA
            </span>
            <p className="text-xs text-[#A89C8E] leading-relaxed">
              Quiet luxury made accessible. Curated minimalist jewellery, wireless comfort bras &amp; seamless underwear — crafted for everyday elegance.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[#D4AF37] text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anti-Tarnish • Hypoallergenic • 100% Breathable</span>
            </div>
          </div>

          {/* Customer Collections */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#D4AF37] mb-3">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#A89C8E]">
              <li>
                <button 
                  onClick={() => { setSelectedCategory("Jewellery"); window.scrollTo({ top: 400, behavior: "smooth" }); }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fine Jewellery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory("Bras"); window.scrollTo({ top: 400, behavior: "smooth" }); }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bras & Bralettes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory("Underwear"); window.scrollTo({ top: 400, behavior: "smooth" }); }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Girls Underwear & Panties
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory("antiTarnish"); window.scrollTo({ top: 400, behavior: "smooth" }); }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Anti-Tarnish Statement
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory("under250"); window.scrollTo({ top: 400, behavior: "smooth" }); }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Affordable Luxury (Under ₹250)
                </button>
              </li>
            </ul>
          </div>

          {/* Atelier Promise */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#D4AF37] mb-3">
              Atelier Promise
            </h4>
            <ul className="space-y-2 text-xs text-[#A89C8E]">
              <li>✓ 18K Anti-Tarnish Vacuum Finish</li>
              <li>✓ Featherlight Hypoallergenic Alloys</li>
              <li>✓ 100% Cotton Intimate Gusset</li>
              <li>✓ Complimentary Custom Gift Packaging</li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-2.5 text-xs text-[#A89C8E]">
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#D4AF37] mb-3">
              Boutique Location
            </h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>{settings?.address || "Shop 4, Luxury Arcade, Main Market"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>{settings?.phone || "+91 98765 43210"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>Direct WhatsApp Orders Available</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Discreet Staff Login */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#716556] gap-3">
          <span>&copy; {new Date().getFullYear()} ZOYARA ATELIER. All rights reserved.</span>
          
          {/* Discreet Staff Portal Entry (Protected by PIN) */}
          <button
            onClick={handleRequestStaffPortal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[#716556] hover:text-[#D4AF37] hover:bg-[#27272A] transition-colors cursor-pointer text-[10px] font-mono border border-transparent hover:border-[#3F3F46]"
            title="Private Store Terminal for Cashier & Staff"
          >
            <Lock className="w-3 h-3" />
            <span>Store Counter & Staff Terminal</span>
          </button>
        </div>
      </footer>

      {/* Staff Authentication PIN Modal */}
      <StaffAuthModal
        isOpen={isStaffAuthModalOpen}
        onClose={() => setIsStaffAuthModalOpen(false)}
        onSuccess={() => {
          setIsStaffAuthModalOpen(false);
          setViewMode("staff");
        }}
      />
    </div>
  );
}
