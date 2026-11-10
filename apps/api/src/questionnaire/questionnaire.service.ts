import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { QUESTIONNAIRE, SLOT_PRESETS, normalizeInterests } from './catalog'
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
    const parsed = normalizeInterests(dto.interests, dto.specialties)
    if (!parsed.ok) throw new BadRequestException(parsed.message)
    const slots = dto.slots.map((id) => SLOT_PRESETS[id]).filter(Boolean)
    if (slots.length !== dto.slots.length || slots.length < 1) {
      throw new BadRequestException('至少选一段本周可约时间')
    }

    const preferences = {
      intent: dto.intent,
      lookingFor: [dto.lookingFor],
      interests: parsed.value.interests,
      specialties: parsed.value.specialties,
      extras: dto.extras ?? {},
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
