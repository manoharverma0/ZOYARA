/**
 * MSG91 Headless Web OTP Service (Custom In-App UI - Zero Popups)
 * Uses official web widget with exposeMethods: true
 * Official Documentation: https://docs.msg91.com/otp-widget/llms.txt
 */

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

let loadPromise = null;
let isInitialized = false;

/**
 * Ensures MSG91 provider script is loaded in browser
 */
export function loadMsg91OtpScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof window.initSendOTP === "function") return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const urls = [
      "https://verify.msg91.com/otp-provider.js",
      "https://verify.phone91.com/otp-provider.js"
    ];

    let i = 0;
    function attempt() {
      const s = document.createElement("script");
      s.src = urls[i];
      s.async = true;
      s.onload = () => {
        if (typeof window.initSendOTP === "function") {
          resolve(true);
        } else {
          i++;
          if (i < urls.length) attempt();
          else resolve(false);
        }
      };
      s.onerror = () => {
        i++;
        if (i < urls.length) {
          attempt();
        } else {
          console.warn("[MSG91] Failed to load OTP provider scripts.");
          resolve(false);
        }
      };
      document.head.appendChild(s);
    }
    attempt();
  });

  return loadPromise;
}

/**
 * Initializes MSG91 in Headless Mode (exposeMethods: true)
 * This prevents ANY popup from rendering, exposing window.sendOtp & window.verifyOtp
 */
export async function initMsg91Headless(onSuccess, onFailure) {
  if (typeof window === "undefined") return false;

  await loadMsg91OtpScript();

  if (typeof window.initSendOTP !== "function") {
    console.warn("[MSG91] initSendOTP script not ready on window.");
    return false;
  }

  if (isInitialized && typeof window.sendOtp === "function" && typeof window.verifyOtp === "function") {
    return true;
  }

  const { widgetId, tokenAuth } = getMsg91Config();

  const configuration = {
    widgetId,
    tokenAuth,
    exposeMethods: true, // EXPOSE METHODS & PREVENT DEFAULT POPUP
    success: (data) => {
      console.log("[MSG91 Global Success]", data);
      if (onSuccess) onSuccess(data);
    },
    failure: (error) => {
      console.warn("[MSG91 Global Failure]", error);
      if (onFailure) onFailure(error);
    }
  };

  try {
    window.initSendOTP(configuration);
    isInitialized = true;
    return true;
  } catch (err) {
    console.error("[MSG91 initSendOTP Exception]", err);
    return false;
  }
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
 * Sends OTP via window.sendOtp without any popup
 */
export async function sendCustomMsg91Otp(phone) {
  const formatted = formatMobileForMsg91(phone);

  if (!formatted || formatted.length < 10) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }

  await initMsg91Headless();

  return new Promise((resolve) => {
    let attempts = 0;
    function attemptSend() {
      if (typeof window !== "undefined" && typeof window.sendOtp === "function") {
        window.sendOtp(
          formatted,
          (res) => {
            console.log("[MSG91 sendOtp success]", res);
            resolve({
              success: true,
              reqId: res?.reqId || res?.message || "sent",
              message: res?.message || "OTP sent successfully."
            });
          },
          (err) => {
            console.warn("[MSG91 sendOtp error]", err);
            const errMsg = err?.message || err?.description || (typeof err === "string" ? err : "Failed to send OTP.");
            resolve({
              success: false,
              error: errMsg
            });
          }
        );
      } else {
        attempts++;
        if (attempts < 25) {
          setTimeout(attemptSend, 120);
        } else {
          resolve({
            success: false,
            error: "MSG91 verification service could not be initialized. Please refresh and try again."
          });
        }
      }
    }
    attemptSend();
  });
}

/**
 * Verifies OTP via window.verifyOtp without any popup
 */
export async function verifyCustomMsg91Otp({ reqId, otp }) {
  const cleanOtp = String(otp || "").trim().replace(/\D/g, "");

  if (!cleanOtp || cleanOtp.length < 4) {
    return { success: false, error: "Please enter the verification code received on your phone." };
  }

  await initMsg91Headless();

  return new Promise((resolve) => {
    let attempts = 0;
    function attemptVerify() {
      if (typeof window !== "undefined" && typeof window.verifyOtp === "function") {
        window.verifyOtp(
          cleanOtp,
          (res) => {
            console.log("[MSG91 verifyOtp success]", res);
            resolve({
              success: true,
              token: res?.token || res?.message || (typeof res === "string" ? res : "verified"),
              data: res
            });
          },
          (err) => {
            console.warn("[MSG91 verifyOtp error]", err);
            const errMsg = err?.message || err?.description || (typeof err === "string" ? err : "Invalid or expired verification code.");
            resolve({
              success: false,
              error: errMsg
            });
          },
          reqId && reqId !== "sent" ? reqId : undefined
        );
      } else {
        attempts++;
        if (attempts < 25) {
          setTimeout(attemptVerify, 120);
        } else {
          resolve({
            success: false,
            error: "Verification service timed out. Please try again."
          });
        }
      }
    }
    attemptVerify();
  });
}

/**
 * Retries OTP via window.retryOtp
 */
export async function retryCustomMsg91Otp(reqId) {
  await initMsg91Headless();

  return new Promise((resolve) => {
    if (typeof window !== "undefined" && typeof window.retryOtp === "function") {
      window.retryOtp(
        11, // SMS channel
        (res) => resolve({ success: true, message: res?.message || "Code resent." }),
        (err) => resolve({ success: false, error: err?.message || "Could not resend code." }),
        reqId && reqId !== "sent" ? reqId : undefined
      );
    } else {
      resolve({ success: false, error: "Service unavailable." });
    }
  });
}
