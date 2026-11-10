import { Body, Controller, Get, Headers, Post, Put, Query } from '@nestjs/common'
import { EventsService, type EventInput } from './events.service'

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post('events')
  record(@Headers('authorization') authorization: string | undefined, @Body() body: EventInput) {
    return this.events.record(authorization, body)
  }

  @Post('events/claim')
  claim(@Headers('authorization') authorization: string | undefined, @Body() body: { sessionId: string }) {
    return this.events.claim(authorization, body.sessionId)
  }

  @Get('events')
  list(@Headers('authorization') authorization: string | undefined, @Query('userId') userId: string) {
    return this.events.list(authorization, userId)
  }

  @Put('questionnaire/draft')
  saveDraft(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { sessionId: string; answers: Record<string, unknown> },
  ) {
    return this.events.saveDraft(authorization, body.sessionId, body.answers || {})
  }

  @Get('questionnaire/options')
  options(@Headers('authorization') authorization: string | undefined, @Query('userId') userId: string) {
    return this.events.options(authorization, userId)
  }
}
