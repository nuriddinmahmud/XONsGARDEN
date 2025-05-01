import { IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFoodDto {
  @ApiProperty({ example: '2024-05-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Supermarket Azizbek' })
  @IsString()
  shopName: string;

  @ApiProperty({ example: 145000.75 })
  @IsNumber()
  price: number;
}
