import { Module } from '@nestjs/common'
import { DevAdminGuard } from '../common/dev-admin.guard'
import { MatchingModule } from '../matching/matching.module'
import { NotifyModule } from '../notify/notify.module'
import { DropController } from './drop.controller'
import { DropScheduler } from './drop.scheduler'
import { DropService } from './drop.service'

@Module({
  imports: [MatchingModule, NotifyModule],
  controllers: [DropController],
  providers: [DropService, DropScheduler, DevAdminGuard],
})
export class DropModule {}
