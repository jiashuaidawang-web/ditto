import { IsString, MinLength } from 'class-validator'

export class WechatLoginDto {
  /** wx.login code, or a dev code such as `dev-user` while WECHAT_STUB=true. */
  @IsString()
  @MinLength(1)
  code!: string
}
