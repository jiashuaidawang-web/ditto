import { Module } from '@nestjs/common'
import { ChannelsModule } from '../channels/channels.module'
import { NotifyService } from './notify.service'

@Module({
  imports: [ChannelsModule],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
