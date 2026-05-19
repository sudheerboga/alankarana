import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateItemCode } from '../utils/itemCode';

const ins = (name, doc) => addDoc(collection(db, name), doc);

// Create a Firestore Timestamp N days ago at a specific hour
const ts = (daysAgo, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return Timestamp.fromDate(d);
};

// ─── Raw data ──────────────────────────────────────────────────────────────────

const VENDORS = [
  { name: 'Suresh Silk Sarees',  category: 'sarees',        phone: '9876543210', address: 'Ring Road, Surat, Gujarat',   notes: 'Best Kanjivaram & Pattu supplier' },
  { name: 'Mumbai Silk Palace',   category: 'sarees',        phone: '9876543211', address: 'Fashion Street, Mumbai',      notes: 'Banarasi and Georgette specialist' },
  { name: 'Lakshmi Jewels',       category: '1gram-gold',    phone: '9876543212', address: 'Begumpet, Hyderabad',         notes: '1 gram imitation gold jewellery' },
  { name: 'Vijaya Textiles',      category: 'normal-blouse', phone: '9876543213', address: 'T Nagar, Chennai',            notes: 'Readymade blouses and inner wear' },
];

// soldPieces + remainingPieces must exactly match the sales rows below
const ITEM_DEFS = [
  { itemName: 'Kanjivaram Silk Saree',    category: 'sarees',        setQuantity: 8,  piecesPerSet: 1, totalPieces: 8,  soldPieces: 4,  remainingPieces: 4,  costPerPiece: 2800, sellingPricePerPiece: 4200, vendorKey: 'Suresh Silk Sarees',  notes: 'Pure silk, temple border', daysAgo: 40 },
  { itemName: 'Banarasi Silk Saree',       category: 'sarees',        setQuantity: 5,  piecesPerSet: 1, totalPieces: 5,  soldPieces: 2,  remainingPieces: 3,  costPerPiece: 2200, sellingPricePerPiece: 3200, vendorKey: 'Mumbai Silk Palace',   notes: 'Zari border, heavy work', daysAgo: 35 },
  { itemName: 'Soft Silk Pattu Saree',     category: 'sarees',        setQuantity: 10, piecesPerSet: 1, totalPieces: 10, soldPieces: 4,  remainingPieces: 6,  costPerPiece: 1400, sellingPricePerPiece: 2100, vendorKey: 'Suresh Silk Sarees',  notes: 'Light weight, everyday wear', daysAgo: 38 },
  { itemName: 'Cotton Kalamkari Saree',    category: 'sarees',        setQuantity: 15, piecesPerSet: 1, totalPieces: 15, soldPieces: 6,  remainingPieces: 9,  costPerPiece:  650, sellingPricePerPiece: 1100, vendorKey: 'Suresh Silk Sarees',  notes: 'Hand-printed, block print', daysAgo: 32 },
  { itemName: 'Georgette Fancy Saree',     category: 'sarees',        setQuantity: 8,  piecesPerSet: 1, totalPieces: 8,  soldPieces: 2,  remainingPieces: 6,  costPerPiece:  800, sellingPricePerPiece: 1400, vendorKey: 'Mumbai Silk Palace',   notes: 'Party wear, sequence border', daysAgo: 28 },
  { itemName: '1 Gram Gold Necklace Set',  category: '1gram-gold',    setQuantity: 6,  piecesPerSet: 1, totalPieces: 6,  soldPieces: 3,  remainingPieces: 3,  costPerPiece:  950, sellingPricePerPiece: 1500, vendorKey: 'Lakshmi Jewels',       notes: 'Temple design, antique finish', daysAgo: 30 },
  { itemName: '1 Gram Gold Jhumkas',       category: '1gram-gold',    setQuantity: 12, piecesPerSet: 1, totalPieces: 12, soldPieces: 5,  remainingPieces: 7,  costPerPiece:  420, sellingPricePerPiece:  750, vendorKey: 'Lakshmi Jewels',       notes: 'Long drop jhumkas', daysAgo: 30 },
  { itemName: 'Maggam Work Blouse',        category: 'maggam-blouse', setQuantity: 4,  piecesPerSet: 1, totalPieces: 4,  soldPieces: 2,  remainingPieces: 2,  costPerPiece:  850, sellingPricePerPiece: 1400, vendorKey: null,                   notes: 'Full sleeve, size 38-40', daysAgo: 25 },
  { itemName: 'Plain Cotton Blouse',       category: 'normal-blouse', setQuantity: 20, piecesPerSet: 1, totalPieces: 20, soldPieces: 7,  remainingPieces: 13, costPerPiece:  180, sellingPricePerPiece:  350, vendorKey: 'Vijaya Textiles',      notes: 'Mixed sizes 34-42', daysAgo: 22 },
  { itemName: 'Saree Inner (Langalu)',     category: 'langalu',       setQuantity: 25, piecesPerSet: 1, totalPieces: 25, soldPieces: 9,  remainingPieces: 16, costPerPiece:   90, sellingPricePerPiece:  180, vendorKey: 'Vijaya Textiles',      notes: 'Cotton, sizes S/M/L', daysAgo: 22 },
  { itemName: 'Cotton Nighty',             category: 'nighties',      setQuantity: 15, piecesPerSet: 1, totalPieces: 15, soldPieces: 5,  remainingPieces: 10, costPerPiece:  280, sellingPricePerPiece:  480, vendorKey: 'Vijaya Textiles',      notes: 'Printed, full length', daysAgo: 20 },
  { itemName: 'Glass Bangles Set (1 doz)', category: 'matti-gajulu',  setQuantity: 30, piecesPerSet: 1, totalPieces: 30, soldPieces: 15, remainingPieces: 15, costPerPiece:   60, sellingPricePerPiece:  150, vendorKey: null,                   notes: 'Assorted colors', daysAgo: 18 },
];

