import { IsEmail, IsString, MinLength, IsIn } from "class-validator";

export class RegisterDTO {
  @IsString({ message: "Name must be a string" })
  name!: string;

  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password!: string;

  @IsIn(["admin", "member"], { message: "Role must be either 'admin' or 'member'" })
  role!: string;
}

export class LoginDTO {
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password!: string;
}
