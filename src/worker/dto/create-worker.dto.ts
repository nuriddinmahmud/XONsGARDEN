import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerDto {
  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  workerCount: number;

  @ApiProperty({ example: 150000.5 })
  @IsNumber()
  salaryPerOne: number;

  @ApiProperty({ example: 750002.5, required: false })
  @IsOptional()
  @IsNumber()
  totalSalary?: number;

  @ApiProperty({ example: 'Bog‘ ekish ishlari' })
  @IsString()
  comment: string;
}
