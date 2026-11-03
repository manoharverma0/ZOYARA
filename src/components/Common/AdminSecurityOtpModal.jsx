import React, { useState } from "react";
import { 
  AlertTriangle, 
  Trash2, 
  X 
} from "lucide-react";

/**
 * ZOYARA — Secure Admin Action Confirmation Modal
 * Replaces hardcoded client phone/OTP bypasses with explicit, intentional confirmation.
 */
export default function AdminSecurityOtpModal({ 
  isOpen, 
  onClose, 
  onVerified, 
  actionTitle = "Confirm Action",
  actionDescription = "This action will permanently remove or modify selected records."
}) {
  const [confirmText, setConfirmText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setConfirmText("");
    setErrorMsg("");
    onClose();
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (confirmText.trim().toUpperCase() !== "DELETE" && confirmText.trim().toUpperCase() !== "CONFIRM") {
      setErrorMsg("Please type DELETE or CONFIRM to authorize this action.");
      return;
    }

    onVerified();
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/80 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDFA] border border-[#E6DCCF] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[#1B1A18]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#746B62] hover:bg-[#F7F2EA] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#18382D] leading-tight">
              {actionTitle}
            </h3>
            <p className="text-[11px] text-[#746B62]">
              Store Administrator Authorization
            </p>
          </div>
        </div>

        <p className="text-xs text-[#746B62] leading-relaxed mb-5 bg-[#F7F2EA] p-3 rounded-xl border border-[#E6DCCF]/60">
          {actionDescription}
        </p>

        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#18382D] uppercase tracking-wider mb-1">
              Type <span className="font-mono text-red-700 font-bold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              autoFocus
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setErrorMsg("");
              }}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E6DCCF] rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
            {errorMsg && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F7F2EA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F7F2EA] hover:bg-[#E7ECE4] text-[#746B62] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Action</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
