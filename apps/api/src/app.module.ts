import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './auth/auth.module'
import { OtpModule } from './otp/otp.module'
import { QuestionnaireModule } from './questionnaire/questionnaire.module'
import { ReportsModule } from './reports/reports.module'
import { SchoolsModule } from './schools/schools.module'
import { AvailabilityModule } from './availability/availability.module'
import { DropModule } from './drop/drop.module'
import { HealthModule } from './health/health.module'
import { MatchesModule } from './matches/matches.module'
import { MatchingModule } from './matching/matching.module'
import { NotifyModule } from './notify/notify.module'
import { PrismaModule } from './prisma/prisma.module'
import { ProfilesModule } from './profiles/profiles.module'
import { StudentVerifyModule } from './student-verify/student-verify.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    OtpModule,
    SchoolsModule,
    QuestionnaireModule,
    StudentVerifyModule,
    ProfilesModule,
    AvailabilityModule,
    NotifyModule,
    MatchingModule,
    DropModule,
    MatchesModule,
    ReportsModule,
  ],
})
export class AppModule {}
