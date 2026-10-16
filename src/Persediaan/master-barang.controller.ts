import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMasterBarangDto } from './dto/create-master-barang.dto.js';
import { QueryMasterBarangDto } from './dto/query-master-barang.dto.js';
import { MasterBarangService } from './master-barang.service.js';

@Controller('master-barang')
export class MasterBarangController {
  constructor(private readonly masterBarangService: MasterBarangService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMasterBarangDto) {
    return this.masterBarangService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryMasterBarangDto) {
    return this.masterBarangService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterBarangService.findOne(id);
  }
}
