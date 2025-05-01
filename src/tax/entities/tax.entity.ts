import { ApiProperty } from '@nestjs/swagger';

export class Tax {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty()
  comment: string;
}
