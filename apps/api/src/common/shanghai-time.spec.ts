import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { dropInstants, previousWeekKey, shanghaiParts, shanghaiWeekKey } from './shanghai-time'

describe('shanghai time', () => {
  it('reads 2026-11-09 12:00 Asia/Shanghai as Monday of week 46', () => {
    const instant = new Date(Date.UTC(2026, 10, 9, 4, 0, 0))
    const parts = shanghaiParts(instant)
    assert.equal(parts.year, 2026)
    assert.equal(parts.month, 11)
    assert.equal(parts.day, 9)
    assert.equal(parts.weekday, 1)
    assert.equal(parts.hour, 12)
    assert.equal(shanghaiWeekKey(instant), '2026-W46')
  })

  it('places cutoff on Tuesday 23:59 and release on Wednesday 19:00', () => {
    const { cutoffAt, releaseAt } = dropInstants('2026-W46')
    assert.equal(cutoffAt.toISOString(), '2026-11-10T15:59:00.000Z')
    assert.equal(releaseAt.toISOString(), '2026-11-11T11:00:00.000Z')
  })

  it('steps back across the ISO year boundary', () => {
    assert.equal(previousWeekKey('2026-W46'), '2026-W45')
    assert.equal(previousWeekKey('2026-W01'), '2025-W52')
  })
})
