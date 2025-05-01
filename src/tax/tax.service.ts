import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTaxDto) {
    return this.prisma.tax.create({ data: dto });
  }

  findAll() {
    return this.prisma.tax.findMany({ orderBy: { date: 'desc' } });
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
