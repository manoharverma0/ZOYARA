import React, { useState } from "react";
import { Lock, X, ShieldAlert, ArrowRight } from "lucide-react";
import { getStoreSettings } from "../../services/storage";

export default function StaffAuthModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    // Read PIN from store settings (configurable in Store Settings panel)
    const storeSettings = getStoreSettings();
    const validPin = storeSettings.staffPin || "1234";
    if (pin === validPin) {
      setError(false);
      localStorage.setItem("zayara_staff_authenticated", "true");
      onSuccess();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-[#18181B] text-white w-full max-w-sm rounded-2xl border border-[#2E2E33] shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#27272A] text-[#A1A1AA] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-[#D4AF37] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-normal tracking-wide">
            Staff & Store Terminal
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Private back-office for shop billing, barcode tags, and inventory.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#A1A1AA] font-mono mb-1.5 text-center">
              Enter Staff Access PIN
            </label>
            <input
              type="password"
              autoFocus
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[0.5em] py-2.5 bg-[#27272A] border border-[#3F3F46] rounded-xl text-white focus:outline-none focus:border-[#D4AF37] font-mono"
            />
            <p className="text-[10px] text-center text-[#71717A] mt-1.5 font-mono">
              Contact store owner for access credentials
            </p>
          </div>

          {error && (
            <div className="p-2 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-1.5 justify-center">
              <ShieldAlert className="w-4 h-4" />
              <span>Incorrect PIN. Please try again.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#FAF8F5] hover:bg-[#EAE4D9] text-[#18181B] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Unlock Counter Terminal</span>
            <ArrowRight className="w-4 h-4 text-[#8C6D3F]" />
          </button>
        </form>
      </div>
    </div>
  );
}
