import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MasterDataModule } from './Persediaan/kode-barang.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, MasterDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
