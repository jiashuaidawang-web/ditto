import { Module } from '@nestjs/common'
import { DevAdminGuard } from '../common/dev-admin.guard'
import { MatchingController } from './matching.controller'
import { MatchingService } from './matching.service'

@Module({
  controllers: [MatchingController],
  providers: [MatchingService, DevAdminGuard],
  exports: [MatchingService],
})
export class MatchingModule {}
