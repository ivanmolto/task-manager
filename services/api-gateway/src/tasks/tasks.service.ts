import {
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom, timeout, catchError } from "rxjs";
import { CreateTaskDto, UpdateTaskDto, GetTasksQueryDto } from "./dto";

@Injectable()
export class TasksService implements OnModuleInit {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>("TASK_SERVICE_HOST", "localhost"),
        port: this.configService.get<number>("TASK_SERVICE_PORT", 4002),
      },
    });
  }

  private async sendMessage<T>(
    pattern: { cmd: string },
    data: any,
  ): Promise<T> {
    try {
      return await firstValueFrom(
        this.client.send<T>(pattern, data).pipe(
          timeout(10000), // 10 second timeout
          catchError((error) => {
            console.error("Task service error:", error);
            if (error.name === "TimeoutError") {
              throw new HttpException(
                "Task service is not responding",
                HttpStatus.SERVICE_UNAVAILABLE,
              );
            }
            // Preserve the original error from the microservice
            if (error.status && error.message) {
              throw new HttpException(error.message, error.status);
            }
            throw new HttpException(
              error.message || "Task service error",
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to communicate with task service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    return this.sendMessage(
      { cmd: "create_task" },
      { ...createTaskDto, userId },
    );
  }

  async findAll(query: GetTasksQueryDto, userId: string) {
    return this.sendMessage({ cmd: "get_tasks" }, { ...query, userId });
  }

  async findOne(taskId: string, userId: string) {
    return this.sendMessage({ cmd: "get_task" }, { taskId, userId });
  }

  async update(taskId: string, updateTaskDto: UpdateTaskDto, userId: string) {
    return this.sendMessage(
      { cmd: "update_task" },
      { ...updateTaskDto, taskId, userId },
    );
  }

  async remove(taskId: string, userId: string) {
    return this.sendMessage({ cmd: "delete_task" }, { taskId, userId });
  }

  async toggleComplete(taskId: string, userId: string) {
    return this.sendMessage(
      { cmd: "toggle_task_complete" },
      { taskId, userId },
    );
  }

  async getStats(userId: string) {
    return this.sendMessage({ cmd: "get_task_stats" }, { userId });
  }
}
