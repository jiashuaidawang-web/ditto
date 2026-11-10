import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { CurrentUser, type AuthUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto'
import { QuestionnaireService } from './questionnaire.service'

@Controller('questionnaire')
export class QuestionnaireController {
  constructor(private readonly questionnaire: QuestionnaireService) {}

  @Get()
  schema() {
    return this.questionnaire.schema()
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  submit(@CurrentUser() user: AuthUser, @Body() body: SubmitQuestionnaireDto) {
    return this.questionnaire.submit(user.userId, body)
  }
}
