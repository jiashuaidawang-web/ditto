import { Module } from '@nestjs/common'
import { ChannelsModule } from '../channels/channels.module'
import { OtpController } from './otp.controller'
import { OtpService } from './otp.service'

@Module({
  imports: [ChannelsModule],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
