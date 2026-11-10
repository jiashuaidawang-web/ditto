import { IsIn, IsString, MinLength } from 'class-validator'

export class SendOtpDto {
  @IsIn(['sms', 'email'])
  channel!: 'sms' | 'email'

  @IsString()
  @MinLength(3)
  target!: string
}

export class VerifyOtpDto extends SendOtpDto {
  @IsString()
  @MinLength(4)
  code!: string
}
