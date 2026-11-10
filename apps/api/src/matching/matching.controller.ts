import { Controller, Get, UseGuards } from '@nestjs/common'
import { DevAdminGuard } from '../common/dev-admin.guard'
import { MatchingService } from './matching.service'

@Controller('matching')
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Get('preview')
  @UseGuards(DevAdminGuard)
  preview() {
    return this.matching.preview()
  }
}
