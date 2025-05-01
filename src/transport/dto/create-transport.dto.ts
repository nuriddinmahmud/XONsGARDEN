import { IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransportDto {
  @ApiProperty({ example: '2024-05-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Yuk mashinasi' })
  @IsString()
  transportType: string;

  @ApiProperty({ example: 'Qum tashishga ishlatildi' })
  @IsString()
  comment: string;
}
