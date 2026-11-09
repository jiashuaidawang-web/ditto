import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DYSMS_ENDPOINT,
  buildSendSmsParams,
  interpretAliyunBody,
  planSms,
  signRpc,
  type SmsEnv,
  type SmsPlan,
} from './aliyun-sms'

export interface SmsSendResult {
  provider: 'aliyun' | 'stub'
  accepted: boolean
  stub: boolean
  templateCode: string
  reusedOtpTemplate: boolean
  templateParams: Record<string, string>
  code?: string
  message: string
  bizId?: string
}

@Injectable()
export class AliyunSmsProvider {
  private readonly logger = new Logger(AliyunSmsProvider.name)
  private readonly fetchImpl: typeof fetch = fetch

  constructor(private readonly config: ConfigService) {}

  /** Phone OTP. Template variable: `code`. */
  sendOtp(phone: string, code: string): Promise<SmsSendResult> {
    return this.dispatch('otp', phone, { code })
  }

  /**
   * Match poster. Template variables: `content`, `url`.
   * If ALIYUN_SMS_TEMPLATE_MATCH is empty, the OTP template is reused and both
   * values are stuffed into `code` (often rejected by numeric OTP templates).
   */
  sendMatch(phone: string, content: string, url: string): Promise<SmsSendResult> {
    return this.dispatch('match', phone, { content, url })
  }

  private env(): SmsEnv {
    return {
      smsProvider: this.config.get<string>('SMS_PROVIDER') || 'stub',
      accessKeyId: this.config.get<string>('ALIYUN_ACCESS_KEY_ID') || '',
      accessKeySecret: this.config.get<string>('ALIYUN_ACCESS_KEY_SECRET') || '',
      signName: this.config.get<string>('ALIYUN_SMS_SIGN_NAME') || '',
      templateOtp: this.config.get<string>('ALIYUN_SMS_TEMPLATE_OTP') || '',
      templateMatch: this.config.get<string>('ALIYUN_SMS_TEMPLATE_MATCH') || '',
    }
  }

  private async dispatch(
    scene: 'otp' | 'match',
    phone: string,
    input: { code?: string; content?: string; url?: string },
  ): Promise<SmsSendResult> {
    const env = this.env()
    const plan = planSms(env, scene, input)
    if (plan.mode === 'stub' || !plan.templateCode) {
      const message = plan.reason || 'SMS was not sent'
      this.logStub(scene, phone, plan, message)
      return {
        provider: 'stub',
        accepted: false,
        stub: true,
        templateCode: plan.templateCode,
        reusedOtpTemplate: plan.reusedOtpTemplate,
        templateParams: plan.templateParams,
        message,
      }
    }

    const params = buildSendSmsParams({
      accessKeyId: env.accessKeyId || '',
      phone,
      signName: env.signName || '',
      templateCode: plan.templateCode,
      templateParams: plan.templateParams,
    })
    const signature = signRpc(params, env.accessKeySecret || '')
    const body = new URLSearchParams({ ...params, Signature: signature })
    try {
      const response = await this.fetchImpl(DYSMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      const payload: unknown = await response.json().catch(() => ({}))
      const interpreted = interpretAliyunBody(payload)
      this.logger.log(
        JSON.stringify({
          provider: 'aliyun',
          scene,
          phone,
          templateCode: plan.templateCode,
          reusedOtpTemplate: plan.reusedOtpTemplate,
          httpStatus: response.status,
          accepted: interpreted.accepted,
          code: interpreted.code,
          bizId: interpreted.bizId,
          message: interpreted.message,
        }),
      )
      return {
        provider: 'aliyun',
        accepted: interpreted.accepted,
        stub: false,
        templateCode: plan.templateCode,
        reusedOtpTemplate: plan.reusedOtpTemplate,
        templateParams: plan.templateParams,
        code: interpreted.code,
        message: interpreted.message,
        bizId: interpreted.bizId,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(JSON.stringify({ provider: 'aliyun', scene, phone, accepted: false, message }))
      return {
        provider: 'aliyun',
        accepted: false,
        stub: false,
        templateCode: plan.templateCode,
        reusedOtpTemplate: plan.reusedOtpTemplate,
        templateParams: plan.templateParams,
        message,
      }
    }
  }

  private logStub(scene: 'otp' | 'match', phone: string, plan: SmsPlan, message: string) {
    this.logger.log(
      JSON.stringify({
        provider: 'stub',
        accepted: false,
        stub: true,
        scene,
        phone,
        message,
        templateCode: plan.templateCode,
        reusedOtpTemplate: plan.reusedOtpTemplate,
        templateParams: plan.templateParams,
      }),
    )
  }
}
