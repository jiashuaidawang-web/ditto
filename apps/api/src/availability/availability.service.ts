import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SetAvailabilityDto } from './dto/set-availability.dto'

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.availabilitySlot.findMany({
      where: { userId },
      orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }],
    })
  }

  async replace(userId: string, dto: SetAvailabilityDto) {
    for (const slot of dto.slots) {
      if (slot.endMin <= slot.startMin) {
        throw new BadRequestException('endMin must be greater than startMin')
      }
    }
    await this.prisma.$transaction([
      this.prisma.availabilitySlot.deleteMany({ where: { userId } }),
      this.prisma.availabilitySlot.createMany({
        data: dto.slots.map((slot) => ({
          userId,
          weekday: slot.weekday,
          startMin: slot.startMin,
          endMin: slot.endMin,
          note: slot.note,
        })),
      }),
    ])
    return this.list(userId)
  }
}
