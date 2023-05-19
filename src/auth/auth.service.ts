import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { AuthResponseDto } from './dto/auth.dto';
import { PrismaService } from '../prismaModule/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { DEFAULT_MAX_SESSION_COUNT } from '../defaults';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createSession(): Promise<AuthResponseDto> {
    const currentSessionCount = await this.prisma.session.count();
    const allowedSessionCount =
      +this.configService.get('MAX_SESSION_COUNT') || DEFAULT_MAX_SESSION_COUNT;

    if (currentSessionCount >= allowedSessionCount) {
      throw new ForbiddenException();
    }

    const id: string = uuid();

    const createdSession = await this.prisma.session.create({
      data: { id: id },
    });

    this.logger.log(
      `Session created. ${
        currentSessionCount + 1
      } out of a maximum of ${allowedSessionCount} sessions created.`,
    );

    const payload = { sub: createdSession.id };
    const token = this.jwtService.sign(payload);

    return {
      sessionId: createdSession.id,
      token: token,
    };
  }
}
