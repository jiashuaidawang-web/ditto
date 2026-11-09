import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthUser } from './current-user.decorator'

interface TokenPayload {
  sub: string
  openid: string
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const header = String(request.headers.authorization ?? '')
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
    if (!token) {
      throw new UnauthorizedException('missing bearer token')
    }
    try {
      const payload = this.jwt.verify<TokenPayload>(token)
      const user: AuthUser = { userId: payload.sub, openid: payload.openid }
      request.user = user
      return true
    } catch {
      throw new UnauthorizedException('invalid bearer token')
    }
  }
}
