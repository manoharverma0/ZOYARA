import React, { useState, useEffect } from "react";
import { 
  X, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  User, 
  Mail, 
  MapPin, 
  KeyRound 
} from "lucide-react";
import { sendCustomerOtp, verifyCustomerOtp } from "../../services/storage";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState("phone"); // 'phone' | 'otp' | 'profile'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [activeOtpCode, setActiveOtpCode] = useState("1234");
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Profile fields for new users
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    let timer;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError("");
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
        setActiveOtpCode(res.otp || "1234");
        setStep("otp");
        setCountdown(30);
      } else {
        setError(res.error || "Failed to send OTP. Please try again.");
      }
    }, 400);
  };

  const handleOtpChange = (index, value) => {
    const val = value.slice(-1);
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    const code = activeOtpCode || "1234";
    setOtp(code.split(""));
    setError("");
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError("");
    const fullOtp = otp.join("");
    if (fullOtp.length !== 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = verifyCustomerOtp(phone, fullOtp, { name, email, city });
      setLoading(false);
      if (res.success) {
        // If brand new without name, prompt profile
        if (!res.user.name || res.user.name === "ZOYARA Patron") {
          setStep("profile");
        } else {
          onSuccess(res.user);
          onClose();
        }
      } else {
        setError(res.error || "Invalid OTP entered.");
      }
    }, 450);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const res = verifyCustomerOtp(cleanPhone, "1234", { name: name.trim(), email: email.trim(), city: city.trim() });
    if (res.success) {
      onSuccess(res.user);
      onClose();
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
            <span>Patron Access &amp; Order Tracking</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: MOBILE NUMBER INPUT */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1.5">
                Enter Mobile Number
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
              <p className="text-[11px] text-[#746B62] mt-1.5">
                We'll send a 4-digit verification code to your phone.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Get OTP Verification"}
              <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
            </button>

            <div className="pt-2 border-t border-[#E6DCCF] text-center">
              <div className="text-[11px] text-[#746B62] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Secure • No Password Needed</span>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <p className="text-xs text-[#746B62]">
                Enter the 4-digit code sent to:
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-mono font-semibold text-sm text-[#18382D]">
                  +91 {phone}
                </span>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
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
                  id={`otp-box-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-mono font-bold bg-white border-2 border-[#E6DCCF] rounded-xl focus:border-[#18382D] focus:outline-none transition-all shadow-2xs"
                />
              ))}
            </div>

            {/* Demo Helper Banner so user can test seamlessly */}
            <div className="p-3 bg-[#E7ECE4] rounded-xl border border-[#C2D4BE] text-center space-y-1.5">
              <div className="text-xs text-[#18382D]">
                Demo Verification Code: <strong className="font-mono text-sm font-bold">{activeOtpCode}</strong> or <strong className="font-mono text-sm font-bold">1234</strong>
              </div>
              <button
                type="button"
                onClick={handleAutoFillDemoOtp}
                className="text-[11px] text-[#18382D] font-semibold underline hover:text-[#B88D4E] cursor-pointer"
              >
                Auto-Fill Code (1-Click Test)
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length < 4}
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
              <CheckCircle2 className="w-4 h-4 text-[#B88D4E]" />
            </button>

            <div className="flex items-center justify-between text-xs text-[#746B62] pt-1">
              <span>Didn't receive code?</span>
              {countdown > 0 ? (
                <span className="font-mono text-[#746B62]">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[#18382D] font-medium hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: COMPLETE PATRON PROFILE */}
        {step === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="text-center mb-2">
              <h4 className="font-serif text-xl font-medium text-[#18382D]">
                Welcome to ZOYARA
              </h4>
              <p className="text-xs text-[#746B62]">
                Please complete your profile to enjoy personalized access and express checkout.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                Full Name *
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white px-3 py-2.5">
                <User className="w-4 h-4 text-[#746B62] mr-2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pooja Sharma"
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                Email Address (Optional)
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white px-3 py-2.5">
                <Mail className="w-4 h-4 text-[#746B62] mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. pooja@example.com"
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#746B62] mb-1">
                City / Region
              </label>
              <div className="flex items-center rounded-xl border border-[#E6DCCF] bg-white px-3 py-2.5">
                <MapPin className="w-4 h-4 text-[#746B62] mr-2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#18382D] hover:bg-[#234E3F] text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Save &amp; Enter Boutique</span>
              <ArrowRight className="w-4 h-4 text-[#B88D4E]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
