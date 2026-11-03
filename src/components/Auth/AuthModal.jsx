import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  User, 
  MapPin,
  Lock,
  RotateCcw,
  Smartphone
} from "lucide-react";
import { loginCustomerWithPhone } from "../../services/storage";
import { 
  sendCustomMsg91Otp, 
  verifyCustomMsg91Otp, 
  retryCustomMsg91Otp 
} from "../../services/msg91";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  // Steps: 'phone' (enter phone & details) -> 'otp' (custom 6-digit verification)
  const [step, setStep] = useState("phone");

  // Form State
  const [phone, setPhone] = useState("");
  const [phoneName, setPhoneName] = useState("");
  const [phoneCity, setPhoneCity] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [reqId, setReqId] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [countdown, setCountdown] = useState(60);

  // 60-second resend countdown timer
  useEffect(() => {
    let timer;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // STEP 1: Send real OTP via MSG91
  const handleSendOtp = async (e) => {
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
    const res = await sendCustomMsg91Otp(cleanPhone);
    setLoading(false);

    if (res.success) {
      setReqId(res.reqId || "");
      setStep("otp");
      setCountdown(60);
      setNotice("Verification code sent to your mobile via SMS / WhatsApp.");
    } else {
      setError(res.error || "Failed to send verification code. Please check the mobile number.");
    }
  };

  // STEP 2: Verify custom OTP with MSG91 servers (NO BYPASS ALLOWED)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const cleanOtp = otpCode.trim().replace(/\D/g, "");
    if (!cleanOtp || cleanOtp.length < 4) {
      setError("Please enter the verification code received on your phone.");
      return;
    }

    setLoading(true);
    const res = await verifyCustomMsg91Otp({ reqId, otp: cleanOtp });
    setLoading(false);

    if (res.success) {
      const cleanPhone = phone.replace(/\D/g, "");
      const loginRes = loginCustomerWithPhone(cleanPhone, phoneName, "", phoneCity);

      if (loginRes.success) {
        loginRes.user.msg91Verified = true;
        loginRes.user.msg91Token = res.token || "verified";
        onSuccess(loginRes.user);
        onClose();
      } else {
        setError(loginRes.error || "Login initialization failed.");
      }
    } else {
      setError(res.error || "Invalid verification code. Please verify and try again.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setNotice("");
    setLoading(true);
    const res = await retryCustomMsg91Otp(reqId);
    setLoading(false);
    if (res.success) {
      setCountdown(60);
      setNotice("A new code has been dispatched to your mobile number.");
    } else {
      setError(res.error || "Could not resend code. Please wait a moment.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-md rounded-2xl shadow-2xl border border-[#E6DCCF] p-5 sm:p-8 relative overflow-y-auto max-h-[92dvh] text-[#1B1A18] overscroll-contain"
        style={{ overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#F7F2EA] text-[#746B62] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <span className="font-serif text-3xl tracking-[0.2em] font-medium text-[#18382D] block">
            ZOYARA
          </span>
          <span className="text-[10px] tracking-[0.35em] uppercase font-sans text-[#746B62] block mt-1">
            Fashion &amp; Comfort
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-[#B88D4E]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Patron Sign In</span>
          </div>
        </div>

        {/* Alert Banners */}
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
            STEP 1: ENTER MOBILE NUMBER & DETAILS
        ======================================================== */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  autoFocus
                  required
                  className="flex-1 px-3 py-2.5 text-base sm:text-sm font-mono tracking-wider bg-transparent focus:outline-none"
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
                City (Optional)
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white overflow-hidden focus-within:border-[#18382D] focus-within:ring-1 focus-within:ring-[#18382D] transition-all">
                <div className="px-3 py-2.5 bg-[#F7F2EA] text-[#746B62] border-r border-[#E6DCCF]">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phoneCity}
                  onChange={(e) => setPhoneCity(e.target.value)}
                  placeholder="e.g. New Delhi, Mumbai"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || phone.length < 10 || !phoneName.trim()}
              className="w-full py-3.5 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4 text-[#B88D4E]" />
              <span>{loading ? "Sending Code..." : "Send Verification Code"}</span>
              <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
            </button>

            <div className="pt-3 border-t border-[#E6DCCF] text-center">
              <div className="text-[11px] text-[#746B62] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Secure • Verified by MSG91 Gateway</span>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================
            STEP 2: ENTER OTP (CUSTOM INLINE DIALOGUE - NO EXTERNAL POPUP)
        ======================================================== */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center pb-1">
              <p className="text-xs text-[#746B62]">
                Enter the verification code sent to:
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-mono font-bold text-sm text-[#18382D]">
                  +91 {phone}
                </span>
                <button
                  type="button"
                  onClick={() => { setStep("phone"); setOtpCode(""); setError(""); setNotice(""); }}
                  className="text-xs text-[#B88D4E] hover:underline font-semibold cursor-pointer"
                >
                  Edit Number
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                autoFocus
                required
                className="w-full text-center text-2xl tracking-[0.45em] font-mono font-bold p-3.5 bg-white border-2 border-[#18382D] rounded-xl focus:ring-2 focus:ring-[#B88D4E] focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 4}
              className="w-full min-h-[46px] py-3.5 bg-[#18382D] hover:bg-[#234E3F] active:scale-[0.99] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 touch-manipulation"
            >
              <Lock className="w-4 h-4 text-[#B88D4E]" />
              <span>{loading ? "Verifying with MSG91..." : "Verify & Sign In"}</span>
              <CheckCircle2 className="w-4 h-4 text-[#B88D4E]" />
            </button>

            {/* Countdown / Resend */}
            <div className="text-center pt-2">
              {countdown > 0 ? (
                <span className="text-xs text-[#746B62] font-mono">
                  Resend code in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs text-[#18382D] font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#B88D4E]" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-[#E6DCCF] text-center">
              <div className="text-[11px] text-[#746B62] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero Bypass • Verified via MSG91</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
