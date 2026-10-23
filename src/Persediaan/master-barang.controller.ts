import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMasterBarangDto } from './dto/create-master-barang.dto.js';
import { QueryMasterBarangDto } from './dto/query-master-barang.dto.js';
import { MasterBarangService } from './master-barang.service.js';
import { UpdateMasterBarangDto } from './dto/update-master-barang.dto.js';
import { BulkDeleteMasterBarangDto } from './dto/bulk-delete-master-barang.dto.js';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMasterBarangDto) {
    return this.masterBarangService.update(id, dto);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  removeMany(@Body() dto: BulkDeleteMasterBarangDto) {
    return this.masterBarangService.removeMany(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterBarangService.remove(id);
  }
}
