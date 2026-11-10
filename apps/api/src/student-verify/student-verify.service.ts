import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { isEduEmail, VERIFY_STRATEGIES, type VerifyStrategyName } from './strategies'

@Injectable()
export class StudentVerifyService {
  constructor(private readonly prisma: PrismaService) {}

  listStrategies() {
    return {
      strategies: Object.values(VERIFY_STRATEGIES).map((item) => ({
        name: item.name,
        status: 'todo' as const,
        todo: item.todo,
      })),
      note: 'MVP 只需打通其中一条。三条目前都是 stub，不会把 studentVerified 写成 true。',
    }
  }

  xuexin(userId: string, chsiCode: string) {
    return this.record(userId, 'xuexin', { chsiCode })
  }

  studentCard(userId: string, imageRef: string) {
    return this.record(userId, 'student_card_ocr', { imageRef })
  }

  eduEmail(userId: string, email: string) {
    if (!isEduEmail(email)) {
      throw new BadRequestException('MVP 只接受 .edu 或 .edu.cn 邮箱。这仍然不会完成验证。')
    }
    return this.record(userId, 'edu_email', { email })
  }

  private async record(userId: string, strategy: VerifyStrategyName, payload: Record<string, string>) {
    const todo = VERIFY_STRATEGIES[strategy].todo
    const row = await this.prisma.studentVerification.create({
      data: {
        userId,
        strategy,
        status: 'todo',
        payload,
        todo,
      },
      select: {
        id: true,
        strategy: true,
        status: true,
        todo: true,
        createdAt: true,
      },
    })
    return {
      ...row,
      verified: false,
    }
  }
}
