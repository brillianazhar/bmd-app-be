import { PartialType } from '@nestjs/mapped-types';
import { CreateKodeBarangDto } from './create-kode-barang.dto.js';

export class UpdateKodeBarangDto extends PartialType(CreateKodeBarangDto) {}
