import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { PrismaService } from "../prisma/prisma.service";
import {
  TaskWithUserDto,
  UpdateTaskWithUserDto,
  GetTasksWithUserDto,
  GetTaskByIdDto,
  DeleteTaskDto,
  ToggleCompleteDto,
  TaskStatus,
  SortBy,
} from "./dto";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: TaskWithUserDto) {
    const { userId, title, description } = createTaskDto;

    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        userId,
      },
    });

    return task;
  }

  async findAll(
    getTasksDto: GetTasksWithUserDto,
  ): Promise<PaginatedResponse<any>> {
    const {
      userId,
      page = 1,
      limit = 10,
      status,
      search,
      sortBy,
      sortOrder,
    } = getTasksDto;

    // Build where clause
    const where: any = { userId };

    // Filter by status
    if (status === TaskStatus.COMPLETED) {
      where.completed = true;
    } else if (status === TaskStatus.PENDING) {
      where.completed = false;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy === SortBy.COMPLETED) {
      orderBy.completed = sortOrder;
    } else if (sortBy === SortBy.UPDATED_AT) {
      orderBy.updatedAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Execute queries
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(getTaskByIdDto: GetTaskByIdDto) {
    const { taskId, userId } = getTaskByIdDto;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new RpcException({ message: "Task not found", status: 404 });
    }

    if (task.userId !== userId) {
      throw new RpcException({
        message: "You do not have permission to access this task",
        status: 403,
      });
    }

    return task;
  }

  async update(updateTaskDto: UpdateTaskWithUserDto) {
    const { taskId, userId, ...updateData } = updateTaskDto;

    // Check task exists and belongs to user
    const existingTask = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new RpcException({ message: "Task not found", status: 404 });
    }

    if (existingTask.userId !== userId) {
      throw new RpcException({
        message: "You do not have permission to update this task",
        status: 403,
      });
    }

    // Handle completion status change
    const data: any = { ...updateData };
    if (updateData.completed !== undefined) {
      data.completedAt = updateData.completed ? new Date() : null;
    }

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data,
    });

    return task;
  }

  async remove(deleteTaskDto: DeleteTaskDto) {
    const { taskId, userId } = deleteTaskDto;

    // Check task exists and belongs to user
    const existingTask = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new RpcException({ message: "Task not found", status: 404 });
    }

    if (existingTask.userId !== userId) {
      throw new RpcException({
        message: "You do not have permission to delete this task",
        status: 403,
      });
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true, message: "Task deleted successfully" };
  }

  async toggleComplete(toggleCompleteDto: ToggleCompleteDto) {
    const { taskId, userId } = toggleCompleteDto;

    // Check task exists and belongs to user
    const existingTask = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new RpcException({ message: "Task not found", status: 404 });
    }

    if (existingTask.userId !== userId) {
      throw new RpcException({
        message: "You do not have permission to update this task",
        status: 403,
      });
    }

    const newCompletedStatus = !existingTask.completed;

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        completed: newCompletedStatus,
        completedAt: newCompletedStatus ? new Date() : null,
      },
    });

    return task;
  }

  async getStats(userId: string) {
    const [total, completed, pending] = await Promise.all([
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({ where: { userId, completed: true } }),
      this.prisma.task.count({ where: { userId, completed: false } }),
    ]);

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}
