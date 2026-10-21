/**
 * ZOYARA Dedicated Print Helper
 * Ensures 100% reliable printing across all browsers without blank pages,
 * fixed modal clipping, or CSS overflow issues.
 */
export function printInvoiceElement(elementId, documentTitle = "ZOYARA Tax Invoice") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found for printing.`);
    window.print();
    return;
  }

  // Extract all existing style sheets, Tailwind CSS styles, and font links from parent document
  const parentHeadStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join("\n");

  // Create an isolated hidden iframe specifically for printing
  let printFrame = document.getElementById("zoyara-print-iframe");
  if (!printFrame) {
    printFrame = document.createElement("iframe");
    printFrame.id = "zoyara-print-iframe";
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    printFrame.style.zIndex = "-9999";
    document.body.appendChild(printFrame);
  }

  const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
  const doc = frameDoc.document || frameDoc;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${documentTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        ${parentHeadStyles}
        <style>
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
            color: #1B1A18 !important;
            margin: 0 !important;
            padding: 6mm 8mm !important;
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
          }
          .font-serif {
            font-family: 'Bodoni Moda', Georgia, serif !important;
          }
          .font-mono {
            font-family: 'JetBrains Mono', monospace !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: auto;
            margin: 6mm;
          }
          @media print {
            body {
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="zoyara-print-container" style="width: 100%; display: flex; justify-content: center;">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Wait for fonts & images to render in iframe, then trigger print
  setTimeout(() => {
    try {
      if (printFrame && printFrame.contentWindow) {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.onafterprint = () => {
          try { printFrame.remove(); } catch {}
        };
        printFrame.contentWindow.print();
      }
    } catch (e) {
      console.warn("Iframe print error, falling back to window.print()", e);
      window.print();
    }
  }, 350);
}
