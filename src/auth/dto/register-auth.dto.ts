import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAuthDto {
  @ApiProperty({ example: 'Nuriddin' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'nuriddin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret123' })
  @IsString()
  password: string;
}
