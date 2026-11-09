import { Injectable, Logger } from '@nestjs/common'

export interface EmailStubResult {
  provider: 'email-stub'
  accepted: false
  stub: true
  todo: string
}

/** Friday email channel. Logs the full payload and never reports a successful send. */
@Injectable()
export class EmailStubProvider {
  private readonly logger = new Logger(EmailStubProvider.name)

  send(input: { to: string; subject: string; body: string; scene: 'otp' | 'match' }): EmailStubResult {
    const todo = 'TODO(email): 邮箱通道周五只打日志，不接阿里云邮件推送或 Resend。'
    this.logger.log(
      JSON.stringify({
        provider: 'email-stub',
        accepted: false,
        stub: true,
        scene: input.scene,
        to: input.to,
        subject: input.subject,
        body: input.body,
        todo,
      }),
    )
    return { provider: 'email-stub', accepted: false, stub: true, todo }
  }
}
