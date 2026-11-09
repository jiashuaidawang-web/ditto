import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { IsString, MinLength } from 'class-validator'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { SchoolsService } from './schools.service'

class SetSchoolDto {
  @IsString()
  @MinLength(2)
  schoolId!: string
}

@Controller()
export class SchoolsController {
  constructor(private readonly schools: SchoolsService) {}

  @Get('schools')
  list() {
    return this.schools.list()
  }

  @Put('me/school')
  @UseGuards(JwtAuthGuard)
  setSchool(@CurrentUser() user: AuthUser, @Body() body: SetSchoolDto) {
    return this.schools.setSchool(user.userId, body.schoolId)
  }
}
