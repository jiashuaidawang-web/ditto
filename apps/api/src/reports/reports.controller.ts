import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { ReportRespondDto } from './dto/report-respond.dto'
import { ReportsService } from './reports.service'

@Controller()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('me/status')
  @UseGuards(JwtAuthGuard)
  status(@CurrentUser() user: AuthUser) {
    return this.reports.status(user.userId)
  }

  @Get('reports/me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.reports.cardForUser(user.userId)
  }

  @Get('reports/:token')
  byToken(@Param('token') token: string) {
    return this.reports.cardByToken(token)
  }

  @Post('reports/:token/respond')
  respond(@Param('token') token: string, @Body() body: ReportRespondDto) {
    return this.reports.respondByToken(token, body)
  }
}
