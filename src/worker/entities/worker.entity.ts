import { ApiProperty } from '@nestjs/swagger';

export class Worker {
  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  workerCount: number;

  @ApiProperty()
  salaryPerOne: number;

  @ApiProperty()
  totalSalary?: number;

  @ApiProperty()
  comment: string;
}
