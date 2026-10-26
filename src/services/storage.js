import { INITIAL_PRODUCTS, STORE_SETTINGS } from "../data/initialProducts";
import { 
  syncProductToSupabase, 
  deleteProductFromSupabase, 
  syncOrderToSupabase, 
  fetchLiveProducts 
} from "./supabase";

const STORAGE_KEYS = {
  PRODUCTS: "zayara_products_v2", // Upgraded version for curated categories (Bras, Underwear, Jewellery)
  SALES: "zayara_sales_v2",
  SETTINGS: "zayara_settings_v2",
  CART: "zayara_customer_cart_v2",
  PARTIES: "zayara_parties_v2", // Vyapar Customer / Khata Ledger
  EXPENSES: "zayara_expenses_v2", // Vyapar Day Book Expenses
  STOCK_LOGS: "zayara_stock_logs_v2", // Stock In / Stock Out tracking
  CUSTOMER_USER: "zoyara_current_user",
  CUSTOMER_USERS: "zoyara_customer_users",
  ONLINE_ORDERS: "zoyara_online_orders_v2",
  WISHLIST: "zoyara_wishlist_v2"
};

// Initial Seed for Parties (Customers with Khata Ledger)
const INITIAL_PARTIES = [
  {
    id: "party-01",
    name: "Pooja Sharma",
    phone: "9876543210",
    email: "pooja.sharma@example.com",
    address: "B-42, South Extn, New Delhi",
    balance: 0, // Pending Udhaar (Credit)
    totalPurchases: 1845,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: "party-02",
    name: "Ananya Verma",
    phone: "9811223344",
    email: "ananya.v@example.com",
    address: "Flat 304, Green Glen Apts",
    balance: 450, // Has ₹450 pending credit
    totalPurchases: 2690,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: "party-03",
    name: "Simran Kaur",
    phone: "9988776655",
    email: "simran.k@example.com",
    address: "Model Town, House 12",
    balance: 0,
    totalPurchases: 890,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

// Initial Seed for Expenses (Day Book)
const INITIAL_EXPENSES = [
  {
    id: "exp-01",
    title: "Store Display Flowers & Lighting",
    category: "Store Decor",
    amount: 350,
    paymentMode: "cash",
    date: new Date(Date.now() - 86400000).toISOString(),
    note: "Fresh boutique jasmine & lily bouquet"
  },
  {
    id: "exp-02",
    title: "Eco Boutique Carry Bags & Ribbons",
    category: "Packaging",
    amount: 850,
    paymentMode: "upi",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    note: "Pack of 200 matte luxury carry bags"
  }
];

// --- PRODUCTS API ---
export function getProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    // Ensure all items belong to allowed categories (Jewellery, Bras, Underwear)
    const valid = parsed.filter(p => ["Jewellery", "Bras", "Underwear"].includes(p.category));
    if (valid.length === 0) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return valid;
  } catch (e) {
    console.error("Error reading products:", e);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error("Error saving products:", e);
  }
}

export function addProduct(newProd) {
  const current = getProducts();
  const updated = [newProd, ...current];
  saveProducts(updated);
  // Log stock addition
  recordStockAdjustment(newProd.id, newProd.title, "IN", Number(newProd.stock || 0), "Initial Stock Addition");
  // Sync live to Supabase cloud
  syncProductToSupabase(newProd).catch(e => console.warn("[Supabase Sync Error]:", e));
  return updated;
}

export function updateProduct(updatedProd) {
  const current = getProducts();
  const updated = current.map(p => (p.id === updatedProd.id ? updatedProd : p));
  saveProducts(updated);
  // Sync live to Supabase cloud
  syncProductToSupabase(updatedProd).catch(e => console.warn("[Supabase Sync Error]:", e));
  return updated;
}

export function deleteProduct(productId) {
  const current = getProducts();
  const updated = current.filter(p => p.id !== productId);
  saveProducts(updated);
  // Sync live to Supabase cloud
  deleteProductFromSupabase(productId).catch(e => console.warn("[Supabase Sync Error]:", e));
  return updated;
}

