import { Body, Controller, Post } from '@nestjs/common'
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto'
import { OtpService } from './otp.service'

@Controller('otp')
export class OtpController {
  constructor(private readonly otp: OtpService) {}

  @Post('send')
  send(@Body() body: SendOtpDto) {
    return this.otp.send(body.channel, body.target)
  }

  @Post('verify')
  verify(@Body() body: VerifyOtpDto) {
    return this.otp.verify(body.channel, body.target, body.code)
  }
}
