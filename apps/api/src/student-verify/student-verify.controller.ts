import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { EduEmailVerifyDto, StudentCardVerifyDto, XuexinVerifyDto } from './dto/verify.dto'
import { StudentVerifyService } from './student-verify.service'

@Controller('student-verify')
@UseGuards(JwtAuthGuard)
export class StudentVerifyController {
  constructor(private readonly verify: StudentVerifyService) {}

  @Get('strategies')
  strategies() {
    return this.verify.listStrategies()
  }

  @Post('xuexin')
  xuexin(@CurrentUser() user: AuthUser, @Body() body: XuexinVerifyDto) {
    return this.verify.xuexin(user.userId, body.chsiCode)
  }

  @Post('student-card')
  studentCard(@CurrentUser() user: AuthUser, @Body() body: StudentCardVerifyDto) {
    return this.verify.studentCard(user.userId, body.imageRef)
  }

  @Post('edu-email')
  eduEmail(@CurrentUser() user: AuthUser, @Body() body: EduEmailVerifyDto) {
    return this.verify.eduEmail(user.userId, body.email)
  }
}
