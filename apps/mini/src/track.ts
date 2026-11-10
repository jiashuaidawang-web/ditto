import { request } from './api/http'

export function sessionId() {
  const stored = uni.getStorageSync('dittoSession')
  if (typeof stored === 'string' && stored) return stored
  const created = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  uni.setStorageSync('dittoSession', created)
  return created
}

export async function track(input: {
  page: string
  action: string
  payload?: Record<string, unknown>
  dwellMs?: number
}) {
  try {
    await request('/events', {
      method: 'POST',
      data: { sessionId: sessionId(), ...input },
    })
  } catch {
    /* recording must not block the form */
  }
}

export async function saveDraft(answers: Record<string, unknown>) {
  try {
    await request('/questionnaire/draft', {
      method: 'PUT',
      data: { sessionId: sessionId(), answers },
    })
  } catch {
    /* keep the answers on screen */
  }
}

export async function claimSession() {
  try {
    await request('/events/claim', { method: 'POST', data: { sessionId: sessionId() } })
  } catch {
    /* login still succeeds */
  }
}
