import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsEnum,
  MinLength,
  MaxLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateTaskDto {
  @ApiProperty({
    example: "Complete project documentation",
    description: "Task title",
  })
  @IsString()
  @MinLength(1, { message: "Title is required" })
  @MaxLength(200, { message: "Title must not exceed 200 characters" })
  title: string;

  @ApiPropertyOptional({
    example: "Write comprehensive documentation for the API endpoints",
    description: "Task description",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: "Description must not exceed 2000 characters" })
  description?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: "Updated task title",
    description: "Task title",
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Title cannot be empty" })
  @MaxLength(200, { message: "Title must not exceed 200 characters" })
  title?: string;

  @ApiPropertyOptional({
    example: "Updated task description",
    description: "Task description",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: "Description must not exceed 2000 characters" })
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Task completion status",
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export enum TaskStatus {
  ALL = "all",
  COMPLETED = "completed",
  PENDING = "pending",
}

export enum SortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  COMPLETED = "completed",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export class GetTasksQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Page number",
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: "Items per page",
    default: 10,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: TaskStatus,
    description: "Filter by completion status",
    default: TaskStatus.ALL,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.ALL;

  @ApiPropertyOptional({
    example: "documentation",
    description: "Search keyword in title/description",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    enum: SortBy,
    description: "Sort field",
    default: SortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: "Sort direction",
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

// Response DTOs for Swagger
export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  completed: boolean;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}

export class PaginatedTasksResponseDto {
  @ApiProperty({ type: [TaskResponseDto] })
  data: TaskResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class TaskStatsResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  completed: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  completionRate: number;
}
