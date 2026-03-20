import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export class SignUpDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    example: "Password123",
    description:
      "Password (min 8 chars, must contain uppercase, lowercase, and number)",
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(72, { message: "Password must not exceed 72 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  password: string;

  @ApiProperty({
    example: "John Doe",
    description: "User full name",
  })
  @IsString()
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  @MaxLength(100, { message: "Name must not exceed 100 characters" })
  name: string;
}

export class LoginDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    example: "Password123",
    description: "User password",
  })
  @IsString()
  @MinLength(1, { message: "Password is required" })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token",
  })
  @IsString()
  @MinLength(1, { message: "Refresh token is required" })
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({
    description: "Refresh token to invalidate",
  })
  @IsString()
  @MinLength(1, { message: "Refresh token is required" })
  refreshToken: string;
}

// Response DTOs for Swagger
export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;
}

export class TokensResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ description: "Access token expiration in seconds" })
  expiresIn: number;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: TokensResponseDto })
  tokens: TokensResponseDto;
}
