import { IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaxDto {
  @ApiProperty({ example: '2024-05-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 950000.0 })
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ example: 'Yer solig‘i uchun to‘lov' })
  @IsString()
  comment: string;
}
