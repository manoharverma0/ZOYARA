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
  MapPin,
  Clock,
  Mail,
  ShieldCheck,
  FileText
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
      q: "What is your intimate wear hygiene policy?",
      a: "For strict hygiene and health safety reasons, intimate wear (panties, briefs, and stick-on bras) cannot be returned or exchanged once the packaging seal is broken. If you receive a damaged or incorrect size item, notify our care team within 48 hours for a prompt replacement."
    },
    {
      q: "How does the jewellery exchange work?",
      a: "Fashion jewellery items can be exchanged within 7 days of delivery as long as the product is unworn, in original luxury gift packaging, and has its barcode tag intact."
    },
    {
      q: "How long does delivery take?",
      a: "We ship orders within 24 hours. Metro cities typically receive delivery within 2 to 3 business days, and the rest of India within 3 to 5 business days via trusted couriers (Delhivery, BlueDart). Express shipping is free on orders above ₹499."
    },
    {
      q: "How are refunds processed for online payments?",
      a: "Approved refunds are initiated immediately and credited back to your original payment method (Bank account, Credit/Debit Card, or UPI) within 5 to 7 business days via our payment partner Razorpay."
    }
  ];

  const tabs = [
    { id: "about", label: "About Us", icon: Sparkles },
    { id: "shipping", label: "Shipping Policy", icon: Truck },
    { id: "returns", label: "Refund & Cancellation", icon: RotateCcw },
    { id: "terms", label: "Terms of Service", icon: FileText },
    { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
    { id: "contact", label: "Contact Us", icon: Phone },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "care", label: "Jewellery Care", icon: Heart }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#121214]/70 backdrop-blur-sm animate-fadeIn"
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
              Official Store Policies &amp; Information
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-[#E6DCCF] text-[#746B62] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E6DCCF] bg-white overflow-x-auto text-xs font-semibold uppercase tracking-wider scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
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
          
          {/* TAB 1: ABOUT US */}
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
                  Founded with a singular vision, ZOYARA Atelier &amp; Boutique crafts affordable luxury daily wear. We engineer waterproof, sweat-resistant 18K vacuum PVD jewellery and zero-wire, seamless everyday intimates for patrons seeking grace, longevity, and hygiene.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mx-auto text-xs font-bold">
                    18K
                  </div>
                  <h4 className="font-serif font-medium text-sm text-[#18382D]">Vacuum Polish</h4>
                  <p className="text-[11px] text-[#746B62]">Waterproof, shower-friendly &amp; sweat-resistant coatings.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mx-auto text-xs font-bold">
                    0-W
                  </div>
                  <h4 className="font-serif font-medium text-sm text-[#18382D]">Zero Wire Bras</h4>
                  <p className="text-[11px] text-[#746B62]">Second-skin microfibre with no poke, no pinch comfort.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#18382D] text-[#B88D4E] flex items-center justify-center mx-auto text-xs font-bold">
                    100%
                  </div>
                  <h4 className="font-serif font-medium text-sm text-[#18382D]">Organic Cotton</h4>
                  <p className="text-[11px] text-[#746B62]">Double-layer breathable gusset lining for delicate skin.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING & DELIVERY POLICY */}
          {activeTab === "shipping" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs text-[#746B62]">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Shipping &amp; Delivery Policy</h3>
                <p>Express courier fulfillment across all serviceable PIN codes in India.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] space-y-1.5">
                  <h4 className="font-semibold text-sm text-[#18382D]">Delivery Timelines</h4>
                  <p>• <strong>Delhi-NCR &amp; Metro Cities:</strong> 2 to 3 business days.</p>
                  <p>• <strong>Rest of India:</strong> 3 to 5 business days.</p>
                  <p className="text-[11px] pt-1">Orders placed before 2:00 PM IST are dispatched on the same business day.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] space-y-1.5">
                  <h4 className="font-semibold text-sm text-[#18382D]">Shipping Charges</h4>
                  <p>• <strong>Orders ₹499 &amp; Above:</strong> 100% FREE Express Delivery.</p>
                  <p>• <strong>Orders Below ₹499:</strong> Flat nominal shipping fee of ₹49 across India.</p>
                </div>
              </div>

              <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF] space-y-1.5">
                <h4 className="font-semibold text-sm text-[#18382D]">Courier Partners &amp; Tracking</h4>
                <p>We ship through verified tier-1 logistics partners including Delhivery, BlueDart, and DTDC. As soon as your order is dispatched, a real-time tracking link and AWB number are communicated to your registered email and mobile number.</p>
              </div>

              <div className="p-4 bg-[#E7ECE4] rounded-xl border border-[#C2D4BE] text-[#18382D]">
                <strong className="block mb-1">Discreet Packaging Guarantee:</strong>
                All intimates and jewellery items are shipped in sturdy, tamper-proof, opaque boxes with no intimate wear item descriptions on the outer shipping airway bill.
              </div>
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION POLICY (RAZORPAY COMPLIANT) */}
          {activeTab === "returns" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs text-[#746B62]">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Cancellation &amp; Refund Policy</h3>
                <p>Transparent, fair terms in accordance with RBI guidelines and Indian E-Commerce rules.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1.5">
                  <h4 className="font-semibold text-sm text-[#18382D]">1. Order Cancellation</h4>
                  <p>Orders can be cancelled free of charge at any time prior to shipment dispatch. Once the parcel is handed over to the courier partner, cancellations cannot be processed; you may initiate an exchange after delivery.</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1.5">
                  <h4 className="font-semibold text-sm text-[#18382D]">2. 7-Day Jewellery Exchange</h4>
                  <p>We provide a 7-day exchange window for all fine jewellery products from the date of confirmed delivery. The item must be unused, in its original luxury pouch/box, and with its security barcode tag intact.</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1.5">
                  <h4 className="font-semibold text-sm">3. Intimate Apparel Hygiene Policy</h4>
                  <p>In accordance with health, hygiene, and consumer safety regulations, intimate underwear, panties, and shapewear cannot be returned or refunded once the tamper-evident packaging seal has been unsealed. If you receive a manufacturing defect or wrong size/item, please report within 48 hours for a direct replacement.</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1.5">
                  <h4 className="font-semibold text-sm text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>4. Refund Processing Timeline (Razorpay Verified)</span>
                  </h4>
                  <p>Upon receipt and quality inspection of the returned package, approved refunds are initiated within <strong>24 to 48 business hours</strong>.</p>
                  <p>Refunds are credited directly to the customer&apos;s <strong>original payment source (Bank Account, Credit/Debit Card, or UPI) within 5 to 7 business days</strong>, subject to your issuing bank&apos;s settlement schedule.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMS OF SERVICE (RAZORPAY MANDATORY) */}
          {activeTab === "terms" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs text-[#746B62]">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Terms of Service</h3>
                <p>Governing conditions for using ZOYARA Atelier &amp; Boutique platform.</p>
              </div>

              <div className="space-y-3 leading-relaxed">
                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">1. Overview &amp; Agreement</h4>
                  <p>This website is operated by <strong>ZOYARA Atelier &amp; Boutique</strong>. Throughout the site, the terms &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to ZOYARA. By visiting our site or purchasing goods from us, you engage in our &quot;Service&quot; and agree to be bound by these Terms.</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">2. User Eligibility &amp; Accounts</h4>
                  <p>By agreeing to these Terms, you represent that you are at least the age of majority in your state or province of residence. You agree to provide true, accurate, and complete information when making a purchase or registering an account.</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">3. Pricing, Products &amp; Taxes</h4>
                  <p>All prices listed on ZOYARA are in Indian Rupees (INR ₹) and are inclusive of applicable GST unless explicitly stated otherwise. We reserve the right to modify prices, discontinue products, or adjust promotions without prior notice.</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">4. Governing Law &amp; Jurisdiction</h4>
                  <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of <strong>India</strong>, and subject to the exclusive jurisdiction of the competent courts in <strong>Indore, Madhya Pradesh, India</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY POLICY (RAZORPAY MANDATORY) */}
          {activeTab === "privacy" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs text-[#746B62]">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Privacy Policy</h3>
                <p>How we protect, process, and safeguard your personal data under the IT Act 2000.</p>
              </div>

              <div className="space-y-3 leading-relaxed">
                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">1. Information We Collect</h4>
                  <p>When you visit or purchase from ZOYARA, we collect personal information you provide, including your full name, mobile number, delivery address, and email address, necessary for order fulfillment and digital tax invoice issuance.</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                  <h4 className="font-semibold text-sm text-emerald-900">2. Payment Security &amp; Banking Data</h4>
                  <p><strong>ZOYARA does NOT collect, view, or store your credit/debit card numbers, CVVs, UPI MPINs, or NetBanking passwords.</strong> All online transactions are processed through RBI-authorized, PCI-DSS Level 1 certified payment gateways (Razorpay) using 256-bit bank-grade SSL encryption.</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">3. Non-Disclosure &amp; Security</h4>
                  <p>We do not sell, rent, or trade your personal information to third parties. Data is shared exclusively with operational partners (such as courier logistics Delhivery/BlueDart and SMS gateway MSG91) solely to dispatch your parcels and verify your order.</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] space-y-1">
                  <h4 className="font-semibold text-sm text-[#18382D]">4. Grievance Officer Contact</h4>
                  <p>In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, grievance concerns can be addressed to our designated officer at <strong>zoyarafashion@gmail.com</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT US (KYC / AUDIT COMPLIANT) */}
          {activeTab === "contact" && (
            <div className="max-w-2xl mx-auto space-y-5 text-xs">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Contact Customer Care</h3>
                <p className="text-[#746B62]">Official communication channels for ZOYARA FASHION &amp; COMFORT patrons.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-xl border border-[#E6DCCF] space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                    <MapPin className="w-4 h-4 text-[#B88D4E]" />
                    <span>Registered Boutique Address</span>
                  </div>
                  <p className="text-[#746B62] leading-relaxed">
                    <strong>ZOYARA FASHION &amp; COMFORT</strong><br />
                    {STORE_SETTINGS.address || "45/1 Near Bangali Chourah"}<br />
                    Indore, Madhya Pradesh - 452001
                  </p>
                  <div className="text-[11px] text-[#746B62] flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Operating Hours: 10:30 AM – 9:00 PM IST (Mon–Sun)</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-[#E6DCCF] space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#18382D]">
                    <Mail className="w-4 h-4 text-[#B88D4E]" />
                    <span>Customer Support &amp; Grievances</span>
                  </div>
                  <p className="text-[#746B62] leading-relaxed">
                    <strong>Email:</strong> {STORE_SETTINGS.email || "zoyarafashion@gmail.com"}<br />
                    <strong>Helpline:</strong> {STORE_SETTINGS.phone || "+91 74709 32714"}<br />
                    <strong>Response SLA:</strong> Within 12 to 24 business hours
                  </p>
                  <div className="pt-1 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    ✓ Verified Customer Service Desk
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FAQS */}
          {activeTab === "faqs" && (
            <div className="max-w-2xl mx-auto space-y-3 text-xs">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Frequently Asked Questions</h3>
                <p className="text-[#746B62]">Answers to common queries regarding ordering, sizing, quality, and payment security.</p>
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

          {/* TAB 8: JEWELLERY CARE */}
          {activeTab === "care" && (
            <div className="max-w-2xl mx-auto space-y-5 text-xs text-[#746B62]">
              <div className="text-center space-y-1 pb-2">
                <h3 className="font-serif text-2xl text-[#18382D]">Jewellery Care Guide</h3>
                <p>Preserve the brilliant lustre of your 18K anti-tarnish jewellery.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF]">
                  <h4 className="font-semibold text-sm text-[#18382D] mb-1">1. Keep Away From Direct Harsh Perfumes</h4>
                  <p>Apply perfumes, lotions, and sprays first. Allow them to dry completely before wearing your jewellery.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF]">
                  <h4 className="font-semibold text-sm text-[#18382D] mb-1">2. Wipe Gently After Wear</h4>
                  <p>After a day out, gently wipe your jewellery using a soft microfiber cloth to remove skin oils and dust.</p>
                </div>

                <div className="p-4 bg-[#F7F2EA] rounded-xl border border-[#E6DCCF]">
                  <h4 className="font-semibold text-sm text-[#18382D] mb-1">3. Individual Pouch Storage</h4>
                  <p>Store each piece in its complimentary ZOYARA zip pouch or box to prevent scratches between chains and gemstones.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
