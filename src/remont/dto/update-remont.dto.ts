import { PartialType } from '@nestjs/mapped-types';
import { CreateRemontDto } from './create-remont.dto';

export class UpdateRemontDto extends PartialType(CreateRemontDto) {}
