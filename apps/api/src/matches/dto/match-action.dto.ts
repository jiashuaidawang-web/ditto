import { IsBoolean, IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator'

export class RespondMatchDto {
  @IsIn(['accept', 'decline', 'reschedule'])
  action!: 'accept' | 'decline' | 'reschedule'

  @IsOptional()
  @IsISO8601()
  meetupAt?: string
}

export class FeedbackDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number

  @IsOptional()
  @IsBoolean()
  noShow?: boolean

  @IsOptional()
  @IsString()
  comment?: string
}
