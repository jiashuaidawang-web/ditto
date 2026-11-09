import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeInterests } from './catalog'

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
})
