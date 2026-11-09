import { Module } from '@nestjs/common'
import { StudentVerifyController } from './student-verify.controller'
import { StudentVerifyService } from './student-verify.service'

@Module({
  controllers: [StudentVerifyController],
  providers: [StudentVerifyService],
})
export class StudentVerifyModule {}
