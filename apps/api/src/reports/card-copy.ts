import { shanghaiParts, type ShanghaiDateParts } from '../common/shanghai-time'

const INTEREST_LABEL: Record<string, string> = {
  cooking: '做饭',
  music: '音乐',
  travel: '旅行',
  reading: '阅读',
  gym: '健身',
  gaming: '游戏',
  movies: '影视',
  art: '艺术',
}

const WEEKDAY = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

export function interestList(preferences: unknown): string[] {
  if (!preferences || typeof preferences !== 'object') return []
  const interests = (preferences as { interests?: unknown }).interests
  if (!Array.isArray(interests)) return []
  return interests.filter((item): item is string => typeof item === 'string')
}

/** One sentence for the report card. No scores, no contact details. */
export function oneLineReason(gradeGap: number, interestsA: string[], interestsB: string[]): string {
  const shared = interestsA.find((item) => interestsB.includes(item))
  const label = shared ? labelOf(shared) : ''
  if (label) return `同校，年级差 ${gradeGap}，都喜欢${label}`
  return `同校，年级差 ${gradeGap}，这周可以见面`
}

export function suggestionLabel(date: Date): string {
  const parts = shanghaiParts(date)
  if (parts.weekday === 6 && parts.hour >= 12 && parts.hour < 18) return '周六下午 · 校内咖啡走走'
  if (parts.weekday === 7 && parts.hour >= 12 && parts.hour < 18) return '周日下午 · 校内咖啡走走'
  return `${WEEKDAY[parts.weekday] || '本周'} ${clock(parts)} · 校内咖啡走走`
}

export function gradeLabel(grade: number | null | undefined): string {
  if (grade === 1) return '大一'
  if (grade === 2) return '大二'
  if (grade === 3) return '大三'
  if (grade === 4) return '大四'
  if (grade == null) return '年级未填'
  return `${grade} 年级`
}

export function publicReportUrl(base: string, token: string): string {
  return `${base.replace(/\/$/, '')}/m/${token}`
}

function labelOf(id: string): string {
  if (id.startsWith('custom:')) return id.slice('custom:'.length)
  return INTEREST_LABEL[id] ?? ''
}

function clock(parts: ShanghaiDateParts): string {
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}
