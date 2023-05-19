import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prismaModule/prisma.module';
import { CronService } from './cron.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  providers: [CronService],
  controllers: [],
  exports: [],
})
export class CronModule {}
