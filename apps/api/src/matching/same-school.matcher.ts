import { MAX_GRADE_GAP, pairKey, type MatchCandidate, type Matcher, type MatchResult } from './matcher'

/**
 * Trivial placeholder. Same school only (cross-school is out of MVP).
 * Grade gap <= 2. A pair blocked from the previous week is skipped.
 * Greedy, not an optimal graph matching.
 */
export class SameSchoolGradeGapMatcher implements Matcher {
  propose(candidates: MatchCandidate[], blockedPairKeys: ReadonlySet<string>): MatchResult {
    const skipped: MatchResult['skipped'] = []
    const ready = candidates.filter((candidate) => {
      if (!candidate.schoolId) {
        skipped.push({ userId: candidate.userId, reason: 'missing schoolId' })
        return false
      }
      if (candidate.grade == null) {
        skipped.push({ userId: candidate.userId, reason: 'missing grade' })
        return false
      }
      return true
    })

    const bySchool = new Map<string, MatchCandidate[]>()
    for (const candidate of ready) {
      const schoolId = candidate.schoolId as string
      const group = bySchool.get(schoolId) ?? []
      group.push(candidate)
      bySchool.set(schoolId, group)
    }

    const pairs: MatchResult['pairs'] = []
    for (const [schoolId, group] of bySchool) {
      const pool = [...group].sort((a, b) => a.grade! - b.grade! || a.userId.localeCompare(b.userId))
      const used = new Set<string>()
      for (const left of pool) {
        if (used.has(left.userId)) continue
        let best: { candidate: MatchCandidate; gap: number } | null = null
        for (const right of pool) {
          if (right.userId === left.userId || used.has(right.userId)) continue
          const gap = Math.abs(left.grade! - right.grade!)
          if (gap > MAX_GRADE_GAP) continue
          if (blockedPairKeys.has(pairKey(left.userId, right.userId))) continue
          if (!best || gap < best.gap || (gap === best.gap && right.userId < best.candidate.userId)) {
            best = { candidate: right, gap }
          }
        }
        if (!best) continue
        used.add(left.userId)
        used.add(best.candidate.userId)
        const [userAId, userBId] =
          left.userId < best.candidate.userId
            ? [left.userId, best.candidate.userId]
            : [best.candidate.userId, left.userId]
        pairs.push({
          userAId,
          userBId,
          schoolId,
          gradeGap: best.gap,
          sameSchool: true,
          reason: `same school ${schoolId}; grade gap ${best.gap} <= ${MAX_GRADE_GAP}; not paired last week`,
        })
      }
      for (const candidate of pool) {
        if (!used.has(candidate.userId)) {
          skipped.push({ userId: candidate.userId, reason: `unpaired in ${schoolId}` })
        }
      }
    }

    return { pairs, skipped }
  }
}
