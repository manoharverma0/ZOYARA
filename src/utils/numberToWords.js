// Utility to convert numbers to Indian Currency Words (e.g., ₹583 -> "Five Hundred Eighty-Three Rupees Only")
export function numberToIndianWords(num) {
  if (!num || isNaN(num)) return "Zero Rupees Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n) {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : " ");
  }

  const intPart = Math.floor(Math.abs(num));
  if (intPart === 0) return "Zero Rupees Only";

  let str = "";
  const crore = Math.floor(intPart / 10000000);
  const lakh = Math.floor((intPart % 10000000) / 100000);
  const thousand = Math.floor((intPart % 100000) / 1000);
  const hundred = Math.floor((intPart % 1000) / 100);
  const rest = intPart % 100;

  if (crore > 0) str += inWords(crore) + "Crore ";
  if (lakh > 0) str += inWords(lakh) + "Lakh ";
  if (thousand > 0) str += inWords(thousand) + "Thousand ";
  if (hundred > 0) str += inWords(hundred) + "Hundred ";
  if (rest > 0) {
    if (str !== "") str += "and ";
    str += inWords(rest);
  }

  return (str.trim() + " Rupees Only").replace(/\s+/g, " ");
}
