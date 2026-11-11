/** Canvas and QR cannot read CSS at module scope. Runtime prefers tokens.css. */
const FALLBACK = {
  paper: '#FAF7F4',
  wax: '#E23C28',
  ink: '#111111',
  capsule: '#2B2623',
  track: '#E8E2DC',
} as const

const TOKEN_NAME = {
  paper: '--color-paper',
  wax: '--color-wax',
  ink: '--color-ink',
  capsule: '--color-capsule',
  track: '--color-track',
} as const

export type WaxToken = keyof typeof FALLBACK

export function tokenColor(name: WaxToken): string {
  if (typeof document === 'undefined') return FALLBACK[name]
  const value = getComputedStyle(document.documentElement).getPropertyValue(TOKEN_NAME[name]).trim()
  return value || FALLBACK[name]
}
