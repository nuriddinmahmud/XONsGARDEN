import { IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDrainageDto {
  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 3.5 })
  @IsNumber()
  hoursWorked: number;

  @ApiProperty({ example: 210000.0 })
  @IsNumber()
  totalSalary: number;
}
