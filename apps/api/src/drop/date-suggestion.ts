import { weekdayInWeek } from '../common/shanghai-time'

export interface SlotLike {
  weekday: number
  startMin: number
  endMin: number
}

export interface DateSuggestion {
  at: Date
  note: string
}

/** First shared free slot in the drop week, otherwise Saturday 14:00 Shanghai. */
export function suggestMeetup(weekKey: string, slotsA: SlotLike[], slotsB: SlotLike[]): DateSuggestion {
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const left = slotsA.filter((slot) => slot.weekday === weekday)
    const right = slotsB.filter((slot) => slot.weekday === weekday)
    for (const a of left) {
      for (const b of right) {
        const start = Math.max(a.startMin, b.startMin)
        const end = Math.min(a.endMin, b.endMin)
        if (end - start >= 60) {
          const hour = Math.floor(start / 60)
          const minute = start % 60
          return {
            at: weekdayInWeek(weekKey, weekday, hour, minute),
            note: `overlap on weekday ${weekday} for ${end - start} minutes`,
          }
        }
      }
    }
  }
  return {
    at: weekdayInWeek(weekKey, 6, 14, 0),
    note: 'TODO(availability-intersect): no 60-minute overlap; placeholder Saturday 14:00 Asia/Shanghai',
  }
}
