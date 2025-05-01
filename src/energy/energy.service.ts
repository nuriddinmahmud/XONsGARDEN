import { Injectable } from '@nestjs/common';
import { CreateEnergyDto } from './dto/create-energy.dto';
import { UpdateEnergyDto } from './dto/update-energy.dto';

@Injectable()
export class EnergyService {
  create(createEnergyDto: CreateEnergyDto) {
    return 'This action adds a new energy';
  }

  findAll() {
    return `This action returns all energy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} energy`;
  }

  update(id: number, updateEnergyDto: UpdateEnergyDto) {
    return `This action updates a #${id} energy`;
  }

  remove(id: number) {
    return `This action removes a #${id} energy`;
  }
}
