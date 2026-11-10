import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { FeedbackDto, RespondMatchDto } from './dto/match-action.dto'
import { MatchesService } from './matches.service'

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.matches.mine(user.userId)
  }

  @Get(':id/risk')
  risk(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.matches.risk(user.userId, id)
  }

  @Post(':id/respond')
  respond(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: RespondMatchDto) {
    return this.matches.respond(user.userId, id, body)
  }

  @Post(':id/check-in')
  checkIn(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.matches.checkIn(user.userId, id)
  }

  @Post(':id/feedback')
  feedback(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: FeedbackDto) {
    return this.matches.feedback(user.userId, id, body)
  }
}
