import { IsEmail, IsString, MinLength } from 'class-validator'

export class XuexinVerifyDto {
  /** 学信网在线验证码 */
  @IsString()
  @MinLength(4)
  chsiCode!: string
}

export class StudentCardVerifyDto {
  /** Uploaded file id or temporary URL. OCR is not called. */
  @IsString()
  @MinLength(1)
  imageRef!: string
}

export class EduEmailVerifyDto {
  @IsEmail()
  email!: string
}
