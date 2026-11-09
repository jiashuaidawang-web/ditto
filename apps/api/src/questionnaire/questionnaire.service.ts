import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { INTEREST_IDS, QUESTIONNAIRE, SLOT_PRESETS, firstBranchedHobby } from './catalog'
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto'

@Injectable()
export class QuestionnaireService {
  constructor(private readonly prisma: PrismaService) {}

  schema() {
    return QUESTIONNAIRE
  }

  async submit(userId: string, dto: SubmitQuestionnaireDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } })
    if (!profile?.schoolId) {
      throw new BadRequestException('先选择学校')
    }
    const allowedInterests = new Set<string>(INTEREST_IDS)
    const interests = [...new Set(dto.interests)]
    if (interests.length < 1 || interests.length > 5 || interests.some((item) => !allowedInterests.has(item))) {
      throw new BadRequestException('兴趣选 1 到 5 个')
    }
    const branchHobby = firstBranchedHobby(interests)
    const slots = dto.slots.map((id) => SLOT_PRESETS[id]).filter(Boolean)
    if (slots.length !== dto.slots.length || slots.length < 1) {
      throw new BadRequestException('至少选一段本周可约时间')
    }

    const preferences = {
      intent: dto.intent,
      lookingFor: [dto.lookingFor],
      interests,
      interestBranch: branchHobby ? { hobby: branchHobby, pending: true } : null,
      questionnaireComplete: true,
    }

    await this.prisma.$transaction([
      this.prisma.profile.update({
        where: { userId },
        data: {
          displayName: dto.displayName.trim(),
          gender: dto.gender,
          grade: dto.grade,
          preferences: preferences as Prisma.InputJsonValue,
        },
      }),
      this.prisma.availabilitySlot.deleteMany({ where: { userId } }),
      this.prisma.availabilitySlot.createMany({
        data: slots.map((slot) => ({ userId, ...slot })),
      }),
    ])
    return { questionnaireComplete: true, schoolId: profile.schoolId }
  }
}
