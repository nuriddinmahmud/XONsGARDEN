import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRemontDto } from './dto/create-remont.dto';
import { UpdateRemontDto } from './dto/update-remont.dto';
import { PaginationDto } from './dto/pagination-query.dto';

@Injectable()
export class RemontService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRemontDto) {
    return this.prisma.remont.create({ data: dto });
  }

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const allowedSortFields = ['date', 'price', 'comment'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.remont.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.remont.count(),
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
    const record = await this.prisma.remont.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Remont record not found');
    return record;
  }

  async update(id: number, dto: UpdateRemontDto) {
    await this.findOne(id);
    return this.prisma.remont.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.remont.delete({ where: { id } });
  }
}
