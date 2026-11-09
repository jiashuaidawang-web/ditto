import { getApiBase, getToken } from '../config'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT'
  data?: Record<string, unknown> | unknown[]
  auth?: boolean
  dev?: boolean
}

export function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.auth !== false) {
    const token = getToken()
    if (token) header.Authorization = `Bearer ${token}`
  }
  if (options.dev) {
    const devToken = uni.getStorageSync('devToken')
    header['x-dev-token'] = typeof devToken === 'string' && devToken ? devToken : 'dev-admin'
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${getApiBase()}${path}`,
      method: options.method ?? 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
          return
        }
        const body = res.data as { message?: string | string[] } | undefined
        const message = Array.isArray(body?.message) ? body?.message.join('；') : body?.message
        reject(new Error(message || `请求失败 ${res.statusCode}`))
      },
      fail: (err) => reject(new Error(err.errMsg || '网络错误')),
    })
  })
}
