import { IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'

export class SubmitQuestionnaireDto {
  @IsString()
  @MinLength(1)
  displayName!: string

  @IsIn(['female', 'male', 'unspecified'])
  gender!: 'female' | 'male' | 'unspecified'

  @IsIn(['women', 'men', 'any'])
  lookingFor!: 'women' | 'men' | 'any'

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

  @IsArray()
  @IsString({ each: true })
  slots!: string[]
}
