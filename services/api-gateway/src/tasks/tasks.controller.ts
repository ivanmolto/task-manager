import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  GetTasksQueryDto,
  TaskResponseDto,
  PaginatedTasksResponseDto,
  TaskStatsResponseDto,
  TaskStatus,
  SortBy,
  SortOrder,
} from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "../common/decorators/current-user.decorator";

@ApiTags("tasks")
@Controller("tasks")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new task" })
  @ApiResponse({
    status: 201,
    description: "Task created successfully",
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.tasksService.create(createTaskDto, user.sub);
  }

  @Get()
  @ApiOperation({
    summary: "Get all tasks with pagination, filtering, and sorting",
  })
  @ApiResponse({
    status: 200,
    description: "List of tasks",
    type: PaginatedTasksResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "status", required: false, enum: TaskStatus })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "sortBy", required: false, enum: SortBy })
  @ApiQuery({ name: "sortOrder", required: false, enum: SortOrder })
  async findAll(
    @Query() query: GetTasksQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.tasksService.findAll(query, user.sub);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get task statistics" })
  @ApiResponse({
    status: 200,
    description: "Task statistics",
    type: TaskStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getStats(@CurrentUser() user: CurrentUserData) {
    return this.tasksService.getStats(user.sub);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a task by ID" })
  @ApiParam({ name: "id", description: "Task ID", type: String })
  @ApiResponse({
    status: 200,
    description: "Task details",
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.tasksService.findOne(id, user.sub);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a task" })
  @ApiParam({ name: "id", description: "Task ID", type: String })
  @ApiResponse({
    status: 200,
    description: "Task updated successfully",
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.tasksService.update(id, updateTaskDto, user.sub);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a task" })
  @ApiParam({ name: "id", description: "Task ID", type: String })
  @ApiResponse({ status: 200, description: "Task deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.tasksService.remove(id, user.sub);
  }

  @Patch(":id/complete")
  @ApiOperation({ summary: "Toggle task completion status" })
  @ApiParam({ name: "id", description: "Task ID", type: String })
  @ApiResponse({
    status: 200,
    description: "Task completion toggled",
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async toggleComplete(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.tasksService.toggleComplete(id, user.sub);
  }
}
