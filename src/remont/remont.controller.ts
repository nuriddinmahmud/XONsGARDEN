import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RemontService } from './remont.service';
import { CreateRemontDto } from './dto/create-remont.dto';
import { UpdateRemontDto } from './dto/update-remont.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Remont')
@ApiBearerAuth()
@Controller('remont')
export class RemontController {
  constructor(private readonly service: RemontService) {}

  @Post()
  create(@Body() dto: CreateRemontDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRemontDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
