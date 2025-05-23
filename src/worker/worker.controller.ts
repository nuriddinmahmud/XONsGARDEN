import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Worker')
@ApiBearerAuth()
@Controller('worker')
export class WorkerController {
  constructor(private readonly service: WorkerService) {}

  @Post()
  create(@Body() dto: CreateWorkerDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
