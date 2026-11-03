import crypto from "crypto";

const DEFAULT_SECRET = process.env.SESSION_SECRET || process.env.RAZORPAY_KEY_SECRET || "zoyara-secure-session-salt-2026";
const COOKIE_NAME = "zoyara_staff_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 hours

export function parseCookies(req) {
  const header = req.headers?.cookie || "";
  const list = {};
  header.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length === 2) {
      list[parts[0].trim()] = decodeURIComponent(parts[1].trim());
    }
  });
  return list;
}

export function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", DEFAULT_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", DEFAULT_SECRET)
    .update(data)
    .digest("base64url");

  // Constant-time comparison
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export function createSessionCookie(token) {
  const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_DURATION_SECONDS}; HttpOnly; SameSite=Lax${isProd ? "; Secure" : ""}`;
}

export function clearSessionCookie() {
  const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isProd ? "; Secure" : ""}`;
}

export function verifyAdminSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}
