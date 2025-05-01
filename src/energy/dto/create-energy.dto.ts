import { IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnergyDto {
  @ApiProperty({ example: '2024-05-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 500000.75 })
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ example: 'May oyi elektr to‘lovi' })
  @IsString()
  comment: string;
}
