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
  sendCustomerOtp, 
  verifyCustomerOtp, 
  updateCustomerProfile
} from "../../services/storage";
import { 
  sendSupabaseEmailOtp, 
  verifySupabaseEmailOtp, 
  getSupabaseCredentials 
} from "../../services/supabase";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [authMode, setAuthMode] = useState("email"); // 'email' (primary free Supabase OTP) | 'whatsapp'
  const [step, setStep] = useState("input"); // 'input' | 'otp' | 'profile'
  
  // Phone / WhatsApp Auth State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [generatedPhoneCode, setGeneratedPhoneCode] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  // Email OTP (Supabase) State
  const [emailInput, setEmailInput] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  // Common State
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Profile fields for new users
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  const { isConfigured: isSupabaseActive } = getSupabaseCredentials();

  useEffect(() => {
    let timer;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Send WhatsApp / Mobile OTP (100% Free - No paid SMS gateway required)
  const handleSendMobileOtp = (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = sendCustomerOtp(cleanPhone);
      setLoading(false);
      if (res.success) {
        setGeneratedPhoneCode(res.otp || "");
        setWhatsappLink(res.whatsappUrl || "");
        setNotice(`Security Code: ${res.otp} (Valid for 5 mins). Click WhatsApp below or enter code directly.`);
        setStep("otp");
        setCountdown(60);
        setOtp(["", "", "", ""]);
      } else {
        setError(res.error || "Failed to generate verification code.");
      }
    }, 350);
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

  // Verify Phone OTP
  const handleVerifyPhoneOtp = (e) => {
    e.preventDefault();
    setError("");
    const fullOtp = otp.join("").trim();
    if (fullOtp.length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = verifyCustomerOtp(phone, fullOtp, { name, email, city });
      setLoading(false);
      if (res.success) {
        if (!res.user.name || res.user.name === "ZOYARA Patron") {
          setStep("profile");
        } else {
          onSuccess(res.user);
          onClose();
        }
      } else {
        setError(res.error || "Invalid verification code.");
      }
    }, 400);
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

  // Profile submission for new customers
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const res = updateCustomerProfile(cleanPhone, { 
      name: name.trim(), 
      email: email.trim(), 
      city: city.trim() 
    });
    if (res.success) {
      onSuccess(res.user);
      onClose();
    }
  };

  const handleOtpChange = (index, value) => {
    const val = value.slice(-1);
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 3) {
      const nextInput = document.getElementById(`live-otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`live-otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
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
              onClick={() => { setAuthMode("whatsapp"); setError(""); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === "whatsapp" 
                  ? "bg-white text-[#18382D] shadow-xs" 
                  : "text-[#746B62] hover:text-[#18382D]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp / Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("email"); setError(""); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === "email" 
                  ? "bg-white text-[#18382D] shadow-xs" 
                  : "text-[#746B62] hover:text-[#18382D]"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#18382D]" />
              <span>Free Email OTP</span>
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
            STEP 1: PHONE / WHATSAPP INPUT
        ======================================================== */}
        {step === "input" && authMode === "whatsapp" && (
          <form onSubmit={handleSendMobileOtp} className="space-y-4">
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
                  className="flex-1 px-3 py-2.5 text-sm font-mono tracking-wider bg-transparent focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-[#746B62] mt-1.5 flex items-center gap-1">
                <span>Free instant verification via WhatsApp or live security code.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? "Generating Code..." : "Get Verification Code"}
              <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
            </button>

            <div className="pt-2 border-t border-[#E6DCCF] text-center">
              <div className="text-[11px] text-[#746B62] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Free • Zero Spam • No Password Required</span>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================
            STEP 1 (ALT): FREE EMAIL OTP VIA SUPABASE
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
                  ? "We'll send a real 6-digit verification code directly to your email." 
                  : "Requires Supabase cloud config in Admin Settings for live delivery."}
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
          </form>
        )}

        {/* ========================================================
            STEP 2: OTP VERIFICATION (NO DEMO BYPASS)
        ======================================================== */}
        {step === "otp" && authMode === "whatsapp" && (
          <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
            <div className="text-center">
              <p className="text-xs text-[#746B62]">
                Enter the 4-digit code generated for:
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-mono font-semibold text-sm text-[#18382D]">
                  +91 {phone}
                </span>
                <button
                  type="button"
                  onClick={() => { setStep("input"); setError(""); }}
                  className="text-xs text-[#B88D4E] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            {/* OTP 4 Boxes */}
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`live-otp-box-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  className="w-12 h-14 text-center text-xl font-mono font-bold bg-white border-2 border-[#E6DCCF] rounded-xl focus:border-[#18382D] focus:outline-none transition-all shadow-2xs"
                />
              ))}
            </div>

            {/* Verification Code Box (Auto-generated for session) */}
            {generatedPhoneCode && (
              <div 
                onClick={() => setOtp(generatedPhoneCode.split(""))}
                className="p-2.5 bg-[#F7F2EA] hover:bg-[#EFE7D8] border border-[#DFD5C6] rounded-xl text-center cursor-pointer transition-colors group"
                title="Click to fill into boxes"
              >
                <span className="text-[10px] text-[#746B62] block uppercase tracking-wider mb-0.5 font-medium">
                  Your 4-Digit Security Code (Click to fill):
                </span>
                <span className="font-mono text-base font-bold text-[#18382D] tracking-[0.25em] group-hover:scale-105 inline-block transition-transform">
                  {generatedPhoneCode}
                </span>
              </div>
            )}

            {/* Instant Free WhatsApp Verification Button */}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Receive / Confirm on WhatsApp (Free)</span>
              </a>
            )}

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 4}
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
              <CheckCircle2 className="w-4 h-4 text-[#B88D4E]" />
            </button>

            {/* Resend Timer */}
            <div className="text-center pt-2">
              {countdown > 0 ? (
                <span className="text-xs text-[#746B62] font-mono">
                  Resend code in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendMobileOtp}
                  className="text-xs text-[#18382D] font-semibold hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request New Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 2 (ALT): EMAIL OTP VERIFICATION */}
        {step === "otp" && authMode === "email" && (
          <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
            <div className="text-center">
              <p className="text-xs text-[#746B62]">
                Enter the code sent to your email:
              </p>
              <div className="font-mono font-semibold text-xs text-[#18382D] mt-1">
                {emailInput}
              </div>
            </div>

            <div>
              <input
                type="text"
                maxLength={8}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                autoFocus
                className="w-full text-center text-xl tracking-[0.3em] font-mono font-bold p-3 bg-white border-2 border-[#E6DCCF] rounded-xl focus:border-[#18382D] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !emailOtp.trim()}
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Confirm Email Code"}
              <CheckCircle2 className="w-4 h-4 text-[#B88D4E]" />
            </button>

            <div className="text-center pt-2">
              {countdown > 0 ? (
                <span className="text-xs text-[#746B62] font-mono">
                  Resend in {countdown}s
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
            STEP 3: PROFILE COMPLETION FOR FIRST-TIME USERS
        ======================================================== */}
        {step === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="p-3 bg-[#F7F2EA] rounded-xl text-center">
              <p className="text-xs text-[#18382D] font-medium">
                Welcome to ZOYARA! Please confirm your name to complete your patron profile.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                Your Full Name *
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white overflow-hidden px-3 py-2.5">
                <User className="w-4 h-4 text-[#746B62] mr-2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Radhika Kapoor"
                  autoFocus
                  className="flex-1 text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                Email for Invoices (Optional)
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white overflow-hidden px-3 py-2.5">
                <Mail className="w-4 h-4 text-[#746B62] mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="radhika@example.com"
                  className="flex-1 text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                City / Region
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white overflow-hidden px-3 py-2.5">
                <MapPin className="w-4 h-4 text-[#746B62] mr-2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="flex-1 text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Complete Setup &amp; Access Bag</span>
              <CheckCircle2 className="w-4 h-4 text-[#B88D4E]" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
