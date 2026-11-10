import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { FANGSHAN_SCHOOLS, findSchool } from './catalog'

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return { area: '房山大学城', schools: FANGSHAN_SCHOOLS }
  }

  async setSchool(userId: string, schoolId: string) {
    const school = findSchool(schoolId)
    if (!school) {
      throw new BadRequestException('学校不在房山大学城名单里')
    }
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: { userId, schoolId: school.id, schoolName: school.name },
      update: { schoolId: school.id, schoolName: school.name },
    })
    return { schoolId: profile.schoolId, schoolName: profile.schoolName }
  }
}