// Sync products from Supabase to local storage
export async function syncWithSupabase() {
  try {
    const liveProducts = await fetchLiveProducts();
    if (liveProducts && liveProducts.length > 0) {
      saveProducts(liveProducts);
      return liveProducts;
    }
  } catch (err) {
    console.warn("[ZOYARA] Could not sync with Supabase:", err);
  }
  return null;
}

// --- SALES LEDGER & BILLING API ---
export function getSales() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading sales:", e);
    return [];
  }
}

export function recordSale(saleRecord) {
  const sales = getSales();
  const updatedSales = [saleRecord, ...sales];
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updatedSales));

  // 1. Deduct inventory stock automatically & record stock log
  const products = getProducts();
  const updatedProducts = products.map(product => {
    const soldItem = saleRecord.items.find(item => item.id === product.id);
    if (soldItem) {
      const newStock = Math.max(0, (product.stock || 0) - soldItem.quantity);
      recordStockAdjustment(
        product.id,
        product.title,
        "OUT",
        soldItem.quantity,
        `POS Invoice #${saleRecord.billNumber}`
      );
      return { ...product, stock: newStock };
    }
    return product;
  });
  saveProducts(updatedProducts);

  // 2. Handle Khata / Udhaar / Customer Party Ledger
  if (saleRecord.customerPhone) {
    const cleanPhone = saleRecord.customerPhone.replace(/\D/g, "");
    const parties = getParties();
    let party = parties.find(p => p.phone.replace(/\D/g, "") === cleanPhone);

    const isCredit = saleRecord.paymentMethod === "credit"; // Udhaar bill
    const creditAddition = isCredit ? saleRecord.finalTotal : 0;

    if (party) {
      party.totalPurchases = (party.totalPurchases || 0) + saleRecord.finalTotal;
      party.balance = (party.balance || 0) + creditAddition;
      if (saleRecord.customerName && (!party.name || party.name === "Guest")) {
        party.name = saleRecord.customerName;
      }
      saveParties(parties);
    } else if (saleRecord.customerName) {
      const newParty = {
        id: `party-${Date.now()}`,
        name: saleRecord.customerName || "Customer",
        phone: cleanPhone,
        email: "",
        address: "",
        balance: creditAddition,
        totalPurchases: saleRecord.finalTotal,
        createdAt: new Date().toISOString()
      };
      saveParties([newParty, ...parties]);
    }
  }

  return { sales: updatedSales, products: updatedProducts };
}

// --- VYAPAR PARTIES / CUSTOMER KHATA (UDHAAR) API ---
export function getParties() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
      return INITIAL_PARTIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PARTIES;
  }
}

export function saveParties(parties) {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
  } catch (e) {
    console.error("Error saving parties:", e);
  }
}

export function addOrUpdateParty(partyData) {
  const parties = getParties();
  let updated;
  if (partyData.id) {
    updated = parties.map(p => (p.id === partyData.id ? { ...p, ...partyData } : p));
  } else {
    const newP = {
      id: `party-${Date.now()}`,
      balance: 0,
      totalPurchases: 0,
      createdAt: new Date().toISOString(),
      ...partyData
    };
    updated = [newP, ...parties];
  }
  saveParties(updated);
  return updated;
}

export function recordPartyPayment(partyId, amountReceived, paymentMode = "cash", note = "Payment settlement") {
  const parties = getParties();
  const party = parties.find(p => p.id === partyId);
  if (!party) return { success: false, error: "Party not found" };

  const prevBalance = party.balance || 0;
  const newBalance = Math.max(0, prevBalance - Number(amountReceived));
  party.balance = newBalance;

  // Add settlement note to party history
  if (!party.paymentHistory) party.paymentHistory = [];
  party.paymentHistory.unshift({
    id: `pay-${Date.now()}`,
    date: new Date().toISOString(),
    amount: Number(amountReceived),
    paymentMode,
    note,
    remainingBalance: newBalance
  });

  saveParties(parties);
  return { success: true, party, parties };
}

export function deleteParty(partyId) {
  const parties = getParties();
  const updated = parties.filter(p => p.id !== partyId);
  saveParties(updated);
  return updated;
}

