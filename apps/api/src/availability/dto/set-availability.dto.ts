import { Type } from 'class-transformer'
import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'

export class SlotDto {
  /** 1 = Monday ... 7 = Sunday, Asia/Shanghai. */
  @IsInt()
  @Min(1)
  @Max(7)
  weekday!: number

  @IsInt()
  @Min(0)
  @Max(1439)
  startMin!: number

  @IsInt()
  @Min(1)
  @Max(1440)
  endMin!: number

  @IsOptional()
  @IsString()
  note?: string
}

export class SetAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots!: SlotDto[]
}
