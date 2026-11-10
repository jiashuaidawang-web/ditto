import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { DevAdminGuard } from '../common/dev-admin.guard'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { DropService } from './drop.service'
import { ForceDto } from './dto/force.dto'

@Controller('drop')
export class DropController {
  constructor(private readonly drop: DropService) {}

  @Get('current')
  @UseGuards(JwtAuthGuard)
  current() {
    return this.drop.currentPublic()
  }

  @Get('admin')
  @UseGuards(DevAdminGuard)
  admin() {
    return this.drop.currentAdmin()
  }

  @Post('cutoff')
  @UseGuards(DevAdminGuard)
  cutoff(@Body() body: ForceDto) {
    return this.drop.runCutoff('manual', body.force === true)
  }

  @Post('release')
  @UseGuards(DevAdminGuard)
  release() {
    return this.drop.runRelease('manual')
  }
}
