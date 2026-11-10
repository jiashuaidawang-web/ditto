import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { pairKey } from './matcher'
import { SameSchoolGradeGapMatcher } from './same-school.matcher'

const matcher = new SameSchoolGradeGapMatcher()

describe('SameSchoolGradeGapMatcher', () => {
  it('pairs the same school when the grade gap is within 2', () => {
    const result = matcher.propose(
      [
        { userId: 'a', schoolId: 'fudan', grade: 2 },
        { userId: 'b', schoolId: 'fudan', grade: 3 },
      ],
      new Set(),
    )
    assert.equal(result.pairs.length, 1)
    assert.equal(pairKey(result.pairs[0].userAId, result.pairs[0].userBId), 'a|b')
    assert.equal(result.pairs[0].gradeGap, 1)
    assert.equal(result.pairs[0].sameSchool, true)
  })

  it('refuses a grade gap above 2 and a different school', () => {
    const result = matcher.propose(
      [
        { userId: 'a', schoolId: 'fudan', grade: 1 },
        { userId: 'b', schoolId: 'fudan', grade: 4 },
        { userId: 'c', schoolId: 'nju', grade: 1 },
      ],
      new Set(),
    )
    assert.equal(result.pairs.length, 0)
  })

  it('does not rematch a blocked pair from the previous week', () => {
    const result = matcher.propose(
      [
        { userId: 'a', schoolId: 'fudan', grade: 2 },
        { userId: 'b', schoolId: 'fudan', grade: 2 },
      ],
      new Set(['a|b']),
    )
    assert.equal(result.pairs.length, 0)
    assert.equal(result.skipped.length, 2)
  })

  it('leaves the odd person out', () => {
    const result = matcher.propose(
      [
        { userId: 'a', schoolId: 'fudan', grade: 1 },
        { userId: 'b', schoolId: 'fudan', grade: 2 },
        { userId: 'c', schoolId: 'fudan', grade: 5 },
      ],
      new Set(),
    )
    assert.equal(result.pairs.length, 1)
    assert.deepEqual([result.pairs[0].userAId, result.pairs[0].userBId].sort(), ['a', 'b'])
    assert.equal(result.skipped.some((item) => item.userId === 'c'), true)
  })
})
