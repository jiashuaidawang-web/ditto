import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'

export class InterestBranchDto {
  @IsString()
  hobby!: string

  @IsString()
  style!: string

  @IsOptional()
  @IsString()
  detail?: string
}

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

  @IsArray()
  @IsString({ each: true })
  interests!: string[]

  @IsOptional()
  @IsString()
  branchHobby?: string

  @IsOptional()
  @IsString()
  branchStyle?: string

  @IsOptional()
  @IsString()
  branchDetail?: string

  @IsArray()
  @IsString({ each: true })
  slots!: string[]
}
