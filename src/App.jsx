import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Storefront from "./components/Storefront/Storefront";
import ProductDetailModal from "./components/Storefront/ProductDetailModal";
import CartDrawer from "./components/Storefront/CartDrawer";
import CheckoutModal from "./components/Checkout/CheckoutModal";
import InvoiceModal from "./components/Common/InvoiceModal";
import AuthModal from "./components/Auth/AuthModal";
import CustomerAccountModal from "./components/Account/CustomerAccountModal";
import WishlistModal from "./components/Wishlist/WishlistModal";
import SearchModal from "./components/Search/SearchModal";
import InfoPagesModal from "./components/Info/InfoPagesModal";
import StaffTerminal from "./components/StaffPortal/StaffTerminal";
import StaffAuthModal from "./components/StaffPortal/StaffAuthModal";
import { 
  getProducts, 
  getStoreSettings, 
  getCurrentCustomer, 
  getWishlist, 
  toggleWishlistItem,
  syncWithSupabase
} from "./services/storage";
import { applyDynamicSeo } from "./utils/seo";
import { 
  Sparkles,
  MessageCircle, 
  MapPin, 
  Phone, 
  Lock, 
  ArrowUp
} from "lucide-react";

export default function App() {
  // View mode: 'website' (customer facing) or 'staff' (private back-office POS)
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

  // Products and Store Settings
  const [products, setProducts] = useState(() => getProducts());
  const [settings, setSettings] = useState(() => getStoreSettings());

  // Category selection for storefront
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Customer Authentication Session
  const [currentUser, setCurrentUser] = useState(() => getCurrentCustomer());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Wishlist
  const [wishlistIds, setWishlistIds] = useState(() => getWishlist());
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Search & Info Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoInitialTab, setInfoInitialTab] = useState("about");

  // Shopping bag state — persisted to sessionStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem("zayara_cart");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Checkout & Payment Gateway Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Active Tax Invoice / Bill Viewer
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);

  // Load / reload data
  const loadData = () => {
    const loadedProducts = getProducts();
    const loadedSettings = getStoreSettings();
    setProducts(loadedProducts);
    setSettings(loadedSettings);
    applyDynamicSeo(loadedSettings);
    syncWithSupabase().then(liveProds => {
      if (liveProds && liveProds.length > 0) {
        setProducts(liveProds);
      }
    });
  };

  // Sync with live Supabase database on mount
  useEffect(() => {
    syncWithSupabase().then(liveProds => {
      if (liveProds && liveProds.length > 0) {
        setProducts(liveProds);
      }
    });
  }, []);

  // Apply dynamic SEO on mount and when settings change
  useEffect(() => {
    applyDynamicSeo(settings);
  }, [settings]);

  // Persist cart to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("zayara_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Handle wishlist toggle
  const handleToggleWishlist = (productId) => {
    const updated = toggleWishlistItem(productId);
    setWishlistIds(updated);
  };

  // Cart operations
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const sizeToMatch = product.selectedSize || product.sizes?.[0] || "Standard";
      const existing = prev.find(item => item.id === product.id && item.selectedSize === sizeToMatch);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === sizeToMatch
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...product, selectedSize: sizeToMatch, quantity: product.quantity || 1 }];
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

  // 1-Click Buy Now
  const handleBuyNow = (product) => {
    handleAddToCart(product);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  // Open Info modal with specific tab
  const handleOpenInfo = (tabId = "about") => {
    setInfoInitialTab(tabId);
    setIsInfoOpen(true);
  };

  // Open Staff Portal
  const handleRequestStaffPortal = () => {
    const isRemembered = localStorage.getItem("zayara_staff_authenticated") === "true";
    if (isRemembered) {
      setViewMode("staff");
    } else {
      setIsStaffAuthModalOpen(true);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // IF STAFF TERMINAL IS ACTIVE (POS & Counter interface preserved 100%)
  if (viewMode === "staff") {
    return (
      <StaffTerminal
        products={products}
        settings={settings}
        onRefreshData={loadData}
        onExitToWebsite={() => {
          setViewMode("website");
          if (window.location.search.includes("portal=") || window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }}
      />
    );
  }

  // DEFAULT: REDESIGNED LUXURY CUSTOMER STOREFRONT
  return (
    <div className="min-h-screen bg-[#F7F2EA] text-[#1B1A18] flex flex-col font-sans selection:bg-[#18382D] selection:text-[#FFFDFA]">
      
      {/* 1. Redesigned Luxury Navbar */}
      <Navbar
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const catalogEl = document.getElementById("catalog-section");
          if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 450, behavior: "smooth" });
          }
        }}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        openWishlist={() => setIsWishlistOpen(true)}
        openSearch={() => setIsSearchOpen(true)}
        currentUser={currentUser}
        openAuth={() => setIsAuthOpen(true)}
        openAccount={() => setIsAccountOpen(true)}
        openInfo={handleOpenInfo}
        onRequestStaffPortal={handleRequestStaffPortal}
      />

      {/* 2. Customer Storefront Main Content */}
      <main className="flex-1">
        <Storefront
          products={products}
          onAddToCart={handleAddToCart}
          onOpenProductDetail={(prod) => setSelectedProduct(prod)}
          cartItems={cartItems}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onOpenInfo={handleOpenInfo}
        />
      </main>

      {/* 3. Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isInCart={cartItems.some(i => i.id === selectedProduct.id && (!i.selectedSize || i.selectedSize === (selectedProduct.sizes?.[0] || "Standard")))}
          isInWishlist={wishlistIds.includes(selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          allProducts={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {/* 4. Customer Shopping Bag Slide-out Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 5. Checkout & Payment Gateway Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onClearCart={handleClearCart}
        onOrderSuccess={(completedOrder) => {
          loadData(); // refresh stock numbers
          setActiveInvoiceOrder(completedOrder); // directly open the official tax bill!
        }}
      />

      {/* 6. Dedicated Tax Invoice & Official Bill Modal (Flawless Print & PDF) */}
      {activeInvoiceOrder && (
        <InvoiceModal
          order={activeInvoiceOrder}
          initialFormat="a4"
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}

      {/* 7. Customer Auth Modal (Mobile Number + OTP) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* 8. Customer Account & Order History Modal */}
      <CustomerAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onViewInvoice={(order) => {
          setActiveInvoiceOrder(order);
        }}
      />

      {/* 9. Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={products}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        onOpenProductDetail={(prod) => setSelectedProduct(prod)}
      />

      {/* 10. Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onOpenProductDetail={(prod) => setSelectedProduct(prod)}
      />

      {/* 11. Customer Care & Info Pages Modal */}
      <InfoPagesModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        initialTab={infoInitialTab}
      />

      {/* 12. Redesigned Luxury Customer Footer */}
      <footer className="bg-[#18382D] text-[#FFFDFA] pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-[#E6DCCF]/20 no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E6DCCF]/20">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <span className="font-serif text-3xl tracking-[0.24em] font-medium text-white block">
              ZOYARA
            </span>
            <span className="text-[10px] tracking-[0.35em] uppercase font-sans text-[#E9D9BD] block font-semibold">
              Fashion &amp; Comfort
            </span>
            <p className="text-xs text-[#E7ECE4] leading-relaxed pt-1">
              Quiet luxury made accessible. Curated 18K anti-tarnish waterproof jewellery, cloud-soft wireless bras, and laser-cut seamless underwear for everyday grace.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[#B88D4E] text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anti-Tarnish • Hypoallergenic • Pure Cotton</span>
            </div>
          </div>

          {/* Customer Collections */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#B88D4E] mb-3">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#E7ECE4]">
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
                  Bras &amp; Bralettes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory("Underwear"); window.scrollTo({ top: 400, behavior: "smooth" }); }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Girls Underwear &amp; Briefs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory("antiTarnish"); window.scrollTo({ top: 400, behavior: "smooth" }); }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Anti-Tarnish 18K Statement
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory("under250"); window.scrollTo({ top: 400, behavior: "smooth" }); }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Under ₹250 Daily Luxury
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#B88D4E] mb-3">
              Client Care &amp; Guide
            </h4>
            <ul className="space-y-2 text-xs text-[#E7ECE4]">
              <li>
                <button onClick={() => handleOpenInfo("about")} className="hover:text-white transition-colors cursor-pointer">
                  The Atelier Story
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenInfo("care")} className="hover:text-white transition-colors cursor-pointer">
                  Jewellery Care Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenInfo("shipping")} className="hover:text-white transition-colors cursor-pointer">
                  Shipping &amp; Delivery Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenInfo("returns")} className="hover:text-white transition-colors cursor-pointer">
                  Returns &amp; Hygiene Exchange
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenInfo("faqs")} className="hover:text-white transition-colors cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Offline Showrooms & Stores */}
          <div className="space-y-3 text-xs text-[#E7ECE4]">
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#B88D4E] mb-2 flex items-center justify-between">
              <span>Boutiques &amp; Stores</span>
              <span className="text-[10px] text-[#E9D9BD] font-mono lowercase">walk-in</span>
            </h4>

            {settings?.offlineStores && settings.offlineStores.length > 0 ? (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-none">
                {settings.offlineStores.map((st, idx) => (
                  <div key={st.id || idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                    <div className="font-medium text-white flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#B88D4E] shrink-0" />
                      <span className="truncate">{st.name}</span>
                    </div>
                    <p className="text-[11px] text-[#E7ECE4] pl-5 leading-snug">
                      {st.address}, {st.city} {st.pincode && `• ${st.pincode}`}
                    </p>
                    <div className="flex items-center justify-between pl-5 pt-1 text-[10px] text-[#E9D9BD] font-mono">
                      <span>{st.phone}</span>
                      <span>{st.hours || "10:30 AM - 9 PM"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#B88D4E] shrink-0 mt-0.5" />
                  <span>{settings?.address || "Shop 4, Luxury Arcade, Main Market, New Delhi - 110049"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#B88D4E] shrink-0" />
                  <span className="font-mono">{settings?.phone || "+91 98765 43210"}</span>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2 text-xs border-t border-white/10">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <button 
                onClick={() => handleOpenInfo("contact")}
                className="hover:underline cursor-pointer text-[#E9D9BD]"
              >
                Instant WhatsApp Concierge
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Discreet Staff Login */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#E7ECE4]/80 gap-3">
          <span>&copy; {new Date().getFullYear()} ZOYARA — Fashion &amp; Comfort. All rights reserved.</span>
          
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowUp className="w-3 h-3 text-[#B88D4E]" />
              <span>Back to Top</span>
            </button>

            {/* Discreet Staff Portal Entry (Protected by PIN) */}
            <button
              onClick={handleRequestStaffPortal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[#E7ECE4]/80 hover:text-[#B88D4E] hover:bg-white/10 transition-colors cursor-pointer text-[10px] font-mono border border-transparent hover:border-[#E6DCCF]/20"
              title="Private Store Terminal for Cashier & Staff"
            >
              <Lock className="w-3 h-3" />
              <span>Store POS &amp; Staff Terminal</span>
            </button>
          </div>
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
