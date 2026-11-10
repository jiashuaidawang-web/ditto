const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export function getApiBase(): string {
  try {
    const stored = uni.getStorageSync('apiBase')
    if (typeof stored === 'string' && stored.trim()) {
      return stored.trim().replace(/\/$/, '')
    }
  } catch {
    // storage is unavailable in some build-time paths
  }
  return DEFAULT_BASE.replace(/\/$/, '')
}

export function setApiBase(url: string) {
  uni.setStorageSync('apiBase', url.trim().replace(/\/$/, ''))
}

export function getToken(): string {
  const token = uni.getStorageSync('token')
  return typeof token === 'string' ? token : ''
}

export function setToken(token: string) {
  uni.setStorageSync('token', token)
}

export function getUserId(): string {
  const userId = uni.getStorageSync('userId')
  return typeof userId === 'string' ? userId : ''
}

export function setUserId(userId: string) {
  uni.setStorageSync('userId', userId)
}

export function getDevToken(): string {
  const token = uni.getStorageSync('devToken')
  return typeof token === 'string' && token ? token : 'dev-admin'
}

export function setDevToken(token: string) {
  uni.setStorageSync('devToken', token)
}
