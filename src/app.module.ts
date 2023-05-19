import { Module } from '@nestjs/common';
import { PrismaModule } from './prismaModule/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TasksModule,
    CronModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
