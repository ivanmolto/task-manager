import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsEnum,
  MinLength,
  MaxLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: "Title is required" })
  @MaxLength(200, { message: "Title must not exceed 200 characters" })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: "Description must not exceed 2000 characters" })
  description?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Title cannot be empty" })
  @MaxLength(200, { message: "Title must not exceed 200 characters" })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: "Description must not exceed 2000 characters" })
  description?: string;

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

export class GetTasksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.ALL;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class TaskIdDto {
  @IsUUID("4", { message: "Invalid task ID" })
  id: string;
}

export class TaskWithUserDto extends CreateTaskDto {
  @IsUUID("4")
  userId: string;
}

export class UpdateTaskWithUserDto extends UpdateTaskDto {
  @IsUUID("4")
  userId: string;

  @IsUUID("4")
  taskId: string;
}

export class GetTasksWithUserDto extends GetTasksDto {
  @IsUUID("4")
  userId: string;
}

export class GetTaskByIdDto {
  @IsUUID("4")
  taskId: string;

  @IsUUID("4")
  userId: string;
}

export class DeleteTaskDto {
  @IsUUID("4")
  taskId: string;

  @IsUUID("4")
  userId: string;
}

export class ToggleCompleteDto {
  @IsUUID("4")
  taskId: string;

  @IsUUID("4")
  userId: string;
}
