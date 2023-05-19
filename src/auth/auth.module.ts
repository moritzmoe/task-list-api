import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prismaModule/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { DEFAULT_SESSION_POST_LIMIT, DEFAULT_SESSION_POST_TTL } from '../defaults';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.getOrThrow('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl:
          +configService.get('SESSION_POST_TTL') ||
          DEFAULT_SESSION_POST_TTL,
        limit:
          +configService.get('SESSION_POST_LIMIT') ||
          DEFAULT_SESSION_POST_LIMIT,
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
