import React, { useState, useEffect, useCallback } from "react";
import { 
  Barcode as BarcodeIcon, 
  Printer, 
  Scissors
} from "lucide-react";
import JsBarcode from "jsbarcode";
import { formatCurrency } from "../../utils/barcode";

export default function BarcodeStudio({ products }) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [tagFormat, setTagFormat] = useState("jewellery"); // 'jewellery', 'apparel', 'a4sheet'
  const [printQuantity, setPrintQuantity] = useState(12);

  // Custom one-off product state
  const [isCustomTag, setIsCustomTag] = useState(false);
  const [customTagData, setCustomTagData] = useState({
    title: "Celestial Dainty Ring",
    sku: "ZY-JWL-99",
    barcode: "890100199999",
    price: 249,
    category: "Jewellery",
    size: "Free Size"
  });

  const activeProduct = isCustomTag
    ? customTagData
    : products.find(p => p.id === selectedProductId) || products[0];

  // Helper to render barcode into SVG element
  const renderBarcodeSvg = useCallback((elementId, value) => {
    if (!value) return;
    try {
      const el = document.getElementById(elementId);
      if (el) {
        JsBarcode(el, value, {
          format: "CODE128",
          width: tagFormat === "jewellery" ? 1.2 : 1.4,
          height: tagFormat === "jewellery" ? 22 : 30,
          displayValue: true,
          font: "monospace",
          fontSize: tagFormat === "jewellery" ? 8 : 10,
          margin: 0,
          textMargin: 1
        });
      }
    } catch (e) {
      console.warn("Barcode rendering error", e);
    }
  }, [tagFormat]);

  // Trigger render on change
  useEffect(() => {
    const timer = setTimeout(() => {
      renderBarcodeSvg("preview-barcode-svg", activeProduct?.barcode || activeProduct?.sku);
      // Also render batch items
      for (let i = 0; i < printQuantity; i++) {
        renderBarcodeSvg(`batch-barcode-${i}`, activeProduct?.barcode || activeProduct?.sku);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeProduct, tagFormat, printQuantity, isCustomTag, renderBarcodeSvg]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4EFE6] p-4 sm:p-6 flex flex-col">
      
      {/* Top Configuration Bar (Hidden during print) */}
      <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl border border-[#DFD5C6] p-5 shadow-xs mb-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#18181B] flex items-center justify-center text-[#D4AF37]">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#18181B] font-normal tracking-wide">
                Barcode & Tag Printing Studio
              </h2>
              <p className="text-xs text-[#8C7E6C]">
                Generate precision Code-128 tags for jewellery butterfly fold tags, apparel boxes & A4 sheets.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-[#18181B] hover:bg-[#2B2B30] text-[#FAF8F5] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Print {printQuantity} Labels Now</span>
          </button>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          
          {/* Tag Type Selector */}
          <div>
            <label className="block text-[#6E6152] font-medium mb-1.5">Tag Format Preset:</label>
            <div className="flex flex-col gap-1">
              {[
                { id: "jewellery", label: "Jewellery Fold Tag (Dumbbell)" },
                { id: "apparel", label: "Apparel / Box Sticker (50x25mm)" },
                { id: "a4sheet", label: "A4 Sticker Sheet (Multi-Grid)" }
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setTagFormat(fmt.id)}
                  className={`px-3 py-2 rounded-lg text-left transition-all cursor-pointer border ${
                    tagFormat === fmt.id
                      ? "bg-[#18181B] text-[#FAF8F5] border-[#18181B] font-medium"
                      : "bg-[#FAF8F5] text-[#5E5245] border-[#DFD5C6] hover:bg-[#EFE9DF]"
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Source (Catalogue vs Custom) */}
          <div>
            <label className="block text-[#6E6152] font-medium mb-1.5">Product Source:</label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setIsCustomTag(false)}
                className={`flex-1 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  !isCustomTag ? "bg-[#18181B] text-white font-medium" : "bg-[#FAF8F5] border-[#DFD5C6]"
                }`}
              >
                From Catalog
              </button>
              <button
                onClick={() => setIsCustomTag(true)}
                className={`flex-1 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  isCustomTag ? "bg-[#18181B] text-white font-medium" : "bg-[#FAF8F5] border-[#DFD5C6]"
                }`}
              >
                + Custom Item
              </button>
            </div>

            {!isCustomTag ? (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg text-xs cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.title} (₹{p.price})
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Item Title"
                  value={customTagData.title}
                  onChange={(e) => setCustomTagData({ ...customTagData, title: e.target.value })}
                  className="w-full p-1.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded text-xs"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="SKU (e.g. ZY-01)"
                    value={customTagData.sku}
                    onChange={(e) => setCustomTagData({ ...customTagData, sku: e.target.value })}
                    className="w-1/2 p-1.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded text-xs font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Price ₹"
                    value={customTagData.price}
                    onChange={(e) => setCustomTagData({ ...customTagData, price: Number(e.target.value) })}
                    className="w-1/2 p-1.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Print Quantity */}
          <div>
            <label className="block text-[#6E6152] font-medium mb-1.5">Quantity to Print:</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="1"
                max="200"
                value={printQuantity}
                onChange={(e) => setPrintQuantity(Math.max(1, Number(e.target.value)))}
                className="w-24 p-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-lg text-xs font-mono font-bold"
              />
              <span className="text-[#8C7E6C]">tags</span>
            </div>
            <div className="flex gap-1.5">
              {[6, 12, 24, 48].map(qty => (
                <button
                  key={qty}
                  onClick={() => setPrintQuantity(qty)}
                  className="px-2 py-1 bg-[#EFE9DF] hover:bg-[#E5DDCF] rounded text-[11px] font-mono cursor-pointer"
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preview Badge */}
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DFD5C6] flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-[#8C7E6C] uppercase tracking-wider">
              Single Tag Preview:
            </span>
            <div className="py-2 flex justify-center">
              <svg id="preview-barcode-svg"></svg>
            </div>
            <div className="text-[10px] text-center text-[#5E5245] font-mono">
              Code: {activeProduct?.barcode || activeProduct?.sku}
            </div>
          </div>
        </div>
      </div>

      {/* PRINTABLE TAG SHEET STAGE */}
      <div className="max-w-6xl w-full mx-auto flex-1 barcode-sheet-print">
        
        {/* Helper Instructions (no-print) */}
        <div className="p-3 mb-4 bg-[#EFE9DF] rounded-xl border border-[#DDD2C2] text-xs text-[#6B5E4F] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#8C6D3F]" />
            <span>
              {tagFormat === "jewellery" 
                ? "Jewellery Dumbbell Tag: Fold along the narrow center strip around rings or earring loops."
                : tagFormat === "apparel"
                ? "Apparel Sticker: Sized for innerwear polybags, boxes, or card hangtags."
                : "A4 Sticker Grid: Optimized for standard 24/40 sticker sheets on any laser/inkjet printer."}
            </span>
          </div>
          <span className="font-mono font-medium">{printQuantity} labels prepared</span>
        </div>

        {/* TAG GRID */}
        <div 
          className={`grid gap-3 transition-all ${
            tagFormat === "jewellery"
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              : tagFormat === "apparel"
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"
          }`}
        >
          {Array.from({ length: printQuantity }).map((_, idx) => (
            <div key={idx} className="tag-item">
              
              {/* FORMAT 1: JEWELLERY DUMBBELL / BUTTERFLY FOLD TAG */}
              {tagFormat === "jewellery" && (
                <div className="bg-white border border-gray-400 p-2 rounded-sm shadow-xs flex items-center justify-between text-black select-none">
                  {/* Left Flap: Barcode & SKU */}
                  <div className="w-[45%] text-center flex flex-col items-center justify-center">
                    <svg id={`batch-barcode-${idx}`} className="w-full"></svg>
                    <span className="text-[9px] font-mono font-bold tracking-tight">
                      {activeProduct.sku}
                    </span>
                  </div>

                  {/* Center Bridge (Narrow folding area) */}
                  <div className="w-[10%] flex flex-col items-center justify-center border-l border-r border-dashed border-gray-300 h-10">
                    <span className="text-[7px] text-gray-400 rotate-90 whitespace-nowrap">
                      FOLD
                    </span>
                  </div>

                  {/* Right Flap: Brand & Price */}
                  <div className="w-[45%] text-center flex flex-col items-center justify-center pl-1">
                    <span className="font-serif font-bold text-[11px] tracking-wider uppercase text-black">
                      ZOYARA
                    </span>
                    <span className="text-[8px] text-gray-600 uppercase tracking-tighter truncate max-w-[90px]">
                      {activeProduct.subCategory || activeProduct.category}
                    </span>
                    <span className="text-xs font-bold font-mono text-black mt-0.5">
                      MRP {formatCurrency(activeProduct.price)}
                    </span>
                  </div>
                </div>
              )}

              {/* FORMAT 2: APPAREL / INNERWEAR BOX STICKER (50x25mm) */}
              {tagFormat === "apparel" && (
                <div className="bg-white border border-gray-400 p-2.5 rounded-sm shadow-xs text-black flex flex-col justify-between select-none min-h-[95px]">
                  <div className="flex items-center justify-between border-b border-gray-300 pb-1">
                    <span className="font-serif font-bold text-[11px] tracking-wider uppercase">
                      ZOYARA INTIMATES
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-gray-100 px-1 border border-gray-300 rounded">
                      {activeProduct.size || "FREE SIZE"}
                    </span>
                  </div>

                  <div className="text-[9px] text-gray-700 font-medium truncate py-0.5">
                    {activeProduct.title}
                  </div>

                  <div className="flex items-center justify-center py-0.5">
                    <svg id={`batch-barcode-${idx}`} className="w-full"></svg>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-[9px]">
                    <span className="font-mono text-gray-600">{activeProduct.sku}</span>
                    <span className="font-bold font-mono text-xs">
                      MRP {formatCurrency(activeProduct.price)}
                    </span>
                  </div>
                </div>
              )}

              {/* FORMAT 3: COMPACT A4 STICKER SHEET MULTI-GRID */}
              {tagFormat === "a4sheet" && (
                <div className="bg-white border border-gray-400 p-1.5 rounded-xs text-black text-center select-none">
                  <div className="font-serif font-bold text-[9px] tracking-wider uppercase">
                    ZOYARA
                  </div>
                  <div className="flex items-center justify-center my-0.5">
                    <svg id={`batch-barcode-${idx}`} className="w-full"></svg>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono px-0.5">
                    <span>{activeProduct.sku}</span>
                    <span className="font-bold">{formatCurrency(activeProduct.price)}</span>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
