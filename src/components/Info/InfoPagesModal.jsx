import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Truck, 
  RotateCcw, 
  HelpCircle, 
  Phone, 
  Heart,
  ChevronDown,
  MessageCircle,
  MapPin,
  Clock
} from "lucide-react";
import { STORE_SETTINGS } from "../../data/initialProducts";

export default function InfoPagesModal({ isOpen, onClose, initialTab = "about" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openFaq, setOpenFaq] = useState(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "What makes ZOYARA jewellery anti-tarnish and waterproof?",
      a: "Our fine jewellery is crafted using high-grade 316L surgical stainless steel or premium brass with 18K gold vacuum PVD (Physical Vapor Deposition) plating. This creates a bonded coating that resists sweat, moisture, and daily wear without turning green or tarnishing."
    },
    {
      q: "Are the wireless bras and bralettes padded?",
      a: "Yes! Our seamless wireless bralettes feature ultra-breathable, removable honeycomb foam pads that provide natural shaping and zero-show coverage without uncomfortable metal underwires."
    },
    {
      q: "What is your intimate wear hygiene and return policy?",
      a: "For strict hygiene and health safety reasons, ladies panties and intimate briefs cannot be returned or exchanged once the sealed packaging is opened. If you receive a defective or incorrect item, notify our WhatsApp care team within 48 hours for an instant replacement."
    },
    {
      q: "How does the 7-day jewellery exchange work?",
      a: "Fashion jewellery items can be exchanged within 7 days of delivery as long as the product is unworn, in original luxury gift packaging, and has its barcode tag intact."
    },
    {
      q: "How long does delivery take?",
      a: "We ship orders within 24 hours from our Delhi boutique. Metro cities typically receive delivery within 2 to 3 days, and rest of India within 3 to 5 business days. Express shipping is free on orders above ₹499."
    },
    {
      q: "Is the intimate wear packaging discreet?",
      a: "Absolutely. All intimate apparel is shipped in discreet, opaque luxury cardboard packaging with no intimate product names displayed on the outer shipping box."
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#121214]/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E6DCCF] flex flex-col my-auto max-h-[92vh] overflow-hidden relative text-[#1B1A18]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#F7F2EA] border-b border-[#E6DCCF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#18382D]">
              ZOYARA
            </span>
            <span className="text-xs text-[#746B62] border-l border-[#E6DCCF] pl-3">
              Atelier &amp; Boutique Guide
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E6DCCF] text-[#746B62] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E6DCCF] bg-white overflow-x-auto text-xs font-semibold uppercase tracking-wider scrollbar-none">
          {[
            { id: "about", label: "Brand Story", icon: Sparkles },
            { id: "care", label: "Jewellery Care", icon: Heart },
            { id: "shipping", label: "Shipping & Delivery", icon: Truck },
            { id: "returns", label: "Returns Policy", icon: RotateCcw },
            { id: "faqs", label: "FAQs", icon: HelpCircle },
            { id: "contact", label: "Contact Us", icon: Phone }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected ? "border-[#18382D] text-[#18382D] bg-[#F7F2EA]/40" : "border-transparent text-[#746B62] hover:text-[#1B1A18]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* TAB 1: ABOUT ZOYARA */}
          {activeTab === "about" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B88D4E]">
                  Our Philosophy
                </span>
                <h3 className="font-serif text-3xl text-[#18382D] font-light">
                  Quiet Luxury Made Truly Accessible
                </h3>
                <p className="text-xs sm:text-sm text-[#746B62] leading-relaxed">
                  Founded with a singular vision, ZOYARA bridges the gap between high-end bespoke aesthetics and accessible Indian daily wear. Why should exquisite, water-resistant jewellery or featherlight wireless lingerie cost thousands?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mx-auto text-xs">
                    18K
                  </div>
                  <h4 className="font-serif font-medium text-sm text-[#18382D]">Vacuum Polish</h4>
                  <p className="text-[11px] text-[#746B62]">Waterproof, shower-friendly &amp; sweat-resistant coatings.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mx-auto text-xs">
                    0-W
                  </div>
                  <h4 className="font-serif font-medium text-sm text-[#18382D]">Zero Wire Bras</h4>
                  <p className="text-[11px] text-[#746B62]">Second-skin microfibre with no poke, no pinch comfort.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mx-auto text-xs">
                    100%
                  </div>
                  <h4 className="font-serif font-medium text-sm text-[#18382D]">Organic Cotton</h4>
                  <p className="text-[11px] text-[#746B62]">Double-layer breathable gusset lining for delicate skin.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JEWELLERY CARE GUIDE */}
          {activeTab === "care" && (
            <div className="max-w-2xl mx-auto space-y-5 text-xs text-[#746B62]">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Jewellery Care Guide</h3>
                <p>Preserve the brilliant lustre of your 18K anti-tarnish jewellery for years to come.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF]">
                  <h4 className="font-semibold text-sm text-[#18382D] mb-1">1. Keep Away From Direct Harsh Perfumes</h4>
                  <p>Apply perfumes, lotions, and hair sprays first. Allow them to dry completely before donning your jewellery to avoid chemical chemical film accumulation.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF]">
                  <h4 className="font-semibold text-sm text-[#18382D] mb-1">2. Wipe Gently After Wear</h4>
                  <p>After a day out, gently wipe your jewellery using a soft microfiber cloth to remove skin oils and dust before tucking it into your storage pouch.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF]">
                  <h4 className="font-semibold text-sm text-[#18382D] mb-1">3. Individual Pouch Storage</h4>
                  <p>Store each piece in its complimentary ZOYARA zip pouch or box. Keeping items separate prevents friction and scratches between chains and gemstones.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHIPPING & DELIVERY */}
          {activeTab === "shipping" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs text-[#746B62]">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Shipping &amp; Delivery</h3>
                <p>Fast, reliable, and discreet express delivery across India.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">Standard Express Shipping</h4>
                  <p>Flat ₹49 on orders below ₹499. Orders above ₹499 enjoy 100% complimentary free express delivery.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">Delivery Timeline</h4>
                  <p>Delhi-NCR &amp; Metro cities: 2 to 3 working days. Tier 2 &amp; Tier 3 cities: 3 to 5 working days.</p>
                </div>
              </div>

              <div className="p-4 bg-[#E7ECE4] rounded-xl border border-[#C2D4BE] text-[#18382D]">
                <strong className="block mb-1">Discreet Packaging Promise:</strong>
                All underwear, panties, and intimate apparel orders are delivered in plain, opaque boxes with no product descriptions on the outer label.
              </div>
            </div>
          )}

          {/* TAB 4: RETURNS & EXCHANGES */}
          {activeTab === "returns" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs text-[#746B62]">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Returns &amp; Exchange Policy</h3>
                <p>Fair, transparent terms designed with hygiene and patron trust at the center.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">Jewellery — 7-Day Exchange Window</h4>
                  <p>We gladly offer exchange on jewellery items within 7 days of delivery. Items must be unused, in original packaging, with barcode tags intact.</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                  <h4 className="font-semibold text-sm">Intimate Wear — Hygiene Non-Returnable</h4>
                  <p>Underwear, panties, and briefs cannot be returned or exchanged once the hygienic hygiene seal is opened. If you receive a damaged product or size packing error, contact us immediately for a direct replacement.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQS */}
          {activeTab === "faqs" && (
            <div className="max-w-2xl mx-auto space-y-3 text-xs">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Frequently Asked Questions</h3>
                <p className="text-[#746B62]">Find answers to common queries regarding ordering, sizing, and quality.</p>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-[#E6DCCF] rounded-xl bg-white overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between font-medium text-[#1B1A18] hover:bg-[#F7F2EA] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-[#746B62] transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === idx && (
                      <div className="px-4 pb-4 text-[#746B62] leading-relaxed border-t border-[#F7F2EA] pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT US */}
          {activeTab === "contact" && (
            <div className="max-w-2xl mx-auto space-y-5 text-xs">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Connect with ZOYARA Atelier</h3>
                <p className="text-[#746B62]">Our boutique concierge is at your service 7 days a week.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                    <MapPin className="w-4 h-4 text-[#B88D4E]" />
                    <span>Showroom Location</span>
                  </div>
                  <p className="text-[#746B62] leading-relaxed">
                    {STORE_SETTINGS.address || "Shop 4, Luxury Arcade, Main Market"}<br />
                    New Delhi, India - 110049
                  </p>
                  <div className="text-[11px] text-[#746B62] flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Open Daily: 10:30 AM – 9:00 PM</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Direct Concierge Desk</span>
                  </div>
                  <p className="text-[#746B62] leading-relaxed">
                    Quick ordering, custom sizing guidance &amp; delivery inquiries on WhatsApp.
                  </p>
                  <a
                    href={`https://wa.me/${STORE_SETTINGS.whatsappNumber || "919876543210"}?text=Hello%20ZOYARA%2C%20I%20have%20an%20inquiry.`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#B88D4E]" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
