import React, { useState, useMemo } from "react";
import { X, Search, Sparkles } from "lucide-react";
import { formatCurrency } from "../../utils/barcode";

export default function SearchModal({ 
  isOpen, 
  onClose, 
  products, 
  onOpenProductDetail 
}) {
  const [query, setQuery] = useState("");

  const trendingTags = [
    "Anti-Tarnish",
    "Baroque Pearl",
    "Zero Wire",
    "Laser-Cut Briefs",
    "Croissant Ring",
    "Choker",
    "Cotton Gusset"
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
      (p.material && p.material.toLowerCase().includes(q)) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [products, query]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-[#121214]/65 backdrop-blur-sm animate-fadeIn pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E6DCCF] overflow-hidden text-[#1B1A18] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E6DCCF] flex items-center gap-3 bg-[#F7F2EA]">
          <Search className="w-5 h-5 text-[#18382D] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anti-tarnish jewellery, wirefree bras, seamless underwear..."
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base focus:outline-none placeholder-[#746B62]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[#746B62] hover:text-[#1B1A18] text-xs font-semibold px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E6DCCF] text-[#746B62] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trending Suggestions when search query is empty */}
        {!query && (
          <div className="p-5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#746B62] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B88D4E]" />
              <span>Trending Searches</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 bg-[#F7F2EA] hover:bg-[#E6DCCF] text-[#18382D] rounded-full text-xs transition-colors cursor-pointer border border-[#E6DCCF]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {query && (
          <div className="max-h-96 overflow-y-auto p-4 divide-y divide-[#F7F2EA]">
            {results.length === 0 ? (
              <div className="py-8 text-center text-[#746B62]">
                <p className="text-sm">No creations found matching "{query}"</p>
                <p className="text-xs text-[#746B62] mt-1">Try searching for "Pearl", "Bralette", "Ring", or "Cotton".</p>
              </div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { onOpenProductDetail(item); onClose(); }}
                  className="py-2.5 px-2 hover:bg-[#F7F2EA] rounded-xl flex items-center justify-between cursor-pointer transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg bg-[#F7F2EA] border border-[#E6DCCF] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-[#1B1A18] truncate">{item.title}</div>
                      <div className="text-[11px] text-[#746B62] font-mono">
                        {item.category} • {item.sku}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-semibold text-xs text-[#18382D]">
                      {formatCurrency(item.price)}
                    </div>
                    {item.badge && (
                      <span className="text-[9px] uppercase font-bold text-[#B88D4E] tracking-wider block">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
