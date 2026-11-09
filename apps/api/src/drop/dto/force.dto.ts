import { IsBoolean, IsOptional } from 'class-validator'

export class ForceDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean
}
