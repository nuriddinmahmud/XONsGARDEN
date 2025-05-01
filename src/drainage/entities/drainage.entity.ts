import { ApiProperty } from '@nestjs/swagger';

export class Drainage {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  hoursWorked: number;

  @ApiProperty()
  totalSalary: number;
}
