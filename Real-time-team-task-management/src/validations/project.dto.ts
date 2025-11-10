import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateProjectDTO {
  @IsOptional()
  teamId?: string; // allow either

  @IsOptional()
  teamCode?: string;

  @IsNotEmpty()
  name!: string;

  @IsOptional()
  description?: string;
}

