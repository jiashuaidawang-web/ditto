import { IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'

export class SubmitQuestionnaireDto {
  @IsString()
  @MinLength(1)
  displayName!: string

  @IsIn(['female', 'male', 'nonbinary', 'unspecified'])
  gender!: 'female' | 'male' | 'nonbinary' | 'unspecified'

  @IsIn(['women', 'men', 'nonbinary', 'any'])
  lookingFor!: 'women' | 'men' | 'nonbinary' | 'any'

  @IsInt()
  @Min(1)
  @Max(4)
  grade!: number

  @IsIn(['life_partner', 'serious', 'casual', 'friends', 'unsure'])
  intent!: string

  /** English hobby ids in tap order, plus `custom:<text>` chips. */
  @IsArray()
  @IsString({ each: true })
  interests!: string[]

  /** Specialty picks keyed by hobby. Values are option ids or `other:<text>`. */
  @IsOptional()
  @IsObject()
  specialties?: Record<string, string[]>

  /** Later questionnaire frames. Stored as-is; not used by matching. */
  @IsOptional()
  @IsObject()
  extras?: Record<string, unknown>

  @IsArray()
  @IsString({ each: true })
  slots!: string[]
}
