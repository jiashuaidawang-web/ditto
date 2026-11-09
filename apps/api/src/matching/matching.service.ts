import { Injectable } from '@nestjs/common'
import { previousWeekKey, shanghaiWeekKey } from '../common/shanghai-time'
import { pairKey, type MatchCandidate, type MatchResult } from './matcher'
import { PrismaService } from '../prisma/prisma.service'
import { SameSchoolGradeGapMatcher } from './same-school.matcher'

@Injectable()
export class MatchingService {
  private readonly matcher = new SameSchoolGradeGapMatcher()

  constructor(private readonly prisma: PrismaService) {}

  /** Dry run of the current pool. Does not write pairs. */
  async preview() {
    const weekKey = shanghaiWeekKey()
    const { candidates, blockedPairKeys } = await this.loadPool(weekKey)
    const result = this.propose(candidates, blockedPairKeys)
    return {
      weekKey,
      algorithm: 'same-school-grade-gap-greedy',
      rules: ['same school preferred (cross-school not paired)', 'grade gap <= 2', 'no rematch from the previous week'],
      ...result,
    }
  }

  propose(candidates: MatchCandidate[], blockedPairKeys: ReadonlySet<string>): MatchResult {
    return this.matcher.propose(candidates, blockedPairKeys)
  }

  async loadPool(weekKey: string) {
    const users = await this.prisma.user.findMany({
      include: { profile: true, slots: true },
    })
    const candidates: MatchCandidate[] = users.map((user) => ({
      userId: user.id,
      schoolId: user.profile?.schoolId ?? null,
      grade: user.profile?.grade ?? null,
    }))
    const previous = await this.prisma.dropCycle.findUnique({
      where: { weekKey: previousWeekKey(weekKey) },
      include: { pairs: true },
    })
    const blockedPairKeys = new Set<string>()
    for (const pair of previous?.pairs ?? []) {
      if (pair.status === 'declined' || pair.status === 'cancelled') continue
      blockedPairKeys.add(pairKey(pair.userAId, pair.userBId))
    }
    return { candidates, blockedPairKeys, users }
  }
}
