import { ApiProperty } from '@nestjs/swagger';

export class Fertilizer {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  fertilizerType: string;

  @ApiProperty()
  machineCount: string;

  @ApiProperty()
  tonAmount: number;

  @ApiProperty()
  comment: string;
}
