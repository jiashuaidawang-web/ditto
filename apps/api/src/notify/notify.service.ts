import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AliyunSmsProvider, type SmsSendResult } from '../channels/aliyun-sms.provider'
import { EmailStubProvider, type EmailStubResult } from '../channels/email-stub.provider'
import { NotifyResult, SubscribeMessage } from './notify.types'

/**
 * WeChat mini program 订阅消息.
 * https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
 */
export const WECHAT_SUBSCRIBE_SEND_URL = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send'

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly sms: AliyunSmsProvider,
    private readonly email: EmailStubProvider,
  ) {}

  /**
   * Friday match notice. Aliyun SMS when SMS_PROVIDER=aliyun and keys exist.
   * Otherwise a stub log with accepted: false. Does not pretend the text was delivered.
   */
  sendMatchSms(phone: string, content: string, url: string): Promise<SmsSendResult> {
    return this.sms.sendMatch(phone, content, url)
  }

  /** Email is not a Friday delivery channel. The log includes the same deep link. */
  sendMatchEmailStub(to: string, content: string, url: string): EmailStubResult {
    return this.email.send({
      to,
      subject: '不如见一面 · 你的本周见面方案',
      body: `${content}\n打开 ${url}`,
      scene: 'match',
    })
  }

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
