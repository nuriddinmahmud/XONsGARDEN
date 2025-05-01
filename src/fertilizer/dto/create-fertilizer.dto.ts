import { IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFertilizerDto {
  @ApiProperty({ example: '2024-05-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Azotli o‘g‘it' })
  @IsString()
  fertilizerType: string;

  @ApiProperty({ example: '3 ta traktor' })
  @IsString()
  machineCount: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  tonAmount: number;

  @ApiProperty({ example: 'G‘o‘zapoya uchun azot solindi' })
  @IsString()
  comment: string;
}
