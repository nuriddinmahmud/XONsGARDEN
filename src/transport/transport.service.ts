import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { PaginationDto } from './dto/pagination-query.dto';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTransportDto) {
    return this.prisma.transport.create({ data: dto });
  }

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const allowedSortFields = ['date', 'transportType', 'comment'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transport.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.transport.count(),
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
    const record = await this.prisma.transport.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Transport record not found');
    return record;
  }

  async update(id: number, dto: UpdateTransportDto) {
    await this.findOne(id);
    return this.prisma.transport.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.transport.delete({ where: { id } });
  }
}