// [itemName, qty, price, paymentType, customer, daysAgo, hour]
const SALES_ROWS = [
  // Kanjivaram (sold: 4)
  ['Kanjivaram Silk Saree',   1, 4200, 'cash', 'Priya Sharma',    0, 10],
  ['Kanjivaram Silk Saree',   1, 4000, 'upi',  'Lakshmi Devi',    8, 14],
  ['Kanjivaram Silk Saree',   1, 4200, 'upi',  'Meena Kumari',   15, 11],
  ['Kanjivaram Silk Saree',   1, 4200, 'cash', 'Sita Reddy',     25, 16],

  // Banarasi (sold: 2)
  ['Banarasi Silk Saree',     1, 3200, 'cash', 'Sunita Rao',      3, 12],
  ['Banarasi Silk Saree',     1, 3000, 'upi',  'Anitha Reddy',   20, 15],

  // Pattu (sold: 4)
  ['Soft Silk Pattu Saree',   1, 2100, 'cash', 'Kavitha Devi',    1, 11],
  ['Soft Silk Pattu Saree',   2, 2100, 'upi',  'Rajani',          5, 13],
  ['Soft Silk Pattu Saree',   1, 2000, 'cash', 'Sujatha',        12, 10],

  // Kalamkari (sold: 6)
  ['Cotton Kalamkari Saree',  2, 1100, 'cash', 'Sudha',           2, 11],
  ['Cotton Kalamkari Saree',  1, 1000, 'upi',  'Bhavani',         7, 14],
  ['Cotton Kalamkari Saree',  2, 1100, 'cash', 'Komala',         18, 12],
  ['Cotton Kalamkari Saree',  1, 1100, 'cash', 'Padma',          25, 10],

  // Georgette (sold: 2)
  ['Georgette Fancy Saree',   1, 1400, 'upi',  'Vijaya',          4, 16],
  ['Georgette Fancy Saree',   1, 1350, 'cash', 'Saritha',        14, 11],

  // Necklace (sold: 3)
  ['1 Gram Gold Necklace Set',1, 1500, 'upi',  'Rekha',           1, 10],
  ['1 Gram Gold Necklace Set',1, 1500, 'cash', 'Sumathi',         9, 15],
  ['1 Gram Gold Necklace Set',1, 1450, 'upi',  'Usha',           22, 12],

  // Jhumkas (sold: 5)
  ['1 Gram Gold Jhumkas',     2,  750, 'cash', 'Rohini',          3, 11],
  ['1 Gram Gold Jhumkas',     1,  700, 'upi',  'Parvathi',       11, 14],
  ['1 Gram Gold Jhumkas',     2,  750, 'cash', 'Deepa',          19, 10],

  // Maggam blouse (sold: 2)
  ['Maggam Work Blouse',      1, 1400, 'upi',  'Indira',          6, 13],
  ['Maggam Work Blouse',      1, 1350, 'cash', 'Lalitha',        24, 11],

  // Plain blouse (sold: 7)
  ['Plain Cotton Blouse',     3,  350, 'cash', null,              2, 12],
  ['Plain Cotton Blouse',     2,  350, 'cash', 'Nagamani',        8, 15],
  ['Plain Cotton Blouse',     2,  330, 'upi',  'Savithri',       16, 10],

  // Langalu (sold: 9)
  ['Saree Inner (Langalu)',   4,  180, 'cash', null,              1, 11],
  ['Saree Inner (Langalu)',   3,  180, 'cash', null,             10, 14],
  ['Saree Inner (Langalu)',   2,  180, 'cash', null,             22, 10],

  // Nighty (sold: 5)
  ['Cotton Nighty',           2,  480, 'cash', 'Sulochana',       5, 12],
  ['Cotton Nighty',           1,  450, 'upi',  'Mamatha',        13, 15],
  ['Cotton Nighty',           2,  480, 'cash', 'Vimala',         27, 11],

  // Bangles (sold: 15)
  ['Glass Bangles Set (1 doz)',5, 150, 'cash', null,              1, 10],
  ['Glass Bangles Set (1 doz)',4, 150, 'cash', 'Radha',           6, 13],
  ['Glass Bangles Set (1 doz)',3, 140, 'cash', 'Geetha',         15, 11],
  ['Glass Bangles Set (1 doz)',3, 150, 'cash', 'Kamala',         23, 12],
];

