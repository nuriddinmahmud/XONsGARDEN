import { ApiProperty } from '@nestjs/swagger';

export class Transport {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  transportType: string;

  @ApiProperty()
  comment: string;
}
