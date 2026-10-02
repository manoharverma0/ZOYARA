import React from "react";
import { 
  ShoppingBag, 
  Sparkles, 
  Lock, 
  ShieldCheck 
} from "lucide-react";

export default function Navbar({ 
  onSelectCategory, 
  activeCategory, 
  cartCount, 
  openCart,
  onRequestStaffPortal
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] transition-all no-print">
      {/* Top announcement bar */}
      <div className="bg-[#18181B] text-[#FAF8F5] text-[11px] font-medium tracking-[0.15em] uppercase py-1.5 px-4 flex items-center justify-center gap-6">
        <div className="hidden sm:flex items-center gap-1.5 text-[#A89C8E]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Anti-Tarnish 18K Polish • Zero-Wire Bras • Pure Cotton Gusset</span>
        </div>

        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>Complimentary Packaging on All Orders</span>
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Brand Identity: ZOYARA & Primary Desktop Navigation */}
          <div className="flex items-center gap-8 lg:gap-12">
            {/* Brand Logo - Aligned to Left */}
            <div 
              onClick={() => onSelectCategory("all")}
              className="cursor-pointer group flex flex-col items-start select-none py-1 text-left"
            >
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[0.22em] font-medium text-[#1A1A1E] group-hover:text-[#8C6D3F] transition-colors leading-none">
                ZOYARA
              </span>
              <span className="text-[9px] tracking-[0.38em] text-[#8C7E6C] uppercase font-sans mt-1">
                Atelier &amp; Boutique
              </span>
            </div>

            {/* Desktop Navigation Links: Jewellery, Bras, Underwear, Anti-Tarnish */}
            <nav className="hidden md:flex items-center space-x-6 text-xs tracking-[0.14em] uppercase font-medium text-[#4A4036]">
              <button
                onClick={() => onSelectCategory("all")}
                className={`hover:text-[#18181B] transition-colors cursor-pointer py-1 ${
                  activeCategory === "all" ? "text-[#18181B] font-bold border-b-2 border-[#18181B]" : ""
                }`}
              >
                All Pieces
              </button>
              <button
                onClick={() => onSelectCategory("Jewellery")}
                className={`hover:text-[#18181B] transition-colors cursor-pointer py-1 ${
                  activeCategory === "Jewellery" ? "text-[#18181B] font-bold border-b-2 border-[#18181B]" : ""
                }`}
              >
                Fine Jewellery
              </button>
              <button
                onClick={() => onSelectCategory("Bras")}
                className={`hover:text-[#18181B] transition-colors cursor-pointer py-1 ${
                  activeCategory === "Bras" ? "text-[#18181B] font-bold border-b-2 border-[#18181B]" : ""
                }`}
              >
                Bras &amp; Bralettes
              </button>
              <button
                onClick={() => onSelectCategory("Underwear")}
                className={`hover:text-[#18181B] transition-colors cursor-pointer py-1 ${
                  activeCategory === "Underwear" ? "text-[#18181B] font-bold border-b-2 border-[#18181B]" : ""
                }`}
              >
                Girls Underwear
              </button>
              <button
                onClick={() => onSelectCategory("antiTarnish")}
                className={`hover:text-[#18181B] transition-colors cursor-pointer py-1 ${
                  activeCategory === "antiTarnish" ? "text-[#18181B] font-bold border-b-2 border-[#18181B]" : ""
                }`}
              >
                Anti-Tarnish
              </button>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Staff Terminal Button (Prominent for cashiers & staff) */}
            <button
              onClick={onRequestStaffPortal}
              className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#18181B] border border-[#DDD2C2] hover:border-[#18181B] rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Staff Billing &amp; Vyapar Management Portal"
            >
              <Lock className="w-3.5 h-3.5 text-[#8C6D3F]" />
              <span className="hidden sm:inline font-mono text-[11px]">STAFF LOGIN</span>
            </button>

            {/* Shopping Bag Icon for Customer */}
            <button
              onClick={openCart}
              className="relative px-3.5 py-2 rounded-full bg-[#18181B] hover:bg-[#2B2B30] text-[#FAF8F5] transition-all cursor-pointer border border-[#18181B] flex items-center gap-2 shadow-xs"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline text-xs font-semibold tracking-wider font-mono text-white">
                {cartCount > 0 ? `BAG (${cartCount})` : "BAG"}
              </span>
              {cartCount > 0 && (
                <span className="sm:hidden absolute -top-1 -right-1 bg-[#D4AF37] text-black font-sans font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FAF8F5] shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1.5 py-2.5 border-t border-[#E8E2D8] text-[11px] tracking-wider uppercase font-medium text-[#6B5E4F] overflow-x-auto scrollbar-none px-1">
          <button 
            onClick={() => onSelectCategory("all")} 
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${activeCategory === "all" ? "bg-[#18181B] text-white font-bold" : "hover:text-[#18181B]"}`}
          >
            All
          </button>
          <button 
            onClick={() => onSelectCategory("Jewellery")} 
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${activeCategory === "Jewellery" ? "bg-[#18181B] text-white font-bold" : "hover:text-[#18181B]"}`}
          >
            Jewellery
          </button>
          <button 
            onClick={() => onSelectCategory("Bras")} 
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${activeCategory === "Bras" ? "bg-[#18181B] text-white font-bold" : "hover:text-[#18181B]"}`}
          >
            Bras
          </button>
          <button 
            onClick={() => onSelectCategory("Underwear")} 
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${activeCategory === "Underwear" ? "bg-[#18181B] text-white font-bold" : "hover:text-[#18181B]"}`}
          >
            Underwear
          </button>
          <button 
            onClick={() => onSelectCategory("antiTarnish")} 
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${activeCategory === "antiTarnish" ? "bg-[#18181B] text-white font-bold" : "hover:text-[#18181B]"}`}
          >
            Anti-Tarnish
          </button>
          <button 
            onClick={onRequestStaffPortal} 
            className="px-3 py-1 rounded-full whitespace-nowrap text-[#8C6D3F] font-bold flex items-center gap-1 hover:bg-[#EFE9DF]"
          >
            <Lock className="w-3 h-3" />
            <span>Staff</span>
          </button>
        </div>
      </div>
    </header>
  );
}
