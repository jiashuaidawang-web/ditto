import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { AuthService } from './auth.service'
import { WechatLoginDto } from './dto/wechat-login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('wechat/login')
  login(@Body() body: WechatLoginDto) {
    return this.auth.loginWithWechatCode(body.code)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.userId)
  }
}
