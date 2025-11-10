import { IsNotEmpty, IsOptional, IsIn, IsDateString } from "class-validator";

export class CreateTaskDTO {
  @IsNotEmpty({ message: "Task title is required" })
  title!: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsIn(["todo", "in-progress", "review", "done"])
  status?: string;

  @IsOptional()
  @IsIn(["low", "medium", "high"])
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsNotEmpty({ message: "Project ID is required" })
  projectId!: string;

  @IsOptional()
  assignedTo?: string;
}

export class UpdateTaskDTO {
  @IsOptional() title?: string;
  @IsOptional() description?: string;
  @IsOptional() @IsIn(["todo", "in-progress", "review", "done"]) status?: string;
  @IsOptional() @IsIn(["low", "medium", "high"]) priority?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() assignedTo?: string;
}
