import { ApiProperty } from '@nestjs/swagger';

export class Food {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  shopName: string;

  @ApiProperty()
  price: number;
}
