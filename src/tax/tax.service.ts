import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { PaginationDto } from './dto/pagination-query.dto';

@Injectable()
export class TaxService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTaxDto) {
    return this.prisma.tax.create({ data: dto });
  }

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const allowedSortFields = ['date', 'amountPaid', 'comment'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.tax.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.tax.count(),
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
    const tax = await this.prisma.tax.findUnique({ where: { id } });
    if (!tax) throw new NotFoundException('Tax record not found');
    return tax;
  }

  async update(id: number, dto: UpdateTaxDto) {
    await this.findOne(id);
    return this.prisma.tax.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tax.delete({ where: { id } });
  }
}
