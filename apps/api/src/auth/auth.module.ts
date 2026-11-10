import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { WechatSessionClient } from './wechat-session.client'

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev-only-change-me',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, WechatSessionClient, JwtAuthGuard],
  exports: [JwtAuthGuard, AuthService],
})
export class AuthModule {}
