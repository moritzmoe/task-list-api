import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostTaskDto, PutTaskDto, TaskResponseDto } from './dto/tasks.dto';
import { JwtAuthGuard } from '../guards/jwt.auth.guards';
import { TasksService } from './tasks.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  DEFAULT_GET_LIMIT,
  DEFAULT_GET_TTL,
  DEFAULT_POST_PUT_DELETE_LIMIT,
  DEFAULT_POST_PUT_DELETE_TTL,
} from '../defaults';

@ApiTags('Tasks')
@UseGuards(ThrottlerGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @ApiOperation({
    summary: 'Get all tasks',
    description: `Searching for tasks by name or description is possible using the query paramenter <code>query</code>.<br/>
    <br/>
    This endpoint is paginated using limit offset / skip take pagination.<br/>
    The default page size is 10 tasks. The maximum page size is 50 tasks. 
    `
  })
  @ApiUnauthorizedResponse({
    description: 'Token missing. Please provide a valid bearer token.',
  })
  @ApiOkResponse({
    description: 'A list of tasks associated to the active session.',
    type: [TaskResponseDto],
  })
  @ApiTooManyRequestsResponse({
    description:
      'You sent too many requests, the list of task cannot be retrieved right now. Try again in a few seconds.',
  })
  @ApiQuery({ name: 'take', required: false, description: 'How many tasks to load/take (limit).<br/>Default value: 10. Maximum value: 50'})
  @ApiQuery({ name: 'skip', required: false, description: 'How many tasks to skip (offset).<br/>Default value: 0'})
  @ApiQuery({ name: 'query', required: false, description: 'Search for a task by name or description'})
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle(
    +process.env.GET_LIMIT || DEFAULT_GET_LIMIT,
    +process.env.GET_TTL || DEFAULT_GET_TTL,
  )
  @Get('')
  async getTasks(
    @Request() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number = 10,
    @Query('query') query: string = '',
  ): Promise<TaskResponseDto[]> {
    if (take > 50) {
      take = 50;
    }
    return this.tasksService.getTasks(req.user.sessionId, skip, take, query);
  }

  @ApiOperation({
    summary: 'Get a task',
  })
  @ApiOkResponse({
    description: 'The requested task.',
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The task could not be found.',
  })
  @ApiTooManyRequestsResponse({
    description:
      'You sent too many requests, the task cannot be retrieved right now. Try again in a few seconds.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle(
    +process.env.GET_LIMIT || DEFAULT_GET_LIMIT,
    +process.env.GET_TTL || DEFAULT_GET_TTL,
  )
  @Get(':id')
  async getTask(
    @Request() req,
    @Param('id') taskId: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.getTask(req.user.sessionId, taskId);
  }

  @ApiOperation({
    summary: 'Create a new task',
  })
  @ApiCreatedResponse({
    description: 'Task successfully created.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request is not valid (Bad Request).',
  })
  @ApiForbiddenResponse({
    description: 'Creation of tasks is currently forbidden.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token missing. Please provide a valid bearer token.',
  })
  @ApiTooManyRequestsResponse({
    description:
      'You sent too many requests, the task cannot be created right now. Try again in a few seconds.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle(
    +process.env.POST_PUT_DELETE_LIMIT || DEFAULT_POST_PUT_DELETE_LIMIT,
    +process.env.POST_PUT_DELETE_TTL || DEFAULT_POST_PUT_DELETE_TTL,
  )
  @Post('')
  async createTask(
    @Request() req,
    @Body() postTaskDto: PostTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.createTask(req.user.sessionId, postTaskDto);
  }

  @ApiOperation({
    summary: 'Delete a task',
  })
  @ApiNoContentResponse({
    description: 'Deletion successful. No Content.',
  })
  @ApiNotFoundResponse({
    description: 'The task to be deleted could not be found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token missing. Please provide a valid bearer token.',
  })
  @ApiTooManyRequestsResponse({
    description:
      'You sent too many requests, the task cannot be deleted right now. Try again in a few seconds.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle(
    +process.env.POST_PUT_DELETE_LIMIT || DEFAULT_POST_PUT_DELETE_LIMIT,
    +process.env.POST_PUT_DELETE_TTL || DEFAULT_POST_PUT_DELETE_TTL,
  )
  @HttpCode(204)
  @Delete(':id')
  async deleteTask(@Request() req, @Param('id') taskId: string) {
    return this.tasksService.deleteTask(req.user.sessionId, taskId);
  }

  @ApiOperation({
    summary: 'Update a task',
  })
  @ApiOkResponse({
    description: 'The updated task.',
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The task to be updated could not be found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token missing. Please provide a valid bearer token.',
  })
  @ApiTooManyRequestsResponse({
    description:
      'You sent too many requests, the task cannot be updated right now. Try again in a few seconds.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle(
    +process.env.POST_PUT_DELETE_LIMIT || DEFAULT_POST_PUT_DELETE_LIMIT,
    +process.env.POST_PUT_DELETE_TTL || DEFAULT_POST_PUT_DELETE_TTL,
  )
  @Put(':id')
  async updateTask(
    @Request() req,
    @Param('id') taskId: string,
    @Body() putTaskDto: PutTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateTask(req.user.sessionId, taskId, putTaskDto);
  }
}
