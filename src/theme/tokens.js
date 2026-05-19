// Modern minimal tokens — lots of whitespace, neutral canvas, maroon + gold as accents.
// Aesthetic: clean fintech meets premium boutique. Inspired by Linear, Cred, Apple.

export const palette = {
  light: {
    // Brand (used sparingly — accents only, never as page background)
    primary: '#8B1A3A',         // Deep maroon — primary CTAs, key numbers
    primaryHover: '#701429',
    primaryLight: '#FBEEF1',    // Tinted background for selected/active states
    accent: '#B8924E',          // Antique gold — secondary highlights
    accentHover: '#9A7A40',
    accentLight: '#FBF6EC',

    // Neutral canvas — generous whitespace, near-white
    bg: '#FAFAF7',              // Off-white with the faintest warm undertone
    surface: '#FFFFFF',
    surfaceAlt: '#F4F4F1',      // Subtle card differentiation
    surfaceMuted: '#EDEDE9',

    // Text — strong contrast hierarchy
    text: '#16161A',            // Near-black, not pure black (softer)
    textSecondary: '#5C5C66',
    textMuted: '#9090A0',
    textInverse: '#FFFFFF',

    // Borders — almost invisible, just enough
    border: '#EAEAE6',
    borderStrong: '#D8D8D4',

    // Status — muted, refined
    success: '#0F7A4D',
    successBg: '#E8F5EE',
    warning: '#9C6F00',
    warningBg: '#FFF7E0',
    danger: '#B42143',
    dangerBg: '#FCEBEF',
    info: '#1E5A8C',
    infoBg: '#E5F1FA',

    overlay: 'rgba(22, 22, 26, 0.55)',
    shimmer: 'rgba(139, 26, 58, 0.06)',
  },
  dark: {
    primary: '#E26E8F',
    primaryHover: '#EC8AA7',
    primaryLight: '#2B1620',
    accent: '#D9B870',
    accentHover: '#E5C887',
    accentLight: '#2A2418',

    bg: '#0E0E11',
    surface: '#161619',
    surfaceAlt: '#1E1E22',
    surfaceMuted: '#26262B',

    text: '#F5F5F2',
    textSecondary: '#B0B0B8',
    textMuted: '#70707C',
    textInverse: '#16161A',

    border: '#26262B',
    borderStrong: '#3A3A40',

    success: '#4FAE7F',
    successBg: '#0F2A1E',
    warning: '#D9A536',
    warningBg: '#2B2008',
    danger: '#EC6685',
    dangerBg: '#2B1018',
    info: '#5FA8DC',
    infoBg: '#0A1F2E',

    overlay: 'rgba(0, 0, 0, 0.75)',
    shimmer: 'rgba(226, 110, 143, 0.05)',
  },
};

export const typography = {
  // Single, clean sans-serif everywhere. Display variant uses tighter tracking + heavier weight.
  fontDisplay: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",

  size: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '56px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.7,
  },
  letterSpacing: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0',
    wide: '0.04em',
    wider: '0.08em',
  },
};

// Generous spacing — minimalism = breathing room
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
  9: '56px',
  10: '72px',
  11: '96px',
  12: '128px',
};

// Modern radius — soft but not playful
export const radius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '28px',
  full: '9999px',
};

// Almost no shadows — use borders for separation instead. This is the minimal look.
export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(16, 16, 26, 0.04)',
  md: '0 2px 8px rgba(16, 16, 26, 0.05)',
  lg: '0 8px 24px rgba(16, 16, 26, 0.08)',
  xl: '0 16px 40px rgba(16, 16, 26, 0.12)',
  inset: 'inset 0 1px 2px rgba(16, 16, 26, 0.04)',
  premium: '0 4px 16px rgba(139, 26, 58, 0.12)', // For the rare elevated CTA
};

export const motion = {
  duration: {
    fast: 0.15,
    normal: 0.22,
    slow: 0.35,
  },
  easing: {
    standard: [0.4, 0, 0.2, 1],
    decelerate: [0, 0, 0.2, 1],
    accelerate: [0.4, 0, 1, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

export const breakpoint = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

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

export const touchTarget = '44px';
