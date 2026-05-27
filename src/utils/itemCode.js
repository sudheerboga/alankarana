/**
 * Item Code Generator
 *
 * Format: A{SP}{encodedCP}-XXXX
 * Example: A499bd0-ABCD
 *
 * - A        = Alankarana brand prefix
 * - SP       = selling price (plain digits)
 * - encodedCP= cost price with digits 1-9 replaced by a-i, 0 stays as 0
 * - XXXX     = 4 random uppercase alphabets
 *
 * Encoding: 1→a, 2→b, 3→c, 4→d, 5→e, 6→f, 7→g, 8→h, 9→i, 0→0
 * Example: cost 240 → "bd0"
 */

const ALPHA_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const randAlpha = () => ALPHA_CHARS[Math.floor(Math.random() * ALPHA_CHARS.length)];
const randAlphaSegment = (len) => Array.from({ length: len }, randAlpha).join('');

const encodeCost = (price) => {
  const n = Math.round(Number(price) || 0).toString();
  return n.replace(/[1-9]/g, (d) => String.fromCharCode(96 + Number(d)));
};

const decodeCost = (encoded) =>
  Number(encoded.replace(/[a-i]/g, (l) => String(l.charCodeAt(0) - 96)));

export const generateItemCode = ({ costPerPiece, sellingPricePerPiece }) => {
  const sp = Math.round(Number(sellingPricePerPiece) || 0);
  const encoded = encodeCost(costPerPiece);
  const unique = randAlphaSegment(4);
  return `A${sp}${encoded}-${unique}`;
};

export const parseItemCode = (code) => {
  if (typeof code !== 'string') return null;
  // Selling price = leading digits; encoded cost starts at first letter [a-i]
  const m = code.match(/^A(\d+)([a-i][a-i0]*)-([A-Z]{4})$/);
  if (!m) return null;
  const [, spStr, encodedCost, unique] = m;
  return {
    brand: 'A',
    sellingPricePerPiece: Number(spStr),
    costPerPiece: decodeCost(encodedCost),
    unique,
  };
};

export const isValidItemCode = (code) => /^A\d+[a-i][a-i0]*-[A-Z]{4}$/.test(code);