// --- VYAPAR DAY BOOK & EXPENSES API ---
export function getExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error("Error saving expenses:", e);
  }
}

export function addExpense(expense) {
  const expenses = getExpenses();
  const newEntry = {
    id: `exp-${Date.now()}`,
    date: new Date().toISOString(),
    ...expense
  };
  const updated = [newEntry, ...expenses];
  saveExpenses(updated);
  return updated;
}

export function deleteExpense(expenseId) {
  const expenses = getExpenses();
  const updated = expenses.filter(e => e.id !== expenseId);
  saveExpenses(updated);
  return updated;
}

// --- STOCK MOVEMENT & LOGS API ---
export function getStockLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordStockAdjustment(productId, productTitle, type, quantity, reason = "") {
  try {
    const logs = getStockLogs();
    const entry = {
      id: `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      productTitle,
      type, // 'IN' or 'OUT'
      quantity: Number(quantity),
      reason,
      date: new Date().toISOString()
    };
    const updated = [entry, ...logs].slice(0, 300); // keep last 300 logs
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error recording stock log:", e);
    return [];
  }
}

export function manualStockAdjust(productId, delta, reason) {
  const products = getProducts();
  const prod = products.find(p => p.id === productId);
  if (!prod) return products;

  const currentStock = prod.stock || 0;
  const newStock = Math.max(0, currentStock + delta);
  const updatedProd = { ...prod, stock: newStock };

  const updatedProducts = products.map(p => (p.id === productId ? updatedProd : p));
  saveProducts(updatedProducts);

  recordStockAdjustment(
    productId,
    prod.title,
    delta >= 0 ? "IN" : "OUT",
    Math.abs(delta),
    reason || (delta >= 0 ? "Manual Stock In" : "Stock Audit Deduction")
  );

  return updatedProducts;
}

// --- STORE SETTINGS API ---
export function getStoreSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = raw ? { ...STORE_SETTINGS, ...JSON.parse(raw) } : STORE_SETTINGS;
    if (!parsed.staffPin || parsed.staffPin === "1234") {
      parsed.staffPin = "85200";
    }
    return parsed;
  } catch {
    return STORE_SETTINGS;
  }
}

export function saveStoreSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// --- VYAPAR BUSINESS METRICS & DASHBOARD STATS ---
export function getVyaparMetrics() {
  const products = getProducts();
  const sales = getSales();
  const expenses = getExpenses();
  const parties = getParties();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysSales = sales.filter(s => s.date && s.date.startsWith(todayStr));
  const todaysExpenses = expenses.filter(e => e.date && e.date.startsWith(todayStr));

  // Today stats
  const todaysRevenue = todaysSales.reduce((sum, s) => sum + s.finalTotal, 0);
  const todaysCashIn = todaysSales.filter(s => s.paymentMethod === "cash").reduce((sum, s) => sum + s.finalTotal, 0);
  const todaysExpenseTotal = todaysExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const todaysCashOut = todaysExpenses.filter(e => e.paymentMode === "cash").reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // All-time / Monthly Revenue & Profit
  const totalRevenue = sales.reduce((sum, s) => sum + s.finalTotal, 0);
  const totalCOGS = sales.reduce((sum, s) => {
    const cost = s.items.reduce((c, item) => {
      const p = products.find(prod => prod.id === item.id);
      return c + (p ? p.costPrice * item.quantity : 0);
    }, 0);
    return sum + cost;
  }, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  // Receivables (Khata / Udhaar)
  const totalReceivables = parties.reduce((sum, p) => sum + (p.balance || 0), 0);

  // Inventory Valuation
  const totalInventoryUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalInventoryCostValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.costPrice || 0)), 0);
  const totalInventoryRetailValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);

  return {
    todaysRevenue,
    todaysSalesCount: todaysSales.length,
    todaysExpenseTotal,
    todaysCashIn,
    todaysCashOut,
    netCashToday: todaysCashIn - todaysCashOut,
    totalRevenue,
    totalCOGS,
    grossProfit,
    totalExpenses,
    netProfit,
    totalReceivables,
    totalInventoryUnits,
    totalInventoryCostValue,
    totalInventoryRetailValue,
    lowStockCount: products.filter(p => (p.stock || 0) <= 5).length
  };
}

// --- FULL DATABASE BACKUP & RESTORE ---
export function exportDatabaseBackup() {
  const data = {
    version: "2.0",
    appName: "ZOYARA Vyapar Business Suite",
    exportDate: new Date().toISOString(),
    products: getProducts(),
    sales: getSales(),
    parties: getParties(),
    expenses: getExpenses(),
    stockLogs: getStockLogs(),
    settings: getStoreSettings()
  };
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `ZOYARA_Vyapar_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDatabaseBackup(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.products && Array.isArray(parsed.products)) saveProducts(parsed.products);
    if (parsed.sales && Array.isArray(parsed.sales)) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(parsed.sales));
    if (parsed.parties && Array.isArray(parsed.parties)) saveParties(parsed.parties);
    if (parsed.expenses && Array.isArray(parsed.expenses)) saveExpenses(parsed.expenses);
    if (parsed.stockLogs && Array.isArray(parsed.stockLogs)) localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(parsed.stockLogs));
    if (parsed.settings) saveStoreSettings(parsed.settings);
    return { success: true };
  } catch (err) {
    console.error("Backup import error:", err);
    return { success: false, error: err.message };
  }
}

