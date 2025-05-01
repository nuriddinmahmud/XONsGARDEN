import { IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRemontDto {
  @ApiProperty({ example: '2024-05-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 2000000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Baliqchilik inshooti ta’mirlandi' })
  @IsString()
  comment: string;
}
