import { randomBytes } from 'node:crypto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { shanghaiWeekKey, weekdayInWeek } from '../common/shanghai-time'
import { MatchesService } from '../matches/matches.service'
import { PrismaService } from '../prisma/prisma.service'
import { gradeLabel, interestList, publicReportUrl } from './card-copy'
import { ReportRespondDto } from './dto/report-respond.dto'

const personSelect = {
  id: true,
  phone: true,
  email: true,
  profile: {
    select: {
      displayName: true,
      schoolId: true,
      schoolName: true,
      grade: true,
      preferences: true,
    },
  },
} as const

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly matches: MatchesService,
  ) {}

  baseUrl(): string {
    return this.config.get<string>('H5_PUBLIC_BASE_URL') || 'http://localhost:5173'
  }

  async ensureToken(matchPairId: string, userId: string): Promise<string> {
    const existing = await this.prisma.reportLink.findUnique({
      where: { matchPairId_userId: { matchPairId, userId } },
    })
    if (existing) return existing.token
    const token = randomBytes(18).toString('base64url')
    await this.prisma.reportLink.create({ data: { token, matchPairId, userId } })
    return token
  }

  async cardForUser(userId: string) {
    const link = await this.prisma.reportLink.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { matchPair: { include: { userA: { select: personSelect }, userB: { select: personSelect } } } },
    })
    if (!link) return null
    return this.toCard(link.matchPair, userId, link.token)
  }

  async cardByToken(token: string) {
    const link = await this.mustLink(token)
    return this.toCard(link.matchPair, link.userId, link.token)
  }

  async respondByToken(token: string, body: ReportRespondDto) {
    const link = await this.mustLink(token)
    let meetupAt = body.meetupAt
    if (body.action === 'reschedule' && !meetupAt) {
      const weekday = body.preset === 'sun_afternoon' ? 7 : 6
      meetupAt = weekdayInWeek(shanghaiWeekKey(), weekday, 15, 0).toISOString()
    }
    await this.matches.respond(link.userId, link.matchPairId, { action: body.action, meetupAt })
    return this.cardByToken(token)
  }

  async status(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { profile: { select: { schoolId: true, preferences: true } } },
    })
    const preferences = user.profile?.preferences
    const questionnaireComplete =
      !!preferences &&
      typeof preferences === 'object' &&
      !Array.isArray(preferences) &&
      (preferences as { questionnaireComplete?: boolean }).questionnaireComplete === true
    const card = await this.cardForUser(userId)
    let phase = 'needs_school'
    if (!user.profile?.schoolId) phase = 'needs_school'
    else if (!questionnaireComplete) phase = 'needs_questionnaire'
    else if (!card) phase = 'waiting'
    else if (card.status === 'accepted' || card.status === 'checked_in' || card.status === 'feedback_done') phase = 'confirmed'
    else phase = 'matched'
    return {
      phase,
      schoolId: user.profile?.schoolId ?? null,
      questionnaireComplete,
      reportToken: card?.token ?? null,
      matchStatus: card?.status ?? null,
    }
  }

  private async mustLink(token: string) {
    const link = await this.prisma.reportLink.findUnique({
      where: { token },
      include: { matchPair: { include: { userA: { select: personSelect }, userB: { select: personSelect } } } },
    })
    if (!link) throw new NotFoundException('报告不存在或已失效')
    return link
  }

  private toCard(
    pair: {
      id: string
      status: string
      reason: string
      suggestionNote: string | null
      meetupAt: Date | null
      suggestedAt: Date | null
      userAId: string
      userBId: string
      userA: Person
      userB: Person
    },
    userId: string,
    token: string,
  ) {
    const you = pair.userAId === userId ? pair.userA : pair.userB
    const peer = pair.userAId === userId ? pair.userB : pair.userA
    const url = publicReportUrl(this.baseUrl(), token)
    return {
      token,
      url,
      brand: '不如见一面' as const,
      kicker: '周三 Drop',
      youName: you.profile?.displayName || '你',
      peerName: peer.profile?.displayName || 'TA',
      schoolName: peer.profile?.schoolName || '同校',
      gradeLabel: gradeLabel(peer.profile?.grade),
      reason: pair.reason,
      suggestion: pair.suggestionNote || '校内咖啡走走',
      meetupAt: (pair.meetupAt ?? pair.suggestedAt)?.toISOString() ?? null,
      status: pair.status,
      matchId: pair.id,
      sharedInterests: shared(you, peer),
      map: { ready: false as const, label: '校内咖啡馆', todo: 'TODO(map): 地图选点 SDK 未接入' },
      face: { ready: false as const, required: false as const, todo: 'TODO(face): 人脸核身不在周五范围' },
    }
  }
}

interface Person {
  id: string
  profile: {
    displayName: string | null
    schoolName: string | null
    grade: number | null
    preferences: unknown
  } | null
}

function shared(you: Person, peer: Person): string[] {
  const mine = interestList(you.profile?.preferences)
  const theirs = new Set(interestList(peer.profile?.preferences))
  return mine.filter((item) => theirs.has(item))
}
