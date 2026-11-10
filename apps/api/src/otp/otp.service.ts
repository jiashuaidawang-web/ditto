import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AliyunSmsProvider } from '../channels/aliyun-sms.provider'
import { EmailStubProvider } from '../channels/email-stub.provider'
import { PrismaService } from '../prisma/prisma.service'
import { normalizeEmail, normalizePhone } from './otp.identity'

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_MS = 60 * 1000
const MAX_ATTEMPTS = 5

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly sms: AliyunSmsProvider,
    private readonly email: EmailStubProvider,
  ) {}

  async send(channel: 'sms' | 'email', rawTarget: string) {
    const target = this.normalize(channel, rawTarget)
    const recent = await this.prisma.otpChallenge.findFirst({
      where: { channel, target, createdAt: { gt: new Date(Date.now() - RESEND_MS) } },
      orderBy: { createdAt: 'desc' },
    })
    if (recent) {
      throw new HttpException('验证码刚发过，请稍后再试', 429)
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    await this.prisma.otpChallenge.create({
      data: {
        channel,
        target,
        codeHash: this.hash(target, code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    })

    const delivery =
      channel === 'sms'
        ? await this.sms.sendOtp(target, code)
        : this.email.send({
            to: target,
            subject: '不如见一面验证码',
            body: `你的验证码是 ${code}，10 分钟内有效。`,
            scene: 'otp',
          })

    const echo = this.config.get<string>('OTP_DEV_ECHO') === 'true'
    return {
      channel,
      target,
      provider: delivery.provider,
      accepted: delivery.accepted,
      stub: delivery.stub,
      expiresIn: OTP_TTL_MS / 1000,
      message: 'message' in delivery ? delivery.message : delivery.todo,
      ...(echo ? { devCode: code } : {}),
    }
  }

  async verify(channel: 'sms' | 'email', rawTarget: string, code: string) {
    const target = this.normalize(channel, rawTarget)
    const previewAny = this.config.get<string>('OTP_PREVIEW_ANY_CODE') !== 'false'
    if (previewAny && /^\d{6}$/.test(code.trim())) {
      return this.issue(channel, target)
    }
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { channel, target, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!challenge || challenge.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException('验证码不对或已过期')
    }
    const expected = Buffer.from(challenge.codeHash, 'hex')
    const actual = Buffer.from(this.hash(target, code.trim()), 'hex')
    const ok = expected.length === actual.length && timingSafeEqual(expected, actual)
    if (!ok) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      })
      throw new BadRequestException('验证码不对或已过期')
    }
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    })
    return this.issue(channel, target)
  }

  private async issue(channel: 'sms' | 'email', target: string) {
    const user = await this.upsertUser(channel, target)
    const expiresIn = Number(this.config.get<string>('JWT_EXPIRES_SECONDS') || 60 * 60 * 24 * 7)
    const accessToken = await this.jwt.signAsync({ sub: user.id, openid: user.openid ?? undefined }, { expiresIn })
    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        studentVerified: user.studentVerified,
      },
    }
  }

  private normalize(channel: 'sms' | 'email', rawTarget: string): string {
    const target = channel === 'sms' ? normalizePhone(rawTarget) : normalizeEmail(rawTarget)
    if (!target) {
      throw new BadRequestException(channel === 'sms' ? '请输入 11 位手机号' : '邮箱格式不对')
    }
    return target
  }

  private hash(target: string, code: string): string {
    const pepper = this.config.get<string>('OTP_PEPPER') || 'dev-only-change-me'
    return createHash('sha256').update(`${pepper}|${target}|${code}`).digest('hex')
  }

  private async upsertUser(channel: 'sms' | 'email', target: string) {
    const skip = this.config.get<string>('STUDENT_VERIFY_SKIP') === 'true'
    if (channel === 'sms') {
      const existing = await this.prisma.user.findUnique({ where: { phone: target } })
      if (!existing) {
        return this.prisma.user.create({
          data: { phone: target, phoneVerified: true, studentVerified: skip },
        })
      }
      return this.prisma.user.update({
        where: { id: existing.id },
        data: { phoneVerified: true, ...(skip ? { studentVerified: true } : {}) },
      })
    }
    const existing = await this.prisma.user.findUnique({ where: { email: target } })
    if (!existing) {
      return this.prisma.user.create({
        data: { email: target, emailVerified: true, studentVerified: skip },
      })
    }
    return this.prisma.user.update({
      where: { id: existing.id },
      data: { emailVerified: true, ...(skip ? { studentVerified: true } : {}) },
    })
  }
}
