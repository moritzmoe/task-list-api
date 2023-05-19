import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prismaModule/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import {
  DEFAULT_GET_LIMIT,
  DEFAULT_GET_TTL,
  DEFAULT_MAX_SESSION_COUNT,
  DEFAULT_MAX_TASKS_COUNT,
  DEFAULT_MAX_TASKS_PER_SESSION,
  DEFAULT_POST_PUT_DELETE_LIMIT,
  DEFAULT_POST_PUT_DELETE_TTL,
  DEFAULT_SESSION_POST_LIMIT,
  DEFAULT_SESSION_POST_TTL,
} from './defaults';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  if (configService.get('CORS_ENABLED') === 'true') {
    app.enableCors();
  }

  if (configService.get('API_DOCS_ENABLED') === 'true') {
    const options = new DocumentBuilder()
      .setTitle('Tasks API')
      .setDescription(
        `Hi there! 👋 <br />
        <br />
        This is a simple REST API for storing and managing task lists, designed to
        demonstrate the concepts of RESTful APIs.<br />
        <details>
          <summary><b>How does this API work?</b></summary>
          <div>
            <br />
            With this API, Tasks are stored as part of sessions.
            <b
              >Sessions expire after ${ configService.get('JWT_EXPIRATION_TIME') / 60 /
              60 }h</b
            >, all tasks saved for a session and the session itself are automatically 
            deleted after the session expires.<br />
            <br />
            To create a new session use the
            <code><b>POST</b><i> /api/auth</i></code> endpoint. You'll recevice a token
            that can be used to do <i>HTTP Bearer Authentication</i> to access the
            <code><i>/api/tasks</i></code> endpoints.<br />
            Paste your token in the "Authorize 🔓" dialog in the upper right corner to
            use the API in this UI.<br />
            <br />
            <details>
              <summary>Limits</summary>
              <div>
                <br />
                Each client can create
                <b
                  >${configService.get('SESSION_POST_LIMIT') ||
                  DEFAULT_SESSION_POST_LIMIT} new session(s) every
                  ${configService.get('SESSION_POST_TTL') || DEFAULT_SESSION_POST_TTL}
                  seconds.</b
                >
                <br />
                The <code>GET /api/tasks</code> endpoints can be called
                ${configService.get('GET_LIMIT') || DEFAULT_GET_LIMIT} times every
                ${configService.get('GET_TTL') || DEFAULT_GET_TTL} seconds. The
                <code>POST, PUT, DELETE /api/tasks</code> endpoints can be called
                ${configService.get('POST_PUT_DELETE_LIMIT') ||
                DEFAULT_POST_PUT_DELETE_LIMIT} times every
                ${configService.get('POST_PUT_DELETE_TTL') ||
                DEFAULT_POST_PUT_DELETE_TTL} seconds.
                <br />
                <br />
                A maximum of ${configService.get('MAX_SESSION_COUNT') ||
                DEFAULT_MAX_SESSION_COUNT} active sessions and
                ${configService.get('MAX_TASKS_COUNT') || DEFAULT_MAX_TASKS_COUNT} tasks
                in total can be managed using this API.
                <b>
                  ${configService.get('MAX_TASKS_PER_SESSION') ||
                  DEFAULT_MAX_TASKS_PER_SESSION} tasks can be stored per session.</b
                >
              </div>
            </details>
          </div>
        </details>        
        `,
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('api', app, document, {
      customCss:
        '.topbar {display: none} .renderedMarkdown div {font-size: 14px; line-height: 20px;} .renderedMarkdown summary {font-size: 14px}',
      customSiteTitle: 'Tasks REST API',
    });
  }

  await app.listen(3000);
}
bootstrap();
