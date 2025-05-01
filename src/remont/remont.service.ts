import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRemontDto } from './dto/create-remont.dto';
import { UpdateRemontDto } from './dto/update-remont.dto';

@Injectable()
export class RemontService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRemontDto) {
    return this.prisma.remont.create({ data: dto });
  }

  findAll() {
    return this.prisma.remont.findMany({ orderBy: { date: 'desc' } });
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
