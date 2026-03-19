import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { TasksService } from "./tasks.service";
import {
  TaskWithUserDto,
  UpdateTaskWithUserDto,
  GetTasksWithUserDto,
  GetTaskByIdDto,
  DeleteTaskDto,
  ToggleCompleteDto,
} from "./dto";

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern({ cmd: "create_task" })
  async create(@Payload() createTaskDto: TaskWithUserDto) {
    return this.tasksService.create(createTaskDto);
  }

  @MessagePattern({ cmd: "get_tasks" })
  async findAll(@Payload() getTasksDto: GetTasksWithUserDto) {
    return this.tasksService.findAll(getTasksDto);
  }

  @MessagePattern({ cmd: "get_task" })
  async findOne(@Payload() getTaskByIdDto: GetTaskByIdDto) {
    return this.tasksService.findOne(getTaskByIdDto);
  }

  @MessagePattern({ cmd: "update_task" })
  async update(@Payload() updateTaskDto: UpdateTaskWithUserDto) {
    return this.tasksService.update(updateTaskDto);
  }

  @MessagePattern({ cmd: "delete_task" })
  async remove(@Payload() deleteTaskDto: DeleteTaskDto) {
    return this.tasksService.remove(deleteTaskDto);
  }

  @MessagePattern({ cmd: "toggle_task_complete" })
  async toggleComplete(@Payload() toggleCompleteDto: ToggleCompleteDto) {
    return this.tasksService.toggleComplete(toggleCompleteDto);
  }

  @MessagePattern({ cmd: "get_task_stats" })
  async getStats(@Payload() data: { userId: string }) {
    return this.tasksService.getStats(data.userId);
  }
}
