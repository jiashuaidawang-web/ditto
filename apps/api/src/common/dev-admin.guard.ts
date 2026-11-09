import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/** Skeleton admin check. Replace with real ops auth before any shared deployment. */
@Injectable()
export class DevAdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('DEV_ADMIN_TOKEN') || 'dev-admin'
    const got = context.switchToHttp().getRequest().headers['x-dev-token']
    if (got !== expected) {
      throw new UnauthorizedException('TODO(admin-auth): send header x-dev-token')
    }
    return true
  }
}
