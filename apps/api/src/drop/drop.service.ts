import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { dropInstants, previousWeekKey, shanghaiWeekKey, SHANGHAI_TZ } from '../common/shanghai-time'
import { MatchingService } from '../matching/matching.service'
import { NotifyService } from '../notify/notify.service'
import { PrismaService } from '../prisma/prisma.service'
import { suggestMeetup } from './date-suggestion'
import type { Prisma } from '../generated/prisma/client'

type DropSource = 'cron' | 'manual'

@Injectable()
export class DropService {
  private readonly logger = new Logger(DropService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly matching: MatchingService,
    private readonly notify: NotifyService,
  ) {}

  async currentPublic() {
    const weekKey = shanghaiWeekKey()
    const cycle = await this.prisma.dropCycle.findUnique({ where: { weekKey } })
    const instants = dropInstants(weekKey)
    return {
      weekKey,
      timezone: SHANGHAI_TZ,
      phase: cycle?.phase ?? 'open',
      cutoffAt: (cycle?.cutoffAt ?? instants.cutoffAt).toISOString(),
      releaseAt: (cycle?.releaseAt ?? instants.releaseAt).toISOString(),
      rule: 'Tuesday 23:59 Asia/Shanghai cutoff, Wednesday 19:00 push',
    }
  }

  async currentAdmin() {
    const weekKey = shanghaiWeekKey()
    const cycle = await this.prisma.dropCycle.findUnique({
      where: { weekKey },
      include: { pairs: true },
    })
    return {
      ...(await this.currentPublic()),
      pairCount: cycle?.pairs.length ?? 0,
      log: cycle?.log ?? [],
      pairs: cycle?.pairs ?? [],
    }
  }

  async runCutoff(source: DropSource, force = false) {
    const weekKey = shanghaiWeekKey()
    const instants = dropInstants(weekKey)
    const existing = await this.prisma.dropCycle.findUnique({ where: { weekKey } })
    if (existing && (existing.phase === 'released' || existing.phase === 'closed') && !force) {
      throw new ConflictException(`cycle ${weekKey} is ${existing.phase}; pass force to rematch`)
    }

    const { candidates, blockedPairKeys, users } = await this.matching.loadPool(weekKey)
    const result = this.matching.propose(candidates, blockedPairKeys)
    const slotsByUser = new Map(users.map((user) => [user.id, user.slots ?? []]))
    const intended = [
      `freeze signups for ${weekKey} at Tuesday 23:59 ${SHANGHAI_TZ}`,
      `blocked ${blockedPairKeys.size} pairs from ${previousWeekKey(weekKey)}`,
      `propose ${result.pairs.length} pairs; skip ${result.skipped.length}`,
      'persist proposed pairs with a date suggestion',
    ]
    this.logger.log(JSON.stringify({ source, phase: 'cutoff', weekKey, intended, skipped: result.skipped }))

    const cycle = await this.prisma.dropCycle.upsert({
      where: { weekKey },
      create: {
        weekKey,
        timezone: SHANGHAI_TZ,
        cutoffAt: instants.cutoffAt,
        releaseAt: instants.releaseAt,
        phase: 'cutoff',
        log: [],
      },
      update: {
        phase: 'cutoff',
        cutoffAt: instants.cutoffAt,
        releaseAt: instants.releaseAt,
      },
    })

    await this.prisma.matchPair.deleteMany({ where: { dropCycleId: cycle.id } })
    for (const pair of result.pairs) {
      const suggestion = suggestMeetup(weekKey, slotsByUser.get(pair.userAId) ?? [], slotsByUser.get(pair.userBId) ?? [])
      await this.prisma.matchPair.create({
        data: {
          dropCycleId: cycle.id,
          userAId: pair.userAId,
          userBId: pair.userBId,
          schoolId: pair.schoolId,
          gradeGap: pair.gradeGap,
          reason: pair.reason,
          status: 'proposed',
          suggestedAt: suggestion.at,
          meetupAt: suggestion.at,
          suggestionNote: suggestion.note,
        },
      })
    }

    const entry = {
      at: new Date().toISOString(),
      source,
      phase: 'cutoff' as const,
      intended,
      pairCount: result.pairs.length,
      skipped: result.skipped,
    }
    await this.appendLog(cycle.id, entry)
    return { weekKey, ...entry }
  }

  async runRelease(source: DropSource) {
    const weekKey = shanghaiWeekKey()
    let cycle = await this.prisma.dropCycle.findUnique({ where: { weekKey } })
    const notes: string[] = []
    if (!cycle || cycle.phase === 'open') {
      notes.push('cutoff had not run; running cutoff before release')
      await this.runCutoff(source)
      cycle = await this.prisma.dropCycle.findUniqueOrThrow({ where: { weekKey } })
    }

    const pairs = await this.prisma.matchPair.findMany({
      where: { dropCycleId: cycle.id, status: { notIn: ['declined', 'cancelled'] } },
      include: {
        userA: { select: { openid: true } },
        userB: { select: { openid: true } },
      },
    })

    const intended = [
      `Wednesday 19:00 ${SHANGHAI_TZ} Drop for ${weekKey}`,
      `send match poster + date suggestion to ${pairs.length * 2} openids`,
      'users confirm, reschedule, check in, then leave short feedback',
    ]
    this.logger.log(JSON.stringify({ source, phase: 'release', weekKey, intended, notes }))

    const notifications = []
    for (const pair of pairs) {
      const when = (pair.meetupAt ?? pair.suggestedAt)?.toISOString() ?? ''
      for (const openid of [pair.userA.openid, pair.userB.openid]) {
        const poster = await this.notify.sendSubscribeMessage({
          openid,
          templateId: '',
          scene: 'match_poster',
          page: 'pages/match/index',
          data: {
            thing1: { value: '周三 Drop' },
            time2: { value: when.slice(0, 16) || '本周' },
            thing3: { value: '打开小程序查看匹配海报' },
          },
        })
        const suggestion = await this.notify.sendSubscribeMessage({
          openid,
          templateId: '',
          scene: 'date_suggestion',
          page: 'pages/confirm/index',
          data: {
            thing1: { value: '见面时间建议' },
            time2: { value: when.slice(0, 16) || '待确认' },
            thing3: { value: '确认或改期' },
          },
        })
        notifications.push(poster, suggestion)
      }
    }

    const entry = {
      at: new Date().toISOString(),
      source,
      phase: 'release' as const,
      intended,
      notes,
      notifyCount: notifications.length,
      stubbed: true,
    }
    await this.prisma.dropCycle.update({
      where: { id: cycle.id },
      data: { phase: 'released' },
    })
    await this.appendLog(cycle.id, entry)
    return { weekKey, cyclePhase: 'released' as const, notifications, ...entry }
  }

  private async appendLog(cycleId: string, entry: unknown) {
    const cycle = await this.prisma.dropCycle.findUniqueOrThrow({ where: { id: cycleId } })
    const prev = Array.isArray(cycle.log) ? cycle.log : []
    const next = JSON.parse(JSON.stringify([...prev, entry])) as Prisma.InputJsonValue
    await this.prisma.dropCycle.update({
      where: { id: cycleId },
      data: { log: next },
    })
  }
}
