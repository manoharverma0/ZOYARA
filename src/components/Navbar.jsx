import React, { useState } from "react";
import { 
  ShoppingBag, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  Search, 
  Heart, 
  User, 
  Menu, 
  X,
  Gem
} from "lucide-react";

export default function Navbar({ 
  onSelectCategory, 
  activeCategory, 
  cartCount, 
  openCart,
  wishlistCount = 0,
  openWishlist,
  openSearch,
  currentUser,
  openAuth,
  openAccount,
  openInfo,
  onRequestStaffPortal
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { id: "all", label: "All Pieces" },
    { id: "Jewellery", label: "Fine Jewellery" },
    { id: "Bras", label: "Bras & Bralettes" },
    { id: "Underwear", label: "Girls Underwear" },
    { id: "under250", label: "Under ₹250" },
    { id: "antiTarnish", label: "Anti-Tarnish" }
  ];

  const handleNavClick = (id) => {
    onSelectCategory(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F2EA]/95 backdrop-blur-md border-b border-[#E6DCCF] transition-all no-print">
      
      {/* 1. Slim Editorial Announcement Bar */}
      <div className="bg-[#18382D] text-[#FFFDFA] text-[11px] font-medium tracking-[0.18em] uppercase py-2 px-4 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-[#E9D9BD]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B88D4E]" />
          <span>Anti-Tarnish 18K Polish • Zero-Wire Bras • Pure Cotton Gusset</span>
        </div>

        <div className="mx-auto sm:mx-0 flex items-center gap-2 text-[#FFFDFA]">
          <Sparkles className="w-3 h-3 text-[#B88D4E]" />
          <span>Complimentary Gift Box &amp; Ribbon on All Orders</span>
          <Sparkles className="w-3 h-3 text-[#B88D4E]" />
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[#E9D9BD] text-[10px]">
          <button 
            onClick={() => openInfo("shipping")} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Express Pan-India Delivery
          </button>
          <span>•</span>
          <button 
            onClick={() => openInfo("contact")} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            WhatsApp Care
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Bar with Prominent Left-Aligned Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22 gap-4">
          
          {/* LEFT: Mobile Menu Button + Prominent Brand Logo (First from user perspective) */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-[#18382D] hover:bg-[#E7ECE4] rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <div 
              onClick={() => handleNavClick("all")}
              className="cursor-pointer group flex flex-col items-start select-none"
            >
              <span className="font-serif text-3xl sm:text-4xl lg:text-[40px] tracking-[0.16em] font-extrabold text-[#18382D] group-hover:text-[#B88D4E] transition-colors leading-none drop-shadow-2xs">
                ZOYARA
              </span>
              <span className="text-[10px] sm:text-[11px] tracking-[0.34em] text-[#B88D4E] uppercase font-sans mt-1 font-bold whitespace-nowrap">
                Fashion &amp; Comfort
              </span>
            </div>
          </div>

          {/* CENTER: Desktop Navigation Categories */}
          <nav className="hidden lg:flex items-center justify-center space-x-6 xl:space-x-8 text-xs tracking-[0.14em] uppercase font-semibold text-[#746B62] flex-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleNavClick(cat.id)}
                className={`hover:text-[#18382D] transition-colors cursor-pointer py-1.5 relative whitespace-nowrap ${
                  activeCategory === cat.id ? "text-[#18382D] font-bold" : ""
                }`}
              >
                {cat.label}
                {activeCategory === cat.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#18382D]"></span>
                )}
              </button>
            ))}
          </nav>

          {/* RIGHT: Action Icons: Search, Wishlist, Account, Shopping Bag, Staff Portal */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Quick Search */}
            <button
              onClick={openSearch}
              className="p-2 text-[#18382D] hover:bg-[#E7ECE4] rounded-full transition-colors cursor-pointer"
              title="Search Collection"
            >
              <Search className="w-5 h-5 text-[#18382D]" />
            </button>

            {/* Wishlist */}
            <button
              onClick={openWishlist}
              className="p-2 text-[#18382D] hover:bg-[#E7ECE4] rounded-full transition-colors cursor-pointer relative"
              title="Saved Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? "fill-[#18382D] text-[#18382D]" : "text-[#18382D]"}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#B88D4E] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Customer Account / Login with OTP */}
            <button
              onClick={currentUser ? openAccount : openAuth}
              className="p-2 text-[#18382D] hover:bg-[#E7ECE4] rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
              title={currentUser ? `Account: ${currentUser.name}` : "Sign In with Mobile OTP"}
            >
              <User className="w-5 h-5 text-[#18382D]" />
              {currentUser && (
                <span className="hidden xl:inline text-xs font-semibold text-[#18382D] max-w-[80px] truncate">
                  {currentUser.name?.split(" ")[0]}
                </span>
              )}
            </button>

            {/* Shopping Bag */}
            <button
              onClick={openCart}
              className="p-2 sm:px-3 sm:py-2 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-full transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              title="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#B88D4E]" />
              <span className="text-xs font-semibold font-mono hidden sm:inline">
                {cartCount}
              </span>
            </button>

            {/* Staff POS & Terminal entry */}
            <button
              onClick={onRequestStaffPortal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDFA] hover:bg-[#E7ECE4] text-[#746B62] hover:text-[#18382D] border border-[#E6DCCF] rounded-full text-[11px] font-mono tracking-wider transition-all cursor-pointer ml-1"
              title="Store Cashier & POS Terminal"
            >
              <Lock className="w-3 h-3 text-[#B88D4E]" />
              <span>POS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navbar for Desktop Secondary Categories */}
      <div className="hidden lg:flex border-t border-[#E6DCCF]/60 bg-[#FFFDFA]/60 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between w-full text-xs text-[#746B62]">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavClick("under250")}
              className={`hover:text-[#18382D] transition-colors cursor-pointer flex items-center gap-1 ${
                activeCategory === "under250" ? "text-[#18382D] font-bold" : ""
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#B88D4E]"></span>
              <span>Affordable Luxury Under ₹250</span>
            </button>

            <button
              onClick={() => handleNavClick("antiTarnish")}
              className={`hover:text-[#18382D] transition-colors cursor-pointer flex items-center gap-1 ${
                activeCategory === "antiTarnish" ? "text-[#18382D] font-bold" : ""
              }`}
            >
              <Gem className="w-3 h-3 text-[#18382D]" />
              <span>Anti-Tarnish 18K Polish</span>
            </button>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button onClick={() => openInfo("about")} className="hover:text-[#18382D] cursor-pointer">
              Atelier Philosophy
            </button>
            <button onClick={() => openInfo("care")} className="hover:text-[#18382D] cursor-pointer">
              Jewellery Care
            </button>
            <button onClick={() => openInfo("faqs")} className="hover:text-[#18382D] cursor-pointer">
              Support &amp; FAQs
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFDFA] border-b border-[#E6DCCF] shadow-lg animate-fadeIn px-4 py-6 space-y-5">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#746B62] block px-2">
              Collections
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleNavClick(cat.id)}
                  className={`p-3 text-left rounded-xl transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-[#18382D] text-white font-semibold"
                      : "bg-[#F7F2EA] text-[#1B1A18] hover:bg-[#E7ECE4]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E6DCCF] space-y-2 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#746B62] block px-2">
              Customer Services
            </span>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => { openInfo("about"); setMobileMenuOpen(false); }}
                className="px-2 py-2 text-left text-[#18382D] hover:bg-[#F7F2EA] rounded-lg cursor-pointer"
              >
                About ZOYARA Atelier
              </button>
              <button
                onClick={() => { openInfo("care"); setMobileMenuOpen(false); }}
                className="px-2 py-2 text-left text-[#18382D] hover:bg-[#F7F2EA] rounded-lg cursor-pointer"
              >
                Jewellery Care Guide
              </button>
              <button
                onClick={() => { openInfo("shipping"); setMobileMenuOpen(false); }}
                className="px-2 py-2 text-left text-[#18382D] hover:bg-[#F7F2EA] rounded-lg cursor-pointer"
              >
                Shipping &amp; Hygiene Return Policy
              </button>
              <button
                onClick={() => { openInfo("contact"); setMobileMenuOpen(false); }}
                className="px-2 py-2 text-left text-[#18382D] hover:bg-[#F7F2EA] rounded-lg cursor-pointer"
              >
                WhatsApp Boutique Desk
              </button>
            </div>
          </div>

          {/* Discreet Mobile Staff Terminal */}
          <div className="pt-3 border-t border-[#E6DCCF]">
            <button
              onClick={() => { onRequestStaffPortal(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 bg-[#F7F2EA] text-[#746B62] hover:text-[#18382D] rounded-xl text-xs font-mono flex items-center justify-center gap-2 cursor-pointer border border-[#E6DCCF]"
            >
              <Lock className="w-3.5 h-3.5 text-[#B88D4E]" />
              <span>Store POS &amp; Staff Counter</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
