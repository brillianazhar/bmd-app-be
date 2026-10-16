import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and } from '@prisma/orm-postgres/orm-client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMasterBarangDto } from './dto/create-master-barang.dto.js';
import { QueryMasterBarangDto } from './dto/query-master-barang.dto.js';
import { Varchar } from '@prisma/orm-postgres/target/codec-types';

type KodeInfo = { kode: string; kategori: string };

type BarangRow = {
  id: bigint;
  kodeRekeningId: bigint;
  namaBarang: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

@Injectable()
export class MasterBarangService {
  constructor(private readonly prisma: PrismaService) {}

  private get kodeRekening() {
    return this.prisma.db.orm.public.MasterKoderekening;
  }

  private get barang() {
    return this.prisma.db.orm.public.MasterMasterbarang;
  }

  private parseId(id: string): bigint {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException({
        success: false,
        message: 'ID barang tidak valid',
        data: null,
      });
    }
    return BigInt(id);
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      success: false,
      message: 'Data barang tidak ditemukan',
      data: null,
    });
  }

  // karakter wildcard LIKE dianggap teks biasa
  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }

  private isConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Error &&
      'code' in error &&
      typeof error.code === 'string' &&
      error.code.startsWith('CONSTRAINT.')
    );
  }

  // BigInt tidak bisa di-serialize ke JSON, ubah ke string
  private formatData(item: BarangRow, kode?: KodeInfo | null) {
    return {
      id: item.id.toString(),
      kodeRekeningId: item.kodeRekeningId.toString(),
      kode: kode?.kode ?? null,
      kategori: kode?.kategori ?? null,
      namaBarang: item.namaBarang,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
    };
  }

  // Create Master Barang
  async create(dto: CreateMasterBarangDto) {
    const namaBarang = dto.namaBarang.trim().replace(/\s+/g, ' ');

    if (!namaBarang) {
      throw new BadRequestException({
        success: false,
        message: 'Nama barang wajib diisi',
        data: null,
      });
    }

    const kodeRekeningId = BigInt(dto.kodeRekeningId);

    const kode = await this.kodeRekening
      .where((row) => row.id.eq(kodeRekeningId))
      .first();

    if (!kode || kode.deletedAt) {
      throw new NotFoundException({
        success: false,
        message: 'Kode rekening tidak ditemukan atau sudah dihapus',
        data: null,
      });
    }

    // barang dengan nama yang sama pada kode rekening yang sama (tidak peka huruf besar/kecil)
    const duplicate = await this.barang
      .where((row) => row.kodeRekeningId.eq(kodeRekeningId))
      .where((row) => row.deletedAt.isNull())
      .where((row) => row.namaBarang.ilike(this.escapeLike(namaBarang)))
      .first();

    if (duplicate) {
      throw new ConflictException({
        success: false,
        message: `Barang "${namaBarang}" sudah ada pada kode rekening ${kode.kode}`,
        data: null,
      });
    }

    try {
      const item = await this.barang.create({
        kodeRekeningId,
        namaBarang: namaBarang as Varchar<255>,
      });

      return {
        success: true,
        message: 'Data barang berhasil ditambahkan',
        data: this.formatData(item, kode),
      };
    } catch (error) {
      // mis. kode rekening dihapus tepat di antara pengecekan dan penyimpanan
      if (this.isConstraintViolation(error)) {
        throw new ConflictException({
          success: false,
          message:
            'Data tidak dapat disimpan karena bertentangan dengan data lain',
          data: null,
        });
      }
      throw error;
    }
  }

  // Get All Master Barang
  async findAll(query: QueryMasterBarangDto) {
    const { page, limit } = query;
    const keyword = query.search?.trim() ?? '';
    const offset = (page - 1) * limit;

    const applyFilters = () => {
      const active = this.barang.where((row) => row.deletedAt.isNull());

      if (!keyword) {
        return active;
      }

      const pattern = `%${this.escapeLike(keyword)}%`;
      return active.where((row) => row.namaBarang.ilike(pattern));
    };

    const [rows, countResult] = await Promise.all([
      applyFilters()
        .orderBy((row) => row.id.desc())
        .limit(limit)
        .offset(offset)
        .all(),
      applyFilters().aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    // kode & kategori diambil dari master_koderekening dengan satu query
    // (termasuk kode yang sudah di-soft-delete, karena barang masih menunjuk ke sana)
    const ids = [...new Set(rows.map((row) => row.kodeRekeningId))];
    const kodeById = new Map<bigint, KodeInfo>();

    if (ids.length > 0) {
      const list = await this.kodeRekening.where((row) => row.id.in(ids)).all();

      for (const item of list) {
        kodeById.set(item.id, { kode: item.kode, kategori: item.kategori });
      }
    }

    const totalItems = Number(countResult.total);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      message:
        totalItems === 0
          ? 'Data barang tidak ditemukan'
          : 'Data barang berhasil diambil',
      data: rows.map((row) =>
        this.formatData(row, kodeById.get(row.kodeRekeningId)),
      ),
      meta: {
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        },
      },
    };
  }

  async findOne(id: string) {
    const idBigInt = this.parseId(id);

    const row = await this.barang
      .where((item) => item.id.eq(idBigInt))
      .where((item) => item.deletedAt.isNull())
      .first();

    if (!row) {
      throw this.notFound();
    }

    const kode = await this.kodeRekening
      .where((item) => item.id.eq(row.kodeRekeningId))
      .first();

    return {
      success: true,
      message: 'Data barang berhasil diambil',
      data: this.formatData(row, kode),
    };
  }
}
