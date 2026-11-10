import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { SHANGHAI_TZ } from '../common/shanghai-time'
import { DropService } from './drop.service'

@Injectable()
export class DropScheduler {
  private readonly logger = new Logger(DropScheduler.name)

  constructor(private readonly drop: DropService) {}

  /** Tuesday 23:59 Asia/Shanghai. Signup closes and pairs are proposed. */
  @Cron('59 23 * * 2', { timeZone: SHANGHAI_TZ, name: 'tuesday-cutoff' })
  async tuesdayCutoff() {
    this.logger.log('cron tuesday cutoff')
    try {
      await this.drop.runCutoff('cron')
    } catch (error) {
      this.logger.error(`cutoff failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /** Wednesday 19:00 Asia/Shanghai. Push the match poster and date suggestion. */
  @Cron('0 19 * * 3', { timeZone: SHANGHAI_TZ, name: 'wednesday-drop' })
  async wednesdayDrop() {
    this.logger.log('cron wednesday drop')
    try {
      await this.drop.runRelease('cron')
    } catch (error) {
      this.logger.error(`release failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
