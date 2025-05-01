import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFertilizerDto } from './dto/create-fertilizer.dto';
import { UpdateFertilizerDto } from './dto/update-fertilizer.dto';

@Injectable()
export class FertilizerService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateFertilizerDto) {
    return this.prisma.fertilizer.create({ data: dto });
  }

  findAll() {
    return this.prisma.fertilizer.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(id: number) {
    const fertilizer = await this.prisma.fertilizer.findUnique({ where: { id } });
    if (!fertilizer) throw new NotFoundException('Fertilizer not found');
    return fertilizer;
  }

  async update(id: number, dto: UpdateFertilizerDto) {
    await this.findOne(id);
    return this.prisma.fertilizer.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.fertilizer.delete({ where: { id } });
  }
}
