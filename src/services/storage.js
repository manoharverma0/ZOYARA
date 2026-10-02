import { INITIAL_PRODUCTS, STORE_SETTINGS } from "../data/initialProducts";

const STORAGE_KEYS = {
  PRODUCTS: "zayara_products_v2", // Upgraded version for curated categories (Bras, Underwear, Jewellery)
  SALES: "zayara_sales_v2",
  SETTINGS: "zayara_settings_v2",
  CART: "zayara_customer_cart_v2",
  PARTIES: "zayara_parties_v2", // Vyapar Customer / Khata Ledger
  EXPENSES: "zayara_expenses_v2", // Vyapar Day Book Expenses
  STOCK_LOGS: "zayara_stock_logs_v2" // Stock In / Stock Out tracking
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
  return updated;
}

export function updateProduct(updatedProd) {
  const current = getProducts();
  const updated = current.map(p => (p.id === updatedProd.id ? updatedProd : p));
  saveProducts(updated);
  return updated;
}

export function deleteProduct(productId) {
  const current = getProducts();
  const updated = current.filter(p => p.id !== productId);
  saveProducts(updated);
  return updated;
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
    return raw ? { ...STORE_SETTINGS, ...JSON.parse(raw) } : STORE_SETTINGS;
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
  return {
    products: INITIAL_PRODUCTS,
    sales: [],
    parties: INITIAL_PARTIES,
    expenses: INITIAL_EXPENSES,
    settings: STORE_SETTINGS
  };
}
