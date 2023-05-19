import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service';
import { PostTaskDto, PutTaskDto, TaskResponseDto } from './dto/tasks.dto';
import { v4 as uuid } from 'uuid';
import {
  DEFAULT_MAX_TASKS_COUNT,
  DEFAULT_MAX_TASKS_PER_SESSION,
} from '../defaults';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getTasks(
    sessionId: string,
    skip,
    take,
    query,
  ): Promise<TaskResponseDto[]> {
    return this.prisma.task.findMany({
      skip: skip,
      take: take,
      select: { id: true, name: true, description: true, completed: true },
      orderBy: { created: 'asc' },
      where: {
        sessionId: { equals: sessionId },
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
    });
  }

  async getTask(sessionId: string, taskId: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (task?.sessionId != sessionId) {
      throw new NotFoundException();
    }
    delete task.sessionId;
    delete task.created;

    return task;
  }

  async createTask(
    sessionId: string,
    taskDto: PostTaskDto,
  ): Promise<TaskResponseDto> {
    const currentTaskCount = await this.prisma.task.count();
    const allowedTaskCount =
      +this.configService.get('MAX_TASKS_COUNT') || DEFAULT_MAX_TASKS_COUNT;
    if (currentTaskCount >= allowedTaskCount) {
      throw new ForbiddenException();
    }

    const currentSessionTaskCount = await this.prisma.task.count({
      where: { sessionId: sessionId },
    });
    const allowedSessionTaskCount =
      +this.configService.get('MAX_TASKS_PER_SESSION') ||
      DEFAULT_MAX_TASKS_PER_SESSION;
    if (currentSessionTaskCount >= allowedSessionTaskCount) {
      throw new ForbiddenException();
    }

    const id: string = uuid();

    const task = await this.prisma.task.create({
      data: {
        id: id,
        name: taskDto.name,
        description: taskDto.description,
        sessionId: sessionId,
        completed: false,
      },
    });

    this.logger.log(
      `Task created. ${
        currentTaskCount + 1
      } out of a maximum of ${allowedTaskCount} tasks created.`,
    );
    delete task.sessionId;
    delete task.created;

    return task;
  }

  async deleteTask(sessionId: string, taskId: string) {
    const taskToDelete = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (taskToDelete?.sessionId != sessionId) {
      throw new NotFoundException();
    }

    try {
      await this.prisma.task.delete({
        where: { id: taskToDelete.id },
      });
      this.logger.log(`Task deleted`);
    } catch {
      throw new NotFoundException();
    }
  }

  async updateTask(sessionId: string, taskId: string, putTaskDto: PutTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (task?.sessionId != sessionId) {
      throw new NotFoundException();
    }

    const updatedTask = await this.prisma.task.update({
      select: { id: true, name: true, description: true, completed: true },
      where: { id: task.id },
      data: { ...putTaskDto },
    });

    return updatedTask;
  }
}
