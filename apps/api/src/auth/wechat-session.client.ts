import { createHash } from 'node:crypto'
import { Injectable, Logger, NotImplementedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/** Mini program login. https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html */
export const WECHAT_CODE2SESSION_URL = 'https://api.weixin.qq.com/sns/jscode2session'

export interface Code2SessionResult {
  openid: string
  unionid?: string
  sessionKey: string
  stub: boolean
  todo: string | null
}

@Injectable()
export class WechatSessionClient {
  private readonly logger = new Logger(WechatSessionClient.name)

  constructor(private readonly config: ConfigService) {}

  async exchange(code: string): Promise<Code2SessionResult> {
    const stubMode = this.config.get<string>('WECHAT_STUB', 'true') !== 'false'
    const appId = this.config.get<string>('WECHAT_APPID') ?? ''
    const secret = this.config.get<string>('WECHAT_APP_SECRET') ?? ''
    const todo =
      `TODO(wechat-code2session): GET ${WECHAT_CODE2SESSION_URL}` +
      '?appid={WECHAT_APPID}&secret={WECHAT_APP_SECRET}&js_code={code}&grant_type=authorization_code'

    if (stubMode || !appId || !secret) {
      if (!stubMode) {
        this.logger.warn('WECHAT_STUB=false but WECHAT_APPID or WECHAT_APP_SECRET is empty; staying on the stub')
      }
      const openid = code.startsWith('openid:')
        ? code.slice('openid:'.length)
        : `stub_${createHash('sha256').update(code).digest('hex').slice(0, 24)}`
      return {
        openid,
        sessionKey: 'stub-session-key',
        stub: true,
        todo,
      }
    }

    // Live exchange is intentionally not called in this skeleton.
    throw new NotImplementedException(todo)
  }
}
