import { Controller, Post, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Create a token for a new session',
  })
  @ApiCreatedResponse({
    description: 'Session successfully created',
    type: AuthResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Creation of sessions is currently forbidden',
  })
  @ApiTooManyRequestsResponse({
    description: 'You sent too many requests, the session cannot be created. Try again in a few seconds.'
  })
  @Post('')
  async createSession(): Promise<AuthResponseDto> {
    return this.authService.createSession();
  }
}
