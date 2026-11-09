import { Type } from 'class-transformer'
import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'

export class PreferencesDto {
  @IsOptional()
  @IsString()
  intent?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[]

  @IsOptional()
  @IsString()
  pace?: string
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  @IsString()
  gender?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  grade?: number

  @IsOptional()
  @IsString()
  major?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  schoolId?: string

  @IsOptional()
  @IsString()
  schoolName?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto
}
