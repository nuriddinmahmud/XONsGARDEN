import { ApiProperty } from '@nestjs/swagger';

export class Remont {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  price: number;

  @ApiProperty()
  comment: string;
}
