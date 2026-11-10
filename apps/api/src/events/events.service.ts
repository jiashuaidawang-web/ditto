import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

export interface EventInput {
  sessionId: string
  page: string
  action: string
  payload?: Record<string, unknown>
  dwellMs?: number
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  userIdFrom(authorization?: string): string | null {
    const header = authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
    if (!token) return null
    try {
      const payload = this.jwt.verify<{ sub: string }>(token)
      return payload.sub || null
    } catch {
      return null
    }
  }

  async record(authorization: string | undefined, input: EventInput) {
    const userId = this.userIdFrom(authorization)
    return this.prisma.userEvent.create({
      data: {
        userId,
        sessionId: input.sessionId,
        page: input.page,
        action: input.action,
        payload: (input.payload ?? {}) as Prisma.InputJsonValue,
        dwellMs: input.dwellMs,
      },
    })
  }

  async claim(authorization: string | undefined, sessionId: string) {
    const userId = this.userIdFrom(authorization)
    if (!userId) throw new UnauthorizedException('missing bearer token')
    await this.prisma.userEvent.updateMany({
      where: { sessionId, userId: null },
      data: { userId },
    })
    await this.prisma.questionnaireDraft.updateMany({
      where: { sessionId, userId: null },
      data: { userId },
    })
    return { userId, sessionId }
  }

  async list(authorization: string | undefined, userId: string) {
    this.assertSelf(authorization, userId)
    return this.prisma.userEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async saveDraft(authorization: string | undefined, sessionId: string, answers: Record<string, unknown>) {
    const userId = this.userIdFrom(authorization)
    return this.prisma.questionnaireDraft.upsert({
      where: { sessionId },
      create: { sessionId, userId, answers: answers as Prisma.InputJsonValue },
      update: { userId: userId ?? undefined, answers: answers as Prisma.InputJsonValue },
    })
  }

  async options(authorization: string | undefined, userId: string) {
    this.assertSelf(authorization, userId)
    return this.prisma.questionnaireDraft.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
  }

  private assertSelf(authorization: string | undefined, userId: string) {
    const tokenUser = this.userIdFrom(authorization)
    if (!tokenUser || tokenUser !== userId) throw new UnauthorizedException('missing bearer token')
  }
}
