import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnergyDto } from './dto/create-energy.dto';
import { UpdateEnergyDto } from './dto/update-energy.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from './dto/pagination-query.dto';

@Injectable()
export class EnergyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEnergyDto) {
    try {
      const newEnergy = await this.prisma.energy.create({
        data: dto,
      });

      return { newEnergy };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const allowedSortFields = ['date', 'amountPaid', 'comment'];
    if (sortBy && !allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const skip = (page - 1) * limit;

    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.energy.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        this.prisma.energy.count(),
      ]);

      return {
        data,
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const energy = await this.prisma.energy.findUnique({ where: { id } });
      if (!energy) throw new NotFoundException('Energy not found');

      return { energy };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, dto: UpdateEnergyDto) {
    try {
      const energy = await this.prisma.energy.findUnique({ where: { id } });
      if (!energy) throw new NotFoundException('Energy not found');

      const newEnergy = await this.prisma.energy.update({
        data: dto,
        where: { id },
      });

      return { newEnergy };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const energy = await this.prisma.energy.findUnique({ where: { id } });
      if (!energy) throw new NotFoundException('Energy not found');

      const deleted = await this.prisma.energy.delete({ where: { id } });
      return { message: 'Energy successfully deleted', data: deleted };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
