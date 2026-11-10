import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { gradeLabel, oneLineReason, publicReportUrl, suggestionLabel } from './card-copy'

describe('report card copy', () => {
  it('writes one Chinese sentence and a deep link', () => {
    assert.equal(oneLineReason(1, ['cooking', 'music'], ['music']), '同校，年级差 1，都喜欢音乐')
    assert.equal(oneLineReason(2, ['cooking'], ['music']), '同校，年级差 2，这周可以见面')
    assert.equal(publicReportUrl('https://aiditto.cn/', 'abc'), 'https://aiditto.cn/m/abc')
    assert.equal(gradeLabel(2), '大二')
  })

  it('labels Saturday afternoon in Shanghai', () => {
    const saturday1500 = new Date('2026-11-14T07:00:00.000Z')
    assert.equal(suggestionLabel(saturday1500), '周六下午 · 校内咖啡走走')
  })
})