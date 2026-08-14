const ink = '#1a2332'
const paper = '#f4f6f9'
const white = '#ffffff'
const slate = '#5a6a7a'
const teal = '#0d9488'
const tealSoft = '#ccfbf1'
const coral = '#e11d48'
const green = '#059669'

export const theme = {
  colors: {
    background: paper,
    surface: white,
    surfaceHover: '#e8edf2',
    primary: teal,
    primarySoft: tealSoft,
    secondary: ink,
    tertiary: white,
    muted: slate,
    border: 'rgba(26, 35, 50, 0.14)',
    success: green,
    danger: coral,
    accent: teal,
    text: ink,
    inputBg: white,
  },
  fonts: {
    body: '"IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: '"IBM Plex Sans", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '4xl': '2.25rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  radii: {
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(26 35 50 / 0.06)',
    card: '0 8px 24px rgb(26 35 50 / 0.08)',
    focus: `0 0 0 2px ${tealSoft}, 0 0 0 4px ${teal}`,
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
} as const

export type AppTheme = typeof theme
