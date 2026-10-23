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
import { KodeBarangService } from './kode-barang.service.js';
import { CreateKodeBarangDto } from './dto/create-kode-barang.dto.js';
import { UpdateKodeBarangDto } from './dto/update-kode-barang.dto.js';
import { BulkDeleteKodeBarangDto } from './dto/bulk-delete-kode-barang.dto.js';
import { QueryKodeBarangDto } from './dto/query-kode-barang.dto.js';

@Controller('kode-barang')
export class KodeBarangController {
  constructor(private readonly kodeBarangService: KodeBarangService) {}

  @Post()
  create(@Body() dto: CreateKodeBarangDto) {
    return this.kodeBarangService.create(dto);
  }

  // @Get()
  // findAll(
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  //   @Query('search') search?: string,
  // ) {
  //   return this.kodeBarangService.findAll(page, limit, search);
  // }

  @Get()
  findAll(@Query() query: QueryKodeBarangDto) {
    return this.kodeBarangService.findAll(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKodeBarangDto) {
    return this.kodeBarangService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kodeBarangService.remove(id);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  removeMany(@Body() dto: BulkDeleteKodeBarangDto) {
    return this.kodeBarangService.removeMany(dto);
  }

  // @Delete()
  // removeMany(@Body() dto: BulkDeleteKodeBarangDto) {
  //   return this.kodeBarangService.removeMany(dto);
  // }
}
