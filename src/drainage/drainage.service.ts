import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDrainageDto } from './dto/create-drainage.dto';
import { UpdateDrainageDto } from './dto/update-drainage.dto';

@Injectable()
export class DrainageService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDrainageDto) {
    return this.prisma.drainage.create({ data: dto });
  }

  findAll() {
    return this.prisma.drainage.findMany({ orderBy: { date: 'desc' } });
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
