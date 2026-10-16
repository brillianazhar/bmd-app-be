import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MasterDataModule } from './Persediaan/kode-barang.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MasterBarangModule } from './Persediaan/master-barang.module.js';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

@Module({
  imports: [PrismaModule, MasterDataModule, MasterBarangModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
