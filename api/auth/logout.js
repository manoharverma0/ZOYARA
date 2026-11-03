import { clearSessionCookie } from "../_lib/auth.js";

export default function handler(req, res) {
  res.setHeader("Set-Cookie", clearSessionCookie());
  return res.status(200).json({ success: true, message: "Logged out successfully" });
}
