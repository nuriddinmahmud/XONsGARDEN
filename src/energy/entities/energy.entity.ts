import { ApiProperty } from '@nestjs/swagger';

export class Energy {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty()
  comment: string;
}
