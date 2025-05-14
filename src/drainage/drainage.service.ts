import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDrainageDto } from './dto/create-drainage.dto';
import { UpdateDrainageDto } from './dto/update-drainage.dto';
import { PaginationDto } from './dto/pagination-query.dto';

@Injectable()
export class DrainageService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDrainageDto) {
    return this.prisma.drainage.create({ data: dto });
  }


async findAll(query: PaginationDto) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'date',
    sortOrder = 'desc',
  } = query;

  const skip = (page - 1) * limit;

  const [data, total] = await this.prisma.$transaction([
    this.prisma.drainage.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    this.prisma.drainage.count(),
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
    const drainage = await this.prisma.drainage.findUnique({ where: { id } });
    if (!drainage) throw new NotFoundException('Drainage not found');
    return drainage;
  }

  async update(id: number, dto: UpdateDrainageDto) {
    await this.findOne(id);
    return this.prisma.drainage.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.drainage.delete({ where: { id } });
  }
}
