import { verifyAdminSession } from "../_lib/auth.js";

export default function handler(req, res) {
  const session = verifyAdminSession(req);

  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({
    authenticated: true,
    role: session.role || "staff",
    expiresAt: new Date(session.exp).toISOString()
  });
}
