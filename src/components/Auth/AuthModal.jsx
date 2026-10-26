import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  User, 
  Mail, 
  MapPin,
  MessageCircle,
  Smartphone
} from "lucide-react";
import { 
  loginCustomerWithPhone,
  getStoreSettings 
} from "../../services/storage";
import { 
  sendSupabaseEmailOtp, 
  verifySupabaseEmailOtp, 
  getSupabaseCredentials 
} from "../../services/supabase";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  // 'email' (primary free Supabase OTP) | 'phone' (direct mobile patron login)
  const [authMode, setAuthMode] = useState("email"); 
  const [step, setStep] = useState("input"); // 'input' | 'otp'

  // Phone Sign-In State
  const [phone, setPhone] = useState("");
  const [phoneName, setPhoneName] = useState("");
  const [phoneCity, setPhoneCity] = useState("");

  // Email OTP (Supabase) State
  const [emailInput, setEmailInput] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  // Common State
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const { isConfigured: isSupabaseActive } = getSupabaseCredentials();
  const storeSettings = getStoreSettings();
  const storeWhatsApp = (storeSettings?.whatsappNumber || "919876543210").replace(/\D/g, "");

  useEffect(() => {
    let timer;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Direct Mobile Patron Sign-In (Zero SMS cost, instant, no fake OTP)
  const handlePhoneLogin = (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!phoneName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = loginCustomerWithPhone(cleanPhone, phoneName, "", phoneCity);
      setLoading(false);
      if (res.success) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || "Could not sign in with this mobile number.");
      }
    }, 300);
  };

  // Send Free Supabase Email OTP
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const res = await sendSupabaseEmailOtp(cleanEmail);
    setLoading(false);
    if (res.success) {
      setNotice(res.message);
      setStep("otp");
      setCountdown(60);
    } else {
      setError(res.error || "Could not send email OTP. Ensure Supabase is configured.");
    }
  };

  // Verify Email OTP via Supabase
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setError("");
    const cleanCode = emailOtp.trim();
    if (!cleanCode) {
      setError("Please enter the verification code sent to your email.");
      return;
    }

    setLoading(true);
    const res = await verifySupabaseEmailOtp(emailInput.trim().toLowerCase(), cleanCode);
    setLoading(false);
    if (res.success) {
      const userObj = {
        id: res.user?.id || `usr-${Date.now()}`,
        email: emailInput.trim().toLowerCase(),
        name: res.user?.user_metadata?.full_name || "ZOYARA Patron",
        phone: res.user?.phone || ""
      };
      onSuccess(userObj);
      onClose();
    } else {
      setError(res.error || "Invalid or expired email code.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-md rounded-2xl shadow-2xl border border-[#E6DCCF] p-6 sm:p-8 relative overflow-hidden text-[#1B1A18]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#F7F2EA] text-[#746B62] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Banner */}
        <div className="text-center mb-6">
          <span className="font-serif text-3xl tracking-[0.2em] font-medium text-[#18382D] block">
            ZOYARA
          </span>
          <span className="text-[10px] tracking-[0.35em] uppercase font-sans text-[#746B62] block mt-1">
            Atelier &amp; Boutique
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-[#B88D4E]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Patron Authentication</span>
          </div>
        </div>

        {/* Auth Method Switcher (Only at input step) */}
        {step === "input" && (
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-[#F7F2EA] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode("email"); setError(""); setNotice(""); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === "email" 
                  ? "bg-white text-[#18382D] shadow-xs" 
                  : "text-[#746B62] hover:text-[#18382D]"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#18382D]" />
              <span>Free Email OTP</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("phone"); setError(""); setNotice(""); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === "phone" 
                  ? "bg-white text-[#18382D] shadow-xs" 
                  : "text-[#746B62] hover:text-[#18382D]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Mobile Sign-in</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}

        {/* ========================================================
            TAB 1: FREE EMAIL OTP VIA SUPABASE AUTH
        ======================================================== */}
        {step === "input" && authMode === "email" && (
          <form onSubmit={handleSendEmailOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1.5">
                Email Address
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white overflow-hidden focus-within:border-[#18382D] focus-within:ring-1 focus-within:ring-[#18382D] transition-all">
                <div className="px-3 py-2.5 bg-[#F7F2EA] text-[#746B62] border-r border-[#E6DCCF]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  autoFocus
                  required
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-[#746B62] mt-1.5">
                {isSupabaseActive 
                  ? "Supabase will deliver a secure 6-digit code directly to your email inbox." 
                  : "Live Supabase cloud authentication."}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !emailInput.includes("@")}
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? "Sending Code..." : "Send Free Email OTP"}
              <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
            </button>

            <div className="pt-2 border-t border-[#E6DCCF] text-center">
              <div className="text-[11px] text-[#746B62] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Free Live Cloud Verification • Powered by Supabase</span>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================
            TAB 1 (STEP 2): VERIFY 6-DIGIT EMAIL OTP
        ======================================================== */}
        {step === "otp" && authMode === "email" && (
          <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
            <div className="text-center">
              <p className="text-xs text-[#746B62]">
                Enter the 6-digit verification code sent to:
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-mono font-semibold text-xs text-[#18382D]">
                  {emailInput}
                </span>
                <button
                  type="button"
                  onClick={() => { setStep("input"); setError(""); setNotice(""); }}
                  className="text-xs text-[#B88D4E] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                maxLength={8}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-Digit OTP"
                autoFocus
                className="w-full text-center text-2xl tracking-[0.35em] font-mono font-bold p-3 bg-white border-2 border-[#E6DCCF] rounded-xl focus:border-[#18382D] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || emailOtp.length < 6}
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
              <CheckCircle2 className="w-4 h-4 text-[#B88D4E]" />
            </button>

            <div className="text-center pt-2">
              {countdown > 0 ? (
                <span className="text-xs text-[#746B62] font-mono">
                  Resend code in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  className="text-xs text-[#18382D] font-semibold hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend Email Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* ========================================================
            TAB 2: MOBILE NUMBER PATRON SIGN-IN (DIRECT & CLEAN)
        ======================================================== */}
        {step === "input" && authMode === "phone" && (
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white overflow-hidden focus-within:border-[#18382D] focus-within:ring-1 focus-within:ring-[#18382D] transition-all">
                <div className="px-3 py-2.5 bg-[#F7F2EA] text-xs font-semibold text-[#18382D] border-r border-[#E6DCCF] flex items-center gap-1">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  autoFocus
                  required
                  className="flex-1 px-3 py-2.5 text-sm font-mono tracking-wider bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1.5">
                Full Name
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white overflow-hidden focus-within:border-[#18382D] focus-within:ring-1 focus-within:ring-[#18382D] transition-all">
                <div className="px-3 py-2.5 bg-[#F7F2EA] text-[#746B62] border-r border-[#E6DCCF]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phoneName}
                  onChange={(e) => setPhoneName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1.5">
                City / Delivery Area (Optional)
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white overflow-hidden focus-within:border-[#18382D] focus-within:ring-1 focus-within:ring-[#18382D] transition-all">
                <div className="px-3 py-2.5 bg-[#F7F2EA] text-[#746B62] border-r border-[#E6DCCF]">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phoneCity}
                  onChange={(e) => setPhoneCity(e.target.value)}
                  placeholder="e.g. South Delhi, Mumbai"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10 || !phoneName.trim()}
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Continue as Patron"}
              <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
            </button>

            <div className="pt-2 border-t border-[#E6DCCF] text-center">
              <div className="text-[11px] text-[#746B62] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Instant Access • Saved Cart &amp; Order Tracking</span>
              </div>
            </div>
          </form>
        )}

        {/* Footer Support Concierge (Opens chat with ZOYARA Store, NEVER to customer's own number) */}
        <div className="mt-5 pt-3 border-t border-[#E6DCCF] text-center">
          <a
            href={`https://api.whatsapp.com/send?phone=${storeWhatsApp}&text=${encodeURIComponent("Hi ZOYARA, I need assistance with my boutique account / order.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:text-[#128C7E] font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Need Help? Chat with ZOYARA Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