// [type, amount, paymentType, notes, daysAgo, isBulk, vendorName, billNumber]
const EXPENSE_ROWS = [
  ['fuel',               650, 'cash', 'Petrol for market visit',          3,  false, null, null],
  ['food',               320, 'cash', 'Lunch for staff',                  5,  false, null, null],
  ['fuel',               700, 'upi',  'Diesel — Surat trip',              8,  false, null, null],
  ['textile-purchase', 22400, 'bank', 'Kanjivaram stock (8 sarees)',      10, true,  'Suresh Silk Sarees', 'INV-2026-001'],
  ['food',               280, 'cash', 'Staff tea and snacks',             12, false, null, null],
  ['misc',               450, 'cash', 'Shop cleaning and maintenance',    14, false, null, null],
  ['fuel',               580, 'upi',  'Petrol',                           16, false, null, null],
  ['textile-purchase',  5400, 'bank', 'Blouse materials (30 pcs)',        18, true,  'Vijaya Textiles', 'INV-2026-042'],
  ['travel',            1200, 'upi',  'Train fare — Chennai buying trip',  20, false, null, null],
  ['food',               350, 'cash', 'Lunch — market day',               22, false, null, null],
  ['fuel',               720, 'upi',  'Petrol for delivery runs',         24, false, null, null],
  ['jewellery-purchase',11760,'bank', '1GM gold stock (18 pieces)',       26, true,  'Lakshmi Jewels', 'LJ-2026-018'],
  ['misc',               500, 'cash', 'Carry bags and packaging',         28, false, null, null],
  ['fuel',               680, 'upi',  'Petrol',                           30, false, null, null],
  ['misc',               200, 'cash', 'Stationery and bill books',         1, false, null, null],
];

