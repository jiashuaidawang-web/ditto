import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NotifyResult, SubscribeMessage } from './notify.types'

/**
 * WeChat mini program 订阅消息.
 * https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
 */
export const WECHAT_SUBSCRIBE_SEND_URL = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send'

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name)

  constructor(private readonly config: ConfigService) {}

  /**
   * Logs the payload that Wednesday Drop would send. Does not call WeChat.
   * Needs a user subscription (wx.requestSubscribeMessage) before a live send will succeed.
   */
  async sendSubscribeMessage(message: SubscribeMessage): Promise<NotifyResult> {
    const todo =
      `TODO(wechat-subscribe-message): POST ${WECHAT_SUBSCRIBE_SEND_URL} ` +
      'with client_credential access_token. Template id comes from WECHAT_TEMPLATE_MATCH_POSTER. ' +
      'This is 订阅消息, not iMessage and not the legacy 公众号模板消息.'
    const templateId = message.templateId || this.config.get<string>('WECHAT_TEMPLATE_MATCH_POSTER') || 'TODO_TEMPLATE_ID'
    this.logger.log(
      JSON.stringify({
        intent: 'send subscribe message',
        scene: message.scene,
        touser: message.openid,
        templateId,
        page: message.page ?? 'pages/match/index',
        data: message.data,
        miniprogramState: 'developer',
        todo,
      }),
    )
    return {
      stub: true,
      accepted: false,
      scene: message.scene,
      openid: message.openid,
      templateId,
      todo,
    }
  }
}
