import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { WechatSessionClient } from './wechat-session.client'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly wechat: WechatSessionClient,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    if (!config.get<string>('JWT_SECRET') || config.get<string>('JWT_SECRET') === 'dev-only-change-me') {
      this.logger.warn('JWT_SECRET is the dev placeholder. Do not use it outside local development.')
    }
  }

  async loginWithWechatCode(code: string) {
    const session = await this.wechat.exchange(code)
    const user = await this.prisma.user.upsert({
      where: { openid: session.openid },
      create: {
        openid: session.openid,
        unionid: session.unionid,
        sessionKey: session.sessionKey,
      },
      update: {
        unionid: session.unionid,
        sessionKey: session.sessionKey,
      },
    })
    const expiresIn = Number(process.env.JWT_EXPIRES_SECONDS || 60 * 60 * 24 * 7)
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, openid: user.openid },
      { expiresIn },
    )
    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn,
      stub: session.stub,
      todo: session.todo,
      user: {
        id: user.id,
        openid: user.openid,
        studentVerified: user.studentVerified,
      },
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        openid: true,
        studentVerified: true,
        nickname: true,
        createdAt: true,
      },
    })
    return user
  }
}
