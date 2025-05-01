import { PartialType } from '@nestjs/mapped-types';
import { CreateEnergyDto } from './create-energy.dto';

export class UpdateEnergyDto extends PartialType(CreateEnergyDto) {}
