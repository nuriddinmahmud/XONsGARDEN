import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOilDto } from './dto/create-oil.dto';
import { UpdateOilDto } from './dto/update-oil.dto';
import { PaginationDto } from './dto/pagination-query.dto';

@Injectable()
export class OilService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateOilDto) {
    return this.prisma.oil.create({ data: dto });
  }

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const allowedSortFields = ['date', 'price', 'comment'];
    if (sortBy && !allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.oil.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.oil.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const oil = await this.prisma.oil.findUnique({ where: { id } });
    if (!oil) throw new NotFoundException('Oil record not found');
    return oil;
  }

  async update(id: number, dto: UpdateOilDto) {
    await this.findOne(id);
    return this.prisma.oil.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.oil.delete({ where: { id } });
  }
}
