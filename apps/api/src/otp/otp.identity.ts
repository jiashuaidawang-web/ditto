const MAINLAND_MOBILE = /^1\d{10}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, '')
  const local = digits.startsWith('86') && digits.length === 13 ? digits.slice(2) : digits
  return MAINLAND_MOBILE.test(local) ? local : null
}

export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase()
  return EMAIL.test(email) ? email : null
}
