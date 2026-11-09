import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL')
    if (!connectionString) {
      throw new Error('DATABASE_URL is required. Copy apps/api/.env.example to apps/api/.env')
    }
    super({
      adapter: new PrismaPg({ connectionString }),
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('postgres connected')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
