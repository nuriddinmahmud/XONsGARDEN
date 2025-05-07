import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnergyDto } from './dto/create-energy.dto';
import { UpdateEnergyDto } from './dto/update-energy.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnergyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnergyDto: CreateEnergyDto) {
    try {
      const newEnergy = await this.prisma.energy.create({
        data: createEnergyDto,
      });

      return { newEnergy };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const energy = await this.prisma.energy.findMany();

      return energy;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const energy = await this.prisma.energy.findFirst({ where: { id } });
      if (!energy) throw new NotFoundException('Energy not found');

      return { energy };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, updateEnergyDto: UpdateEnergyDto) {
    try {
      const energy = await this.prisma.energy.findFirst({ where: { id } });
      if (!energy) throw new NotFoundException('Energy not found');

      const newEnergy = await this.prisma.energy.update({
        data: updateEnergyDto,
        where: { id },
      });

      return { newEnergy };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const energy = await this.prisma.energy.findFirst({ where: { id } });
      if (!energy) throw new NotFoundException('Energy not found');

      const deletedEnergy = await this.prisma.energy.delete({ where: { id } });
      return { message: 'Energy is successfully deleted', data: deletedEnergy };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
