import { ApiProperty } from '@nestjs/swagger';

export class Oil {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  price: number;

  @ApiProperty()
  comment: string;
}
