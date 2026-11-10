import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { dropInstants, previousWeekKey, shanghaiWeekKey, SHANGHAI_TZ } from '../common/shanghai-time'
import { MatchingService } from '../matching/matching.service'
import { NotifyService } from '../notify/notify.service'
import { PrismaService } from '../prisma/prisma.service'
import { interestList, oneLineReason, suggestionLabel } from '../reports/card-copy'
import { ReportsService } from '../reports/reports.service'
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
    private readonly reports: ReportsService,
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
    const profileByUser = new Map(users.map((user) => [user.id, user.profile]))
    for (const pair of result.pairs) {
      const suggestion = suggestMeetup(weekKey, slotsByUser.get(pair.userAId) ?? [], slotsByUser.get(pair.userBId) ?? [])
      const interestsA = interestList(profileByUser.get(pair.userAId)?.preferences)
      const interestsB = interestList(profileByUser.get(pair.userBId)?.preferences)
      await this.prisma.matchPair.create({
        data: {
          dropCycleId: cycle.id,
          userAId: pair.userAId,
          userBId: pair.userBId,
          schoolId: pair.schoolId,
          gradeGap: pair.gradeGap,
          reason: oneLineReason(pair.gradeGap, interestsA, interestsB),
          status: 'proposed',
          suggestedAt: suggestion.at,
          meetupAt: suggestion.at,
          suggestionNote: suggestionLabel(suggestion.at),
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
    let cycle = await this.prisma.dropCycle.findUnique({
      where: { weekKey },
      include: { _count: { select: { pairs: true } } },
    })
    const notes: string[] = []
    if (!cycle || cycle.phase === 'open' || cycle._count.pairs === 0) {
      notes.push(cycle?._count.pairs === 0 ? 'cycle has no pairs; running cutoff before release' : 'cutoff had not run; running cutoff before release')
      await this.runCutoff(source, true)
      cycle = await this.prisma.dropCycle.findUniqueOrThrow({
        where: { weekKey },
        include: { _count: { select: { pairs: true } } },
      })
    }

    const pairs = await this.prisma.matchPair.findMany({
      where: { dropCycleId: cycle.id, status: { notIn: ['declined', 'cancelled'] } },
      include: {
        userA: { select: { id: true, phone: true, email: true, profile: { select: { displayName: true } } } },
        userB: { select: { id: true, phone: true, email: true, profile: { select: { displayName: true } } } },
      },
    })

    const intended = [
      `Wednesday 19:00 ${SHANGHAI_TZ} Drop for ${weekKey}`,
      'send match summary + H5 deep link by Aliyun SMS when SMS_PROVIDER=aliyun and keys exist',
      'otherwise log a stub and keep accepted=false',
      'WeChat subscribe message stays TODO and is not sent',
    ]
    this.logger.log(JSON.stringify({ source, phase: 'release', weekKey, intended, notes }))

    const notifications = []
    for (const pair of pairs) {
      const summary = `${pair.reason}。${pair.suggestionNote || '校内咖啡走走'}`
      const people = [
        { self: pair.userA, peerName: pair.userB.profile?.displayName || 'TA' },
        { self: pair.userB, peerName: pair.userA.profile?.displayName || 'TA' },
      ]
      for (const person of people) {
        const token = await this.reports.ensureToken(pair.id, person.self.id)
        const url = `${this.reports.baseUrl().replace(/\/$/, '')}/m/${token}`
        const content = `和${person.peerName}见面。${summary}`
        if (person.self.phone) {
          const sms = await this.notify.sendMatchSms(person.self.phone, content, url)
          notifications.push({ userId: person.self.id, channel: 'sms', url, ...sms })
        } else if (person.self.email) {
          const email = this.notify.sendMatchEmailStub(person.self.email, content, url)
          notifications.push({ userId: person.self.id, channel: 'email', url, ...email })
        } else {
          this.logger.log(JSON.stringify({ accepted: false, stub: true, channel: 'none', userId: person.self.id, url, content }))
          notifications.push({ userId: person.self.id, channel: 'none', url, accepted: false, stub: true, provider: 'stub' })
        }
      }
    }

    const entry = {
      at: new Date().toISOString(),
      source,
      phase: 'release' as const,
      intended,
      notes,
      notifyCount: notifications.length,
      acceptedCount: notifications.filter((item) => item.accepted).length,
      stubbed: notifications.every((item) => item.stub),
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
