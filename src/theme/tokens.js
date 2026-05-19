// Centralized design tokens — change here, change everywhere.
// Inspired by premium ethnic fashion & jewellery: warm cream, deep maroon, antique gold.

export const palette = {
  light: {
    // Brand
    primary: '#8B1A3A',        // Deep maroon — sarees, traditional luxury
    primaryHover: '#6E1430',
    primaryLight: '#C4456B',
    accent: '#C9A961',         // Antique gold — jewellery
    accentHover: '#A88845',

    // Surfaces
    bg: '#FBF7F2',             // Warm cream — main background
    surface: '#FFFFFF',
    surfaceAlt: '#F5E6D3',     // Champagne — cards, elevated
    surfaceMuted: '#EFE6DA',

    // Text
    text: '#2A1810',           // Deep chocolate — main text
    textSecondary: '#6B5544',
    textMuted: '#9A8674',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E5D5C0',
    borderStrong: '#C9B59A',

    // Status
    success: '#2D6A4F',
    successBg: '#D8F3DC',
    warning: '#B8860B',
    warningBg: '#FFF4D6',
    danger: '#A4243B',
    dangerBg: '#FCE4E8',
    info: '#1B6B93',
    infoBg: '#D6EAF8',

    // Misc
    overlay: 'rgba(42, 24, 16, 0.5)',
    shimmer: 'rgba(201, 169, 97, 0.1)',
  },
  dark: {
    primary: '#D4506F',
    primaryHover: '#E27090',
    primaryLight: '#F08CA8',
    accent: '#D4B871',
    accentHover: '#E0C885',

    bg: '#1A1410',
    surface: '#252019',
    surfaceAlt: '#2F2820',
    surfaceMuted: '#3A3128',

    text: '#F5EFE6',
    textSecondary: '#C7B8A6',
    textMuted: '#8B7B68',
    textInverse: '#1A1410',

    border: '#3D3328',
    borderStrong: '#52443A',

    success: '#52B788',
    successBg: '#1B3A2B',
    warning: '#E0B341',
    warningBg: '#3D2F0F',
    danger: '#E27090',
    dangerBg: '#3A1820',
    info: '#5DADE2',
    infoBg: '#0F2A3D',

    overlay: 'rgba(0, 0, 0, 0.7)',
    shimmer: 'rgba(212, 184, 113, 0.08)',
  },
};

export const typography = {
  fontDisplay: "'Cormorant Garamond', Georgia, serif", // Headings — elegant serif
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'SF Mono', Menlo, Consolas, monospace",

  size: {
    xs: '12px',
    sm: '13px',
    base: '15px',  // Larger than 14px default — easier on mobile
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
  },
};

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '32px',
  8: '40px',
  9: '48px',
  10: '64px',
  11: '80px',
  12: '96px',
};

export const radius = {
  none: '0',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  '2xl': '28px',
  full: '9999px',
};

export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(42, 24, 16, 0.06)',
  md: '0 4px 12px rgba(42, 24, 16, 0.08)',
  lg: '0 8px 24px rgba(42, 24, 16, 0.10)',
  xl: '0 16px 48px rgba(42, 24, 16, 0.14)',
  inset: 'inset 0 1px 2px rgba(42, 24, 16, 0.06)',
  // Luxury — subtle gold tint for premium cards
  premium: '0 4px 16px rgba(201, 169, 97, 0.18), 0 1px 3px rgba(42, 24, 16, 0.06)',
};

export const motion = {
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
  },
  easing: {
    standard: [0.4, 0, 0.2, 1],
    decelerate: [0, 0, 0.2, 1],
    accelerate: [0.4, 0, 1, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

// Breakpoints — mobile first
export const breakpoint = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

// z-index scale
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  toast: 600,
  tooltip: 700,
};

// Touch target minimum (Apple HIG / Material) — critical for mobile UX
export const touchTarget = '44px';
