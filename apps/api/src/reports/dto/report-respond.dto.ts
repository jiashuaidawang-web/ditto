import { IsIn, IsISO8601, IsOptional } from 'class-validator'

export class ReportRespondDto {
  @IsIn(['accept', 'decline', 'reschedule'])
  action!: 'accept' | 'decline' | 'reschedule'

  @IsOptional()
  @IsISO8601()
  meetupAt?: string

  @IsOptional()
  @IsIn(['sat_afternoon', 'sun_afternoon'])
  preset?: 'sat_afternoon' | 'sun_afternoon'
}
