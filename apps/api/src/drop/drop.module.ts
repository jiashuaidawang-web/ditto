import { Module } from '@nestjs/common'
import { DevAdminGuard } from '../common/dev-admin.guard'
import { MatchingModule } from '../matching/matching.module'
import { NotifyModule } from '../notify/notify.module'
import { ReportsModule } from '../reports/reports.module'
import { DropController } from './drop.controller'
import { DropScheduler } from './drop.scheduler'
import { DropService } from './drop.service'

@Module({
  imports: [MatchingModule, NotifyModule, ReportsModule],
  controllers: [DropController],
  providers: [DropService, DropScheduler, DevAdminGuard],
})
export class DropModule {}
