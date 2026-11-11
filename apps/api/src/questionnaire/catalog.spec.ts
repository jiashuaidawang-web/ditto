import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { LOCK_LINE, QUESTIONNAIRE, normalizeInterests } from './catalog'

describe('interest tree', () => {
  it('requires a specialty for each structured hobby in selection order', () => {
    const result = normalizeInterests(['cooking', 'music'], {
      cooking: ['italian'],
      music: ['kpop', 'other:现场'],
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.deepEqual(result.value.interests, ['cooking', 'music'])
    assert.deepEqual(result.value.specialties.cooking, ['italian'])
    assert.deepEqual(result.value.specialties.music, ['kpop', 'other:现场'])
  })

  it('skips specialty when the only hobby is custom', () => {
    const result = normalizeInterests(['custom:摄影'], {})
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.deepEqual(result.value.interests, ['custom:摄影'])
    assert.deepEqual(result.value.specialties, {})
  })

  it('rejects a structured hobby with no specialty', () => {
    const result = normalizeInterests(['cooking', 'custom:滑板'], {})
    assert.equal(result.ok, false)
  })

  it('uses the wax-seal lock sentence and drops the old privacy line', () => {
    assert.equal(LOCK_LINE, '私密，只用来为你匹配')
    const privacies = QUESTIONNAIRE.steps.flatMap((step) =>
      'privacy' in step && step.privacy ? [step.privacy] : [],
    )
    assert.equal(privacies.includes('仅用于匹配，不会公开展示'), false)
    assert.equal(privacies.includes(LOCK_LINE), true)
  })
})