export function resetAllDataToDefault() {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
  localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(STORE_SETTINGS));
  localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
  localStorage.removeItem(STORAGE_KEYS.ONLINE_ORDERS);
  localStorage.removeItem(STORAGE_KEYS.WISHLIST);
  return {
    products: INITIAL_PRODUCTS,
    sales: [],
    parties: INITIAL_PARTIES,
    expenses: INITIAL_EXPENSES,
    settings: STORE_SETTINGS
  };
}

// ==========================================
// CUSTOMER AUTHENTICATION (MOBILE + OTP)
// ==========================================

const OTP_CACHE = {};

export function sendCustomerOtp(phone) {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }
  // Generate real unique 4-digit OTP
  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
  OTP_CACHE[cleanPhone] = {
    otp: generatedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
  };

  const whatsappMessage = encodeURIComponent(
    `Your ZOYARA Security Verification Code is: ${generatedOtp}. Valid for 5 minutes. Do not share this code with anyone.`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${whatsappMessage}`;

  return {
    success: true,
    phone: cleanPhone,
    otp: generatedOtp,
    whatsappUrl,
    message: `Security code generated for +91 ${cleanPhone}. Valid for 5 minutes.`
  };
}

export function verifyCustomerOtp(phone, otpInput, profileData = {}) {
  const cleanPhone = phone.replace(/\D/g, "");
  const record = OTP_CACHE[cleanPhone];
  
  // Real verification check without demo bypass
  const isValidOtp = Boolean(
    record && 
    record.otp === otpInput.trim() && 
    Date.now() <= record.expiresAt
  );

  if (!isValidOtp) {
    return { 
      success: false, 
      error: "Invalid or expired verification code. Please re-check the OTP or request a new code." 
    };
  }

  // Clear used OTP to prevent replay
  delete OTP_CACHE[cleanPhone];

  // Find or create customer
  const users = getCustomerUsers();
  let user = users.find(u => u.phone === cleanPhone);

  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      phone: cleanPhone,
      name: profileData.name || "ZOYARA Patron",
      email: profileData.email || "",
      address: profileData.address || "",
      city: profileData.city || "",
      state: profileData.state || "",
      pincode: profileData.pincode || "",
      savedAddresses: profileData.address ? [{
        id: `addr-${Date.now()}`,
        name: profileData.name || "Home",
        phone: cleanPhone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
        isDefault: true
      }] : [],
      createdAt: new Date().toISOString()
    };
    saveCustomerUsers([user, ...users]);
  } else if (profileData.name || profileData.email || profileData.address) {
    user = { ...user, ...profileData };
    saveCustomerUsers(users.map(u => u.phone === cleanPhone ? user : u));
  }

  // Save current active session
  setCurrentCustomer(user);
  delete OTP_CACHE[cleanPhone];
  return { success: true, user };
}

export function loginCustomerWithPhone(phone, name = "", email = "", city = "") {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length !== 10) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }
  const users = getCustomerUsers();
  let user = users.find(u => u.phone === cleanPhone);
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      phone: cleanPhone,
      name: name.trim() || "ZOYARA Patron",
      email: email.trim() || "",
      city: city.trim() || "",
      createdAt: new Date().toISOString()
    };
    saveCustomerUsers([user, ...users]);
  } else {
    if (name.trim()) user.name = name.trim();
    if (email.trim()) user.email = email.trim();
    if (city.trim()) user.city = city.trim();
    saveCustomerUsers(users.map(u => u.phone === cleanPhone ? user : u));
  }
  setCurrentCustomer(user);
  return { success: true, user };
}

export function updateCustomerProfile(phone, profileData) {
  const cleanPhone = phone.replace(/\D/g, "");
  const users = getCustomerUsers();
  let user = users.find(u => u.phone === cleanPhone);
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      phone: cleanPhone,
      name: profileData.name || "ZOYARA Patron",
      email: profileData.email || "",
      city: profileData.city || "",
      createdAt: new Date().toISOString()
    };
    saveCustomerUsers([user, ...users]);
  } else {
    user = { ...user, ...profileData };
    saveCustomerUsers(users.map(u => u.phone === cleanPhone ? user : u));
  }
  setCurrentCustomer(user);
  return { success: true, user };
}

export function getCurrentCustomer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentCustomer(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
    }
  } catch (e) {
    console.error("Error setting customer:", e);
  }
}

export function logoutCustomer() {
  localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
}

export function getCustomerUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER_USERS);
    if (!raw) {
      const initialUsers = [
        {
          id: "usr-01",
          phone: "9876543210",
          name: "Pooja Sharma",
          email: "pooja.sharma@example.com",
          address: "B-42, South Extn, Part 2",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110049",
          savedAddresses: [
            {
              id: "addr-01",
              name: "Pooja Sharma",
              phone: "9876543210",
              address: "B-42, South Extn, Part 2",
              city: "New Delhi",
              state: "Delhi",
              pincode: "110049",
              isDefault: true
            }
          ],
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_USERS, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomerUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_USERS, JSON.stringify(users));
  } catch (e) {
    console.error("Error saving users:", e);
  }
}

// ==========================================
// WISHLIST API
// ==========================================

export function getWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleWishlistItem(productId) {
  const current = getWishlist();
  const exists = current.includes(productId);
  const updated = exists ? current.filter(id => id !== productId) : [...current, productId];
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving wishlist:", e);
  }
  return updated;
}

// ==========================================
// ONLINE ORDERS & INVOICE GENERATION API
// ==========================================

const INITIAL_ONLINE_ORDERS = [
  {
    orderId: "ZY-ORD-90214",
    invoiceNumber: "ZY-INV-2026-0842",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "Delivered",
    paymentMethod: "UPI (Google Pay)",
    paymentStatus: "Paid",
    transactionId: "pay_zy_gpay_94218734",
    customerName: "Pooja Sharma",
    customerPhone: "9876543210",
    customerEmail: "pooja.sharma@example.com",
    shippingAddress: {
      fullName: "Pooja Sharma",
      phone: "9876543210",
      street: "B-42, South Extn, Part 2",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110049",
      country: "India"
    },
    items: [
      {
        id: "zy-jwl-01",
        title: "Aura Baroque Pearl Drop Hoops",
        sku: "ZY-JWL-01",
        hsn: "7117",
        price: 249,
        quantity: 1,
        selectedSize: "Free Size",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "zy-bra-01",
        title: "Cloud-Comfort Seamless Wirefree Bralette",
        sku: "ZY-BRA-01",
        hsn: "6212",
        price: 399,
        quantity: 1,
        selectedSize: "32B",
        image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80"
      }
    ],
    subtotal: 648,
    discountAmount: 65,
    couponCode: "WELCOME10",
    shippingFee: 0,
    taxAmount: 19.44, // 3% included / applied
    finalTotal: 583,
    notes: "Complimentary luxury gift box packaging applied."
  }
];

export function getOnlineOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ONLINE_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ONLINE_ORDERS, JSON.stringify(INITIAL_ONLINE_ORDERS));
      return INITIAL_ONLINE_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ONLINE_ORDERS;
  }
}

export function saveOnlineOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEYS.ONLINE_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error("Error saving online orders:", e);
  }
}

export function createOnlineOrder(orderData) {
  const orders = getOnlineOrders();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ZY-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const invoiceNumber = `ZY-INV-${year}-${randomSuffix}`;

  const newOrder = {
    orderId,
    invoiceNumber,
    date: new Date().toISOString(),
    status: orderData.paymentMethod === "cod" ? "Order Confirmed" : "Processing",
    paymentStatus: orderData.paymentMethod === "cod" ? "Pending (Cash on Delivery)" : "Paid",
    transactionId: orderData.transactionId || `pay_zy_${Date.now()}`,
    ...orderData
  };

  const updatedOrders = [newOrder, ...orders];
  saveOnlineOrders(updatedOrders);
  // Live Cloud Supabase Order Sync
  syncOrderToSupabase(newOrder).catch(e => console.warn("[Supabase Sync Error]:", e));

  // 1. Deduct Inventory Stock
  const products = getProducts();
  const updatedProducts = products.map(prod => {
    const orderedItem = orderData.items.find(i => i.id === prod.id);
    if (orderedItem) {
      const newStock = Math.max(0, (prod.stock || 0) - orderedItem.quantity);
      recordStockAdjustment(
        prod.id,
        prod.title,
        "OUT",
        orderedItem.quantity,
        `Online Store Order #${orderId}`
      );
      return { ...prod, stock: newStock };
    }
    return prod;
  });
  saveProducts(updatedProducts);

  // 2. Also register into store Sales ledger so POS / Reports screen can track total store revenue
  const saleRecord = {
    billNumber: newOrder.invoiceNumber,
    date: newOrder.date,
    customerName: newOrder.customerName || "Online Customer",
    customerPhone: newOrder.customerPhone || "",
    paymentMethod: orderData.paymentMethod === "cod" ? "cod" : "online",
    subtotal: newOrder.subtotal,
    discountAmount: newOrder.discountAmount || 0,
    taxAmount: newOrder.taxAmount || 0,
    finalTotal: newOrder.finalTotal,
    items: newOrder.items.map(it => ({
      id: it.id,
      title: it.title,
      sku: it.sku,
      price: it.price,
      quantity: it.quantity,
      selectedSize: it.selectedSize
    })),
    source: "Storefront Online"
  };
  const sales = getSales();
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([saleRecord, ...sales]));

  return newOrder;
}

