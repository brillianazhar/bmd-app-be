import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MasterBarangController } from './master-barang.controller.js';
import { MasterBarangService } from './master-barang.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [MasterBarangController],
  providers: [MasterBarangService],
})
export class MasterBarangModule {}
