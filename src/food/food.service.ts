import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateFoodDto) {
    return this.prisma.food.create({ data: dto });
  }

  findAll() {
    return this.prisma.food.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(id: number) {
    const food = await this.prisma.food.findUnique({ where: { id } });
    if (!food) throw new NotFoundException('Food record not found');
    return food;
  }

  async update(id: number, dto: UpdateFoodDto) {
    await this.findOne(id);
    return this.prisma.food.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.food.delete({ where: { id } });
  }
}
