import { PartialType } from '@nestjs/mapped-types';
import { CreateDrainageDto } from './create-drainage.dto';

export class UpdateDrainageDto extends PartialType(CreateDrainageDto) {}
