import { Module } from '@nestjs/common'
import { AliyunSmsProvider } from './aliyun-sms.provider'
import { EmailStubProvider } from './email-stub.provider'

@Module({
  providers: [AliyunSmsProvider, EmailStubProvider],
  exports: [AliyunSmsProvider, EmailStubProvider],
})
export class ChannelsModule {}