// [description, category, daysAgo]
const REQUEST_ROWS = [
  ['Pure silk Kanjivaram in green colour, size 38',        'sarees',        1],
  ['Heavy Banarasi in red and gold for wedding function',  'sarees',        3],
  ['Small size 1 gram gold bangles set',                   '1gram-gold',    5],
  ['Full sleeve maggam work blouse — peacock pattern',     'maggam-blouse', 7],
  ['White with gold border cotton saree',                  'sarees',       10],
];

// ─── Seed function ────────────────────────────────────────────────────────────

export const seedDatabase = async (onLog) => {
  const log = (msg) => { console.log(msg); onLog(msg); };

  // 1. Vendors
  log('Creating vendors…');
  const vendorIds = {};
  for (const v of VENDORS) {
    const ref = await ins('vendors', { ...v, createdAt: ts(60), updatedAt: ts(60) });
    vendorIds[v.name] = ref.id;
    log(`  ✓ ${v.name}`);
  }

  // 2. Inventory
  log('Creating inventory items…');
  const itemMap = {};
  for (const def of ITEM_DEFS) {
    const { daysAgo: da, vendorKey, ...fields } = def;
    const itemCode = generateItemCode({
      costPerPiece: fields.costPerPiece,
      sellingPricePerPiece: fields.sellingPricePerPiece,
      date: new Date(Date.now() - da * 86400000),
    });
    const doc = {
      ...fields,
      itemCode,
      itemNameLower: fields.itemName.toLowerCase(),
      totalPurchaseCost: fields.costPerPiece * fields.totalPieces,
      vendor: vendorKey ? vendorIds[vendorKey] : null,
      images: [],
      createdAt: ts(da),
      updatedAt: ts(Math.ceil(da / 2)),
    };
    const ref = await ins('inventory', doc);
    itemMap[fields.itemName] = { id: ref.id, itemCode, ...fields };
    log(`  ✓ ${fields.itemName}`);
  }

  // 3. Sales
  log('Creating sales…');
  let saleCount = 0;
  for (const [itemName, qty, price, paymentType, customer, daysAgo, hour] of SALES_ROWS) {
    const item = itemMap[itemName];
    if (!item) { log(`  ⚠️ Missing item: ${itemName}`); continue; }
    const totalSaleAmount = price * qty;
    const totalCost = item.costPerPiece * qty;
    const profit = totalSaleAmount - totalCost;
    const saleTs = ts(daysAgo, hour);
    await ins('sales', {
      itemId: item.id, itemCode: item.itemCode, itemName: item.itemName,
      category: item.category, quantity: qty,
      costPerPiece: item.costPerPiece, defaultSellingPrice: item.sellingPricePerPiece,
      actualSellingPrice: price, discount: 0,
      totalSaleAmount, totalCost, profit,
      margin: (profit / totalSaleAmount) * 100,
      isLoss: profit < 0,
      customerName: customer || null, paymentType, notes: '', soldBy: null,
      soldAt: saleTs, createdAt: saleTs,
    });
    saleCount++;
  }
  log(`  ✓ ${saleCount} sales created`);

  // 4. Expenses
  log('Creating expenses…');
  for (const [type, amount, paymentType, notes, daysAgo, isBulkPurchase, vendorName, billNumber] of EXPENSE_ROWS) {
    const expTs = ts(daysAgo, 9);
    await ins('expenses', {
      type, amount, paymentType, notes,
      date: expTs,
      isBulkPurchase: !!isBulkPurchase,
      vendorName: vendorName || null,
      billNumber: billNumber || null,
      vendor: null, billImage: null,
      createdAt: expTs, updatedAt: expTs,
    });
  }
  log(`  ✓ ${EXPENSE_ROWS.length} expenses created`);

  // 5. Customer requests
  log('Creating customer requests…');
  for (const [description, category, daysAgo] of REQUEST_ROWS) {
    const reqTs = ts(daysAgo, 16);
    await ins('requestedItems', {
      description, category,
      status: 'pending',
      createdAt: reqTs, updatedAt: reqTs,
    });
  }
  log(`  ✓ ${REQUEST_ROWS.length} customer requests created`);

  log('');
  log('✅ Done! All test data inserted successfully.');
};
