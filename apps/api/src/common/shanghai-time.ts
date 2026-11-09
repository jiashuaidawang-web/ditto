export const SHANGHAI_TZ = 'Asia/Shanghai'

const WEEKDAY: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
}

export interface ShanghaiDateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  /** 1 = Monday ... 7 = Sunday */
  weekday: number
}

export interface CivilDate {
  year: number
  month: number
  day: number
}

export function shanghaiParts(date = new Date()): ShanghaiDateParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHANGHAI_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  })
  const parts = fmt.formatToParts(date)
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  const hour = Number(read('hour'))
  return {
    year: Number(read('year')),
    month: Number(read('month')),
    day: Number(read('day')),
    hour: hour === 24 ? 0 : hour,
    minute: Number(read('minute')),
    weekday: WEEKDAY[read('weekday')] ?? 1,
  }
}

/** ISO week key for the Shanghai civil date, e.g. 2026-W46. */
export function shanghaiWeekKey(date = new Date()): string {
  const parts = shanghaiParts(date)
  return isoWeekKey(parts.year, parts.month, parts.day)
}

export function previousWeekKey(weekKey: string): string {
  const monday = mondayOfWeek(weekKey)
  const prev = addDays(monday, -7)
  return isoWeekKey(prev.year, prev.month, prev.day)
}

/** Asia/Shanghai is UTC+8 and does not observe DST. */
export function shanghaiDateTime(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0))
}

export function mondayOfWeek(weekKey: string): CivilDate {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey)
  if (!match) {
    throw new Error(`Bad week key ${weekKey}`)
  }
  const isoYear = Number(match[1])
  const week = Number(match[2])
  const jan4 = new Date(Date.UTC(isoYear, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7)
  return {
    year: monday.getUTCFullYear(),
    month: monday.getUTCMonth() + 1,
    day: monday.getUTCDate(),
  }
}

export function addDays(date: CivilDate, days: number): CivilDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  }
}

/** Tuesday 23:59 and Wednesday 19:00 Asia/Shanghai for the given ISO week. */
export function dropInstants(weekKey: string): { cutoffAt: Date; releaseAt: Date } {
  const monday = mondayOfWeek(weekKey)
  const tuesday = addDays(monday, 1)
  const wednesday = addDays(monday, 2)
  return {
    cutoffAt: shanghaiDateTime(tuesday.year, tuesday.month, tuesday.day, 23, 59),
    releaseAt: shanghaiDateTime(wednesday.year, wednesday.month, wednesday.day, 19, 0),
  }
}

export function weekdayInWeek(weekKey: string, weekday: number, hour: number, minute: number): Date {
  const monday = mondayOfWeek(weekKey)
  const day = addDays(monday, weekday - 1)
  return shanghaiDateTime(day.year, day.month, day.day, hour, minute)
}

function isoWeekKey(year: number, month: number, day: number): string {
  const utc = new Date(Date.UTC(year, month - 1, day))
  const dayNum = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}
