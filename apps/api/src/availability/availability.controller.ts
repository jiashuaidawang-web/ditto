import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { AvailabilityService } from './availability.service'
import { SetAvailabilityDto } from './dto/set-availability.dto'

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.availability.list(user.userId)
  }

  @Put()
  replace(@CurrentUser() user: AuthUser, @Body() body: SetAvailabilityDto) {
    return this.availability.replace(user.userId, body)
  }
}
