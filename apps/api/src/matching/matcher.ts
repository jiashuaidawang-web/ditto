export interface MatchCandidate {
  userId: string
  schoolId: string | null
  grade: number | null
}

export interface ProposedPair {
  userAId: string
  userBId: string
  schoolId: string
  gradeGap: number
  sameSchool: true
  reason: string
}

export interface SkippedCandidate {
  userId: string
  reason: string
}

export interface MatchResult {
  pairs: ProposedPair[]
  skipped: SkippedCandidate[]
}

/**
 * MVP matcher seam. Replace the greedy same-school implementation with a
 * graph / max-weight matcher without changing DropService.
 */
export interface Matcher {
  propose(candidates: MatchCandidate[], blockedPairKeys: ReadonlySet<string>): MatchResult
}

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

export const MAX_GRADE_GAP = 2
