import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOilDto } from './dto/create-oil.dto';
import { UpdateOilDto } from './dto/update-oil.dto';

@Injectable()
export class OilService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateOilDto) {
    return this.prisma.oil.create({ data: dto });
  }

  findAll() {
    return this.prisma.oil.findMany({ orderBy: { date: 'desc' } });
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
