import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { FeedbackDto, RespondMatchDto } from './dto/match-action.dto'

const peerSelect = {
  id: true,
  studentVerified: true,
  profile: {
    select: {
      displayName: true,
      schoolId: true,
      schoolName: true,
      grade: true,
      major: true,
    },
  },
} as const

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async mine(userId: string) {
    const pair = await this.prisma.matchPair.findFirst({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { select: peerSelect },
        userB: { select: peerSelect },
        dropCycle: { select: { weekKey: true, phase: true, releaseAt: true } },
      },
    })
    return pair
  }

  async respond(userId: string, matchId: string, dto: RespondMatchDto) {
    const pair = await this.mustParticipant(userId, matchId)
    const side = pair.userAId === userId ? 'A' : 'B'
    const other = side === 'A' ? pair.userBResponse : pair.userAResponse
    const data: {
      userAResponse?: string | null
      userBResponse?: string | null
      status?: 'proposed' | 'accepted' | 'reschedule_requested' | 'declined'
      meetupAt?: Date
    } = {}
    if (side === 'A') data.userAResponse = dto.action
    else data.userBResponse = dto.action

    if (dto.action === 'decline') {
      data.status = 'declined'
    } else if (dto.action === 'reschedule') {
      if (!dto.meetupAt) {
        throw new BadRequestException('meetupAt is required to reschedule')
      }
      data.status = 'reschedule_requested'
      data.meetupAt = new Date(dto.meetupAt)
      if (side === 'A') data.userBResponse = null
      else data.userAResponse = null
    } else if (other === 'accept' || other === 'reschedule') {
      data.status = 'accepted'
    } else {
      data.status = 'proposed'
    }

    return this.prisma.matchPair.update({ where: { id: matchId }, data })
  }

  async checkIn(userId: string, matchId: string) {
    const pair = await this.mustParticipant(userId, matchId)
    if (pair.status !== 'accepted' && pair.status !== 'checked_in') {
      throw new BadRequestException('check-in opens after both people accept')
    }
    const data =
      pair.userAId === userId
        ? { userACheckedIn: true, status: 'checked_in' as const }
        : { userBCheckedIn: true, status: 'checked_in' as const }
    return this.prisma.matchPair.update({ where: { id: matchId }, data })
  }

  async feedback(userId: string, matchId: string, dto: FeedbackDto) {
    const pair = await this.mustParticipant(userId, matchId)
    if (pair.status !== 'accepted' && pair.status !== 'checked_in' && pair.status !== 'feedback_done') {
      throw new BadRequestException('feedback opens after confirm')
    }
    const row = await this.prisma.feedback.upsert({
      where: { matchPairId_userId: { matchPairId: matchId, userId } },
      create: {
        matchPairId: matchId,
        userId,
        rating: dto.rating,
        noShow: dto.noShow ?? false,
        comment: dto.comment,
      },
      update: {
        rating: dto.rating,
        noShow: dto.noShow ?? false,
        comment: dto.comment,
      },
    })
    const count = await this.prisma.feedback.count({ where: { matchPairId: matchId } })
    if (count >= 2) {
      await this.prisma.matchPair.update({
        where: { id: matchId },
        data: { status: 'feedback_done' },
      })
    }
    return row
  }

  async risk(userId: string, matchId: string) {
    const pair = await this.prisma.matchPair.findUnique({
      where: { id: matchId },
      include: {
        userA: { select: { profile: { select: { schoolId: true, grade: true } } } },
        userB: { select: { profile: { select: { schoolId: true, grade: true } } } },
      },
    })
    if (!pair || (pair.userAId !== userId && pair.userBId !== userId)) {
      throw new NotFoundException('match not found')
    }
    const schoolA = pair.userA.profile?.schoolId ?? null
    const schoolB = pair.userB.profile?.schoolId ?? null
    const gradeA = pair.userA.profile?.grade ?? null
    const gradeB = pair.userB.profile?.grade ?? null
    const gradeGap = gradeA != null && gradeB != null ? Math.abs(gradeA - gradeB) : null
    const [noShowA, noShowB] = await Promise.all([
      this.prisma.feedback.count({ where: { userId: pair.userAId, noShow: true } }),
      this.prisma.feedback.count({ where: { userId: pair.userBId, noShow: true } }),
    ])
    return {
      matchId: pair.id,
      sameSchool: schoolA != null && schoolA === schoolB,
      gradeGap,
      gradeGapOk: gradeGap != null && gradeGap <= 2,
      noShowHints: [
        { userId: pair.userAId, noShowCount: noShowA },
        { userId: pair.userBId, noShowCount: noShowB },
      ],
    }
  }

  private async mustParticipant(userId: string, matchId: string) {
    const pair = await this.prisma.matchPair.findUnique({ where: { id: matchId } })
    if (!pair || (pair.userAId !== userId && pair.userBId !== userId)) {
      throw new NotFoundException('match not found')
    }
    return pair
  }
}
