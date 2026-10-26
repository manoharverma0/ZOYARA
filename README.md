# ZOYARA — Luxury Fashion & Comfort Platform

**ZOYARA** is a high-performance, mobile-responsive e-commerce and retail management platform specializing in 18K Anti-Tarnish Waterproof Jewellery, Zero-Wire Bras, and Seamless Intimates (accessible luxury ₹150–₹400).

Built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Lucide Icons**, and client-side persistence with dynamic SEO and Razorpay standard checkout integration.

---

## 🚀 One-Click Production Deployment

### 1. Deploy to Vercel (Recommended)
1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com/new).
3. The configuration is pre-configured via [`vercel.json`](file:///g:/gemini%20projects/ZAYARA/vercel.json) with SPA fallback rewrites, immutable asset caching, and security headers.
4. Set Environment Variables in Vercel Project Settings:
   - `VITE_RAZORPAY_KEY_ID`: Your live Razorpay Key (`rzp_live_...`)
   - `VITE_SITE_URL`: Your production custom domain (e.g., `https://zoyara.in`)
5. Click **Deploy**.

### 2. Deploy to Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Create a `_redirects` file or use `/* /index.html 200`.

---

## 🛠️ Environment Configuration

Copy [`.env.example`](file:///g:/gemini%20projects/ZAYARA/.env.example) to `.env`:

```env
# Razorpay Payment Gateway ID (rzp_live_... or rzp_test_...)
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag

# Canonical Site URL
VITE_SITE_URL=https://zoyara.vercel.app

# Live Cloud Database (Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Analytics 4 (Optional)
VITE_GA_ID=G-ZOYARA2026
```

---

## 🗄️ Supabase Live Cloud Database Setup

To make all products, stock changes, and customer orders live across all devices anywhere:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor -> New Query**.
3. Copy and run the pre-written script [`supabase_schema.sql`](file:///g:/gemini%20projects/ZAYARA/supabase_schema.sql).
4. Copy your **Project URL** and **Anon Public Key** into `.env` (or directly enter them in the Admin Settings Screen).
5. All catalog additions, stock adjustments, and customer orders will now sync in real time globally!

---

## 🔒 Master Admin Panel & Security

The platform includes a dedicated, high-security admin management terminal:
- **Master Admin Password**: `85200` (configurable in Admin Settings)
- **Direct Access URL**: `https://<your-domain>/?portal=staff` or click **"Store POS & Staff Terminal"** in the footer.
- **Features**:
  - Live Product Addition, Editing, and Deletion across all devices
  - Camera & Device Photo Upload with automatic canvas compression
  - Barcode Scanning & Thermal Receipt Printing (58mm/80mm)
  - Free Customer Verification via WhatsApp & Supabase Email OTP
  - Customer Khata (Udhaar Ledger & Payment Tracking)
  - Day Book & Store Expense Tracker
  - Dynamic SEO & Razorpay Key Management

---

## 🧪 Development & Quality Checks

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run Oxlint validation (0 warnings, 0 errors)
npm run lint

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```
