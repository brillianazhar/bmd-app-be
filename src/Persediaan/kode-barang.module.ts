import { Module } from '@nestjs/common';
import { KodeBarangController } from './kode-barang.controller.js';
import { KodeBarangService } from './kode-barang.service.js';

@Module({
  controllers: [KodeBarangController],
  providers: [KodeBarangService],
})
export class MasterDataModule {}
