import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTransportDto) {
    return this.prisma.transport.create({ data: dto });
  }

  findAll() {
    return this.prisma.transport.findMany({ orderBy: { date: 'desc' } });
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
