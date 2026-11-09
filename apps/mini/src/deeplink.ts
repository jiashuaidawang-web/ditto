/** Read `/m/:token` or `?token=` from an H5 URL. No-op inside the WeChat mini program runtime. */
export function readReportToken(): string | null {
  if (typeof window === 'undefined') return null
  const pathMatch = window.location.pathname.match(/^\/m\/([A-Za-z0-9_-]+)$/)
  if (pathMatch) return pathMatch[1]
  const hash = window.location.hash || ''
  const hashMatch = hash.match(/\/m\/([A-Za-z0-9_-]+)/)
  if (hashMatch) return hashMatch[1]
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : window.location.search.slice(1)
  return new URLSearchParams(query).get('token')
}
