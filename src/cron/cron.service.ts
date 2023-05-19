import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { DEFAULT_CRON_PATTERN } from '../defaults';
import { PrismaService } from '../prismaModule/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  @Cron(process.env.CRON_PATTERN || DEFAULT_CRON_PATTERN)
  public async removeOutdatedData(): Promise<void> {
    const sessionTTLInMilliseconds =
      +this.configService.get('SESSION_TTL') * 1000;
    const currentTimeInMilliseconds = new Date().getTime();

    const deleteSessionsOlderThan = new Date(
      currentTimeInMilliseconds - sessionTTLInMilliseconds,
    );

    this.logger.log(
      'Deleting sessions older than ' + deleteSessionsOlderThan.toUTCString(),
    );

    const deletedSessions = await this.prisma.session.deleteMany({
      where: { created: { lte: deleteSessionsOlderThan } },
    });

    this.logger.log(
      `Deletion run complete: ${deletedSessions.count} session(s) affected.`,
    );
  }
}
