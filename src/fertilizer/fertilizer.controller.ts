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
import { FertilizerService } from './fertilizer.service';
import { CreateFertilizerDto } from './dto/create-fertilizer.dto';
import { UpdateFertilizerDto } from './dto/update-fertilizer.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Fertilizer')
@ApiBearerAuth()
@Controller('fertilizer')
export class FertilizerController {
  constructor(private readonly service: FertilizerService) {}

  @Post()
  create(@Body() dto: CreateFertilizerDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFertilizerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
