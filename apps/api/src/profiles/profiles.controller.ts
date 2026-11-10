import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { ProfilesService } from './profiles.service'

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.profiles.getMine(user.userId)
  }

  @Put('me')
  save(@CurrentUser() user: AuthUser, @Body() body: UpdateProfileDto) {
    return this.profiles.upsertMine(user.userId, body)
  }
}
