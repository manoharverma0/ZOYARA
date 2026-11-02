/**
 * MSG91 Headless OTP Service (Custom In-App UI - Zero External Popups)
 * Official Documentation: https://docs.msg91.com/otp-widget/llms.txt
 */
import { OTPWidget } from "@msg91comm/sendotp-sdk";

const DEFAULT_WIDGET_ID = "366b62716973333237303436";
const DEFAULT_TOKEN_AUTH = "586825Tds791Dq4c6ae8c3d4P1";

export function getMsg91Config() {
  const widgetId = (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MSG91_WIDGET_ID) || 
    DEFAULT_WIDGET_ID
  ).trim();

  const tokenAuth = (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MSG91_TOKEN_AUTH) || 
    DEFAULT_TOKEN_AUTH
  ).trim();

  return { widgetId, tokenAuth };
}

let isInitialized = false;

function ensureInitialized() {
  if (isInitialized) return;
  const { widgetId, tokenAuth } = getMsg91Config();
  OTPWidget.initializeWidget(widgetId, tokenAuth);
  isInitialized = true;
}

/**
 * Format Indian mobile number: 10 digits -> "91" + 10 digits
 */
export function formatMobileForMsg91(phone) {
  const clean = String(phone || "").replace(/\D/g, "");
  if (clean.length === 10) return "91" + clean;
  if (clean.length === 12 && clean.startsWith("91")) return clean;
  return clean;
}

/**
 * Send OTP via MSG91 API without any popup
 * @param {string} phone - 10 digit phone number
 * @returns {Promise<{success: boolean, reqId?: string, message?: string, error?: string}>}
 */
export async function sendCustomMsg91Otp(phone) {
  ensureInitialized();
  const formatted = formatMobileForMsg91(phone);

  if (!formatted || formatted.length < 10) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }

  try {
    const res = await OTPWidget.sendOTP({ identifier: formatted });
    console.log("[MSG91 SendOTP Response]", res);

    if (res?.type === "error" || res?.status === "error") {
      return { 
        success: false, 
        error: res?.message || res?.description || "Failed to send OTP via MSG91." 
      };
    }

    // reqId can be in res.reqId, res.message, or res.data
    const reqId = res?.reqId || res?.message || (typeof res === "string" ? res : "sent");

    return { 
      success: true, 
      reqId: typeof reqId === "object" ? JSON.stringify(reqId) : String(reqId),
      message: res?.message || "OTP sent successfully to your mobile number." 
    };
  } catch (err) {
    console.error("[MSG91 SendOTP Error]", err);
    return { 
      success: false, 
      error: err?.message || "Could not reach MSG91 SMS gateway. Please check your network." 
    };
  }
}

/**
 * Verify OTP entered by customer in custom UI
 * @param {Object} params
 * @param {string} params.reqId - Request ID from sendCustomMsg91Otp
 * @param {string} params.otp - 4 or 6 digit code entered by customer
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function verifyCustomMsg91Otp({ reqId, otp }) {
  ensureInitialized();

  const cleanOtp = String(otp || "").trim().replace(/\D/g, "");
  if (!cleanOtp || cleanOtp.length < 4) {
    return { success: false, error: "Please enter the verification code received on your phone." };
  }

  try {
    const payload = {
      otp: cleanOtp
    };
    if (reqId && reqId !== "sent") {
      payload.reqId = reqId;
    }

    const res = await OTPWidget.verifyOTP(payload);
    console.log("[MSG91 VerifyOTP Response]", res);

    // MSG91 returns type: "success" or status: "success" or access token on success
    const isSuccess = 
      res?.type === "success" || 
      res?.status === "success" || 
      (res?.message && String(res.message).toLowerCase().includes("success")) ||
      (res && !res.type && !res.error);

    if (!isSuccess || res?.type === "error") {
      return { 
        success: false, 
        error: res?.message || res?.description || "Invalid or expired verification code. Please try again." 
      };
    }

    return { 
      success: true, 
      token: res?.token || res?.message || "verified_by_msg91",
      data: res
    };
  } catch (err) {
    console.error("[MSG91 VerifyOTP Error]", err);
    return { 
      success: false, 
      error: err?.message || "Verification failed. Please check the code and try again." 
    };
  }
}

/**
 * Resend OTP via SMS / Voice retry
 * @param {string} reqId
 */
export async function retryCustomMsg91Otp(reqId) {
  ensureInitialized();
  try {
    const payload = {
      retryChannel: 11 // 11: SMS
    };
    if (reqId && reqId !== "sent") {
      payload.reqId = reqId;
    }
    const res = await OTPWidget.retryOTP(payload);
    console.log("[MSG91 RetryOTP Response]", res);
    return {
      success: res?.type !== "error",
      message: res?.message || "OTP resent successfully."
    };
  } catch (err) {
    console.error("[MSG91 RetryOTP Error]", err);
    return { success: false, error: err?.message || "Could not resend OTP at this moment." };
  }
}
