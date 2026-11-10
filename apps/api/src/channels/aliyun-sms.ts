import { createHmac, randomUUID } from 'node:crypto'

export const DYSMS_ENDPOINT = 'https://dysmsapi.aliyuncs.com/'

/** Aliyun RPC percent-encoding. `~` stays unescaped; space is %20; `*` is %2A. */
export function percentEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

export function canonicalQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&')
}

/** HMAC-SHA1 signature for Dysmsapi RPC (SignatureVersion 1.0). */
export function signRpc(params: Record<string, string>, accessKeySecret: string, method = 'POST'): string {
  const stringToSign = `${method}&${percentEncode('/')}&${percentEncode(canonicalQuery(params))}`
  return createHmac('sha1', `${accessKeySecret}&`).update(stringToSign).digest('base64')
}

export function aliyunTimestamp(date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export interface SmsEnv {
  smsProvider?: string
  accessKeyId?: string
  accessKeySecret?: string
  signName?: string
  templateOtp?: string
  templateMatch?: string
}

export interface SmsPlan {
  mode: 'aliyun' | 'stub'
  /** Why this did not call Aliyun. Empty when mode is aliyun. */
  reason: string
  templateCode: string
  /** Match notice reused the OTP template. `code` then carries summary + url. */
  reusedOtpTemplate: boolean
  templateParams: Record<string, string>
}

export function planSms(
  env: SmsEnv,
  scene: 'otp' | 'match',
  input: { code?: string; content?: string; url?: string },
): SmsPlan {
  const requested = (env.smsProvider || 'stub').toLowerCase()
  const keysReady = Boolean(env.accessKeyId && env.accessKeySecret && env.signName)
  if (requested !== 'aliyun' || !keysReady) {
    const reason =
      requested !== 'aliyun'
        ? 'SMS_PROVIDER is stub'
        : 'Aliyun SMS keys missing (need ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET, ALIYUN_SMS_SIGN_NAME)'
    return {
      mode: 'stub',
      reason,
      templateCode: '',
      reusedOtpTemplate: false,
      templateParams: scene === 'otp' ? { code: input.code ?? '' } : { content: input.content ?? '', url: input.url ?? '' },
    }
  }

  if (scene === 'otp') {
    if (!env.templateOtp) {
      return {
        mode: 'aliyun',
        reason: 'ALIYUN_SMS_TEMPLATE_OTP is empty',
        templateCode: '',
        reusedOtpTemplate: false,
        templateParams: { code: input.code ?? '' },
      }
    }
    return {
      mode: 'aliyun',
      reason: '',
      templateCode: env.templateOtp,
      reusedOtpTemplate: false,
      templateParams: { code: input.code ?? '' },
    }
  }

  if (env.templateMatch) {
    return {
      mode: 'aliyun',
      reason: '',
      templateCode: env.templateMatch,
      reusedOtpTemplate: false,
      templateParams: { content: input.content ?? '', url: input.url ?? '' },
    }
  }
  if (env.templateOtp) {
    return {
      mode: 'aliyun',
      reason: 'ALIYUN_SMS_TEMPLATE_MATCH is empty; reusing OTP template variable code',
      templateCode: env.templateOtp,
      reusedOtpTemplate: true,
      templateParams: { code: `${input.content ?? ''} ${input.url ?? ''}`.trim() },
    }
  }
  return {
    mode: 'aliyun',
    reason: 'neither ALIYUN_SMS_TEMPLATE_MATCH nor ALIYUN_SMS_TEMPLATE_OTP is set',
    templateCode: '',
    reusedOtpTemplate: false,
    templateParams: { content: input.content ?? '', url: input.url ?? '' },
  }
}

export function interpretAliyunBody(body: unknown): { accepted: boolean; code: string; message: string; bizId: string } {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const code = String(record.Code ?? record.code ?? 'UNKNOWN')
  const message = String(record.Message ?? record.message ?? '')
  const bizId = String(record.BizId ?? record.bizId ?? '')
  return { accepted: code === 'OK', code, message, bizId }
}

export function buildSendSmsParams(input: {
  accessKeyId: string
  phone: string
  signName: string
  templateCode: string
  templateParams: Record<string, string>
  nonce?: string
  timestamp?: string
}): Record<string, string> {
  return {
    AccessKeyId: input.accessKeyId,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: input.phone,
    RegionId: 'cn-hangzhou',
    SignName: input.signName,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: input.nonce ?? randomUUID(),
    SignatureVersion: '1.0',
    TemplateCode: input.templateCode,
    TemplateParam: JSON.stringify(input.templateParams),
    Timestamp: input.timestamp ?? aliyunTimestamp(),
    Version: '2017-05-25',
  }
}
