/**
 * Item Code Generator
 *
 * Format: A-DDMMYY-OP-SP-XXXX
 * Example: A-190526-1200-1800-8F2K
 *
 * - A      = Alankarana brand prefix
 * - DDMMYY = item added date
 * - OP     = original (cost) price, padded with one alphanumeric on each side
 * - SP     = selling price, padded with one alphanumeric on each side
 * - XXXX   = random 4-char unique identifier (uppercase, no ambiguous chars)
 *
 * The padding around prices is a "soft obfuscation" — staff can't read a price
 * just by glancing at a code, but staff trained on the format can. Avoid 0/O/1/I.
 */

import dayjs from 'dayjs';

const RAND_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0/O/1/I/L

const randChar = () => RAND_CHARS[Math.floor(Math.random() * RAND_CHARS.length)];
const randSegment = (len) => Array.from({ length: len }, randChar).join('');

const formatDate = (date) => dayjs(date).format('DDMMYY');

/**
 * Pad a numeric price with one random alphanumeric on each side.
 * 1200 → "X1200K" — keeps the number readable to humans but not the raw integer.
 */
const padPrice = (price) => {
  const n = Math.round(Number(price) || 0);
  return `${randChar()}${n}${randChar()}`;
};

export const generateItemCode = ({ costPerPiece, sellingPricePerPiece, date = new Date() }) => {
  const datePart = formatDate(date);
  const op = padPrice(costPerPiece);
  const sp = padPrice(sellingPricePerPiece);
  const unique = randSegment(4);
  return `A-${datePart}-${op}-${sp}-${unique}`;
};

/**
 * Parse a code back into its parts — useful for diagnostics, but never trust
 * the parsed price over the Firestore record.
 */
export const parseItemCode = (code) => {
  if (typeof code !== 'string') return null;
  const parts = code.split('-');
  if (parts.length !== 5 || parts[0] !== 'A') return null;
  const [, datePart, opPart, spPart, unique] = parts;

  const extractPrice = (p) => {
    const m = p.match(/^[A-Z0-9](\d+)[A-Z0-9]$/);
    return m ? Number(m[1]) : null;
  };

  return {
    brand: 'A',
    date: dayjs(datePart, 'DDMMYY').toDate(),
    costPerPiece: extractPrice(opPart),
    sellingPricePerPiece: extractPrice(spPart),
    unique,
  };
};

/**
 * Validate the format without parsing — fast check for search input.
 */
export const isValidItemCode = (code) => /^A-\d{6}-[A-Z0-9]\d+[A-Z0-9]-[A-Z0-9]\d+[A-Z0-9]-[A-Z0-9]{4}$/.test(code);
