import JsBarcode from "jsbarcode";

/**
 * Generates an SVG string representation of a Code-128 barcode
 * @param {string} text - Content to encode (SKU or barcode number)
 * @param {object} options - JsBarcode configuration
 */
export function generateBarcodeSvgString(text, options = {}) {
  try {
    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svgNode, text, {
      format: "CODE128",
      width: options.width || 1.4,
      height: options.height || 35,
      displayValue: options.displayValue !== false,
      font: "monospace",
      fontSize: options.fontSize || 10,
      textMargin: 2,
      margin: options.margin || 2,
      background: "#ffffff",
      lineColor: "#000000",
      ...options
    });
    return svgNode.outerHTML;
  } catch (err) {
    console.error("Barcode generation failed for:", text, err);
    return "";
  }
}

/**
 * Creates an automatic 12-digit barcode number
 */
export function generateRandomBarcode(category = "Jewellery") {
  const prefixMap = { Jewellery: "8901001", Bras: "8901002", Underwear: "8901003" };
  const prefix = prefixMap[category] || "8901009";
  const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
  return `${prefix}${randomSuffix}`;
}

/**
 * Formats price in Indian Rupee standard format
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}
