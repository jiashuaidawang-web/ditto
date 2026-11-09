import { Injectable } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  getMine(userId: string) {
    return this.prisma.profile.findUnique({ where: { userId } })
  }

  async upsertMine(userId: string, dto: UpdateProfileDto) {
    const data = {
      displayName: dto.displayName,
      gender: dto.gender,
      grade: dto.grade,
      major: dto.major,
      bio: dto.bio,
      schoolId: dto.schoolId,
      schoolName: dto.schoolName,
      preferences: dto.preferences as Prisma.InputJsonValue | undefined,
    }
    return this.prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })
  }
}
