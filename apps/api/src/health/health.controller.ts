import { Controller, Get } from '@nestjs/common'
import { SHANGHAI_TZ } from '../common/shanghai-time'

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'ditto-api',
      time: new Date().toISOString(),
      timezone: SHANGHAI_TZ,
    }
  }
}
