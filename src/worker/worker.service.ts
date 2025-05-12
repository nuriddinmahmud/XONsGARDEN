import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateWorkerDto) {
    return this.prisma.worker.create({ data: dto });
  }

  async findAll(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const take = 20;
  const skip = (page - 1) * take;

  const [data, total] = await Promise.all([
    this.prisma.worker.findMany({
      take,
      skip,
      orderBy: { date: 'desc' },
    }),
    this.prisma.worker.count(),
  ]);

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / take),
  };
}


  async findOne(id: number) {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  async update(id: number, dto: UpdateWorkerDto) {
    await this.findOne(id);
    return this.prisma.worker.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.worker.delete({ where: { id } });
  }
}
