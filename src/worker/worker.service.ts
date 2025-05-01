import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateWorkerDto) {
    return this.prisma.worker.create({ data: dto });
  }

  findAll() {
    return this.prisma.worker.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(id: number) {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  async update(id: number, dto: UpdateWorkerDto) {
    await this.findOne(id); // check exists
    return this.prisma.worker.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id); // check exists
    return this.prisma.worker.delete({ where: { id } });
  }
}
