import { Module } from '@nestjs/common';

import { PrismaModule } from '../prismaModule/prisma.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [],
})
export class TasksModule {}
