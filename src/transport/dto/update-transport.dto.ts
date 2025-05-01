import { PartialType } from '@nestjs/swagger';
import { CreateTransportDto } from './create-transport.dto';

export class UpdateTransportDto extends PartialType(CreateTransportDto) {}