// ==========================================
// COUPONS & DISCOUNTS API
// ==========================================

export const PROMO_COUPONS = [
  { code: "WELCOME10", discountPercent: 10, minOrder: 0, description: "10% off on all items" },
  { code: "FIRSTORDER", discountPercent: 15, minOrder: 299, description: "15% off on first order above ₹299" },
  { code: "FESTIVE50", flatDiscount: 50, minOrder: 349, description: "Flat ₹50 off on orders above ₹349" },
  { code: "FREESHIP", freeShipping: true, minOrder: 0, description: "Free Express Shipping on any order" }
];

export function validateCoupon(code, subtotal) {
  if (!code) return { valid: false, error: "Please enter a coupon code." };
  const cleanCode = code.trim().toUpperCase();
  const coupon = PROMO_COUPONS.find(c => c.code === cleanCode);

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code. Try WELCOME10 or FESTIVE50." };
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { valid: false, error: `Minimum cart value of ₹${coupon.minOrder} required for coupon ${cleanCode}.` };
  }

  let discount = 0;
  if (coupon.discountPercent) {
    discount = Math.round((subtotal * coupon.discountPercent) / 100);
  } else if (coupon.flatDiscount) {
    discount = Math.min(coupon.flatDiscount, subtotal);
  }

  return {
    valid: true,
    code: cleanCode,
    discount,
    freeShipping: !!coupon.freeShipping,
    description: coupon.description
  };
}
