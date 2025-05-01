import { IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOilDto {
  @ApiProperty({ example: '2024-05-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 780000.0 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Traktor yoqilg‘isi to‘ldirildi' })
  @IsString()
  comment: string;
}
