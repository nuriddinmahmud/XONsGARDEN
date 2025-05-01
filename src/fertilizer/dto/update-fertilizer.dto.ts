import { PartialType } from '@nestjs/mapped-types';
import { CreateFertilizerDto } from './create-fertilizer.dto';

export class UpdateFertilizerDto extends PartialType(CreateFertilizerDto) {}
