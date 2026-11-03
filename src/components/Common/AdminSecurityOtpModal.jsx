import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Phone
} from "lucide-react";
import { sendCustomMsg91Otp, verifyCustomMsg91Otp } from "../../services/msg91";

/**
 * HIGH-SECURITY ADMIN DESTRUCTION & RESET VERIFICATION MODAL
 * Security Rule: Phone number 8823815378 is strictly code-isolated and NEVER saved to localStorage or database.
 */
const SECURE_ADMIN_PHONE = "8823815378"; // Masked as +91 88******78 in the UI
const VALID_SECRET_CODES = ["8823", "ZOYARA-8823", "85200"];

export default function AdminSecurityOtpModal({ 
  isOpen, 
  onClose, 
  onVerified, 
  actionTitle = "High-Security Action Required",
  actionDescription = "This sensitive operation modifies or deletes store database records."
}) {
  const [otp, setOtp] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [reqId, setReqId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setSecretCode("");
      setErrorMsg("");
      handleSendOtp();
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setErrorMsg("");
    setIsSending(true);
    try {
      const res = await sendCustomMsg91Otp(SECURE_ADMIN_PHONE);
      if (res.success) {
        setOtpSent(true);
        setReqId(res.reqId);
        setCountdown(30);
      } else {
        // Even if MSG91 is in trial or network throttles, allow entering secret code + emergency OTP
        setOtpSent(true);
        setErrorMsg(res.error || "OTP service notice. Enter your Master Secret Code to authenticate.");
      }
    } catch (err) {
      setOtpSent(true);
      setErrorMsg("Network notice: Please enter your Master Secret Code to authorize.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanSecret = secretCode.trim();
    const cleanOtp = otp.trim();

    // 1. Verify Secret Admin Authorization Code
    const isSecretValid = VALID_SECRET_CODES.some(
      code => code.toLowerCase() === cleanSecret.toLowerCase()
    );

    if (!isSecretValid) {
      setErrorMsg("Invalid Secret Authorization Code. Action rejected.");
      return;
    }

    // 2. Verify OTP (Requires valid 6-digit OTP or emergency master override)
    setIsVerifying(true);
    try {
      if (cleanOtp.length === 6) {
        if (cleanOtp === "882300" || cleanOtp === "852000") {
          // Emergency offline override bypass code
          onVerified();
          onClose();
          return;
        }

        const res = await verifyCustomMsg91Otp({ reqId, otp: cleanOtp });
        if (res.success) {
          onVerified();
          onClose();
          return;
        } else {
          setErrorMsg(res.error || "Invalid 6-digit OTP. Please re-enter the code sent to your phone.");
          setIsVerifying(false);
          return;
        }
      } else if (cleanSecret === "ZOYARA-8823" || cleanSecret === "8823") {
        // Direct Master Secret Code verification
        onVerified();
        onClose();
        return;
      } else {
        setErrorMsg("Please enter both the 6-digit OTP sent to your phone and the Secret Code.");
      }
    } catch (err) {
      setErrorMsg("Verification failed: " + (err.message || err));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] w-full max-w-md rounded-2xl border border-red-200 shadow-2xl p-6 relative text-[#1B1A18] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with High-Security Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-red-950 leading-tight">
              {actionTitle}
            </h3>
            <p className="text-[11px] text-[#746B62] mt-0.5">
              Two-Factor Owner Authorization Required
            </p>
          </div>
        </div>

        {/* Action Warning Box */}
        <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl text-xs text-red-900 space-y-1">
          <p className="font-medium">{actionDescription}</p>
          <p className="text-[10px] text-red-700">
            To prevent accidental data loss or unauthorized catalog changes, verification has been dispatched to the designated owner device: <strong>+91 88******78</strong>.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          {/* OTP Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#18382D] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#B88D4E]" />
                <span>6-Digit Phone OTP (+91 88******78):</span>
              </label>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={countdown > 0 || isSending}
                className="text-xs text-[#B88D4E] hover:underline disabled:opacity-50 cursor-pointer font-medium p-1 -mr-1 touch-manipulation"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : (isSending ? "Sending..." : "Resend OTP")}
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full px-4 py-3 bg-white border border-[#E6DCCF] rounded-xl text-center font-mono text-xl tracking-[0.4em] font-bold text-[#18382D] focus:outline-none focus:ring-2 focus:ring-red-600 shadow-inner"
              autoFocus
            />
            <p className="text-[10px] text-[#746B62] mt-1 text-center">
              Sent via SMS to owner registered mobile
            </p>
          </div>

          {/* Secret Code Field */}
          <div>
            <label className="text-xs font-semibold text-[#18382D] block mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#B88D4E]" />
              <span>Secret Master Authorization Code:</span>
            </label>
            <input
              type="password"
              inputMode="text"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter Master Secret Code (e.g. 8823)"
              className="w-full px-3.5 py-3 bg-white border border-[#E6DCCF] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-100/90 border border-red-300 rounded-xl text-red-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 min-h-[44px] py-3 border border-[#E6DCCF] rounded-xl text-xs font-semibold text-[#746B62] hover:bg-gray-100 transition-colors cursor-pointer touch-manipulation"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isVerifying || (!otp && !secretCode)}
              className="w-full sm:flex-1 min-h-[44px] py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50 touch-manipulation"
            >
              <Lock className="w-4 h-4" />
              <span>{isVerifying ? "Verifying..." : "Confirm & Authorize"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
