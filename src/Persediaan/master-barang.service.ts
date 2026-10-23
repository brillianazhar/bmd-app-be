import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMasterBarangDto } from './dto/create-master-barang.dto.js';
import { QueryMasterBarangDto } from './dto/query-master-barang.dto.js';
import { UpdateMasterBarangDto } from './dto/update-master-barang.dto.js';
import { BulkDeleteMasterBarangDto } from './dto/bulk-delete-master-barang.dto.js';
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

const MAX_BIGINT = BigInt('9223372036854775807');

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
    if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > MAX_BIGINT) {
      throw new BadRequestException({
        success: false,
        message: 'ID barang is not valid',
        data: null,
      });
    }
    return BigInt(id);
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      success: false,
      message: 'Data not found',
      data: null,
    });
  }

  // karakter wildcard LIKE dianggap teks biasa
  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }

  private normalizeNama(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
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

  // Pengecekan Duplikat
  private async assertNoDuplicate(
    kodeRekeningId: bigint,
    namaBarang: string,
    kodeLabel: string,
    excludeId?: bigint,
  ) {
    const matches = await this.barang
      .where((row) => row.kodeRekeningId.eq(kodeRekeningId))
      .where((row) => row.deletedAt.isNull())
      .where((row) => row.namaBarang.ilike(this.escapeLike(namaBarang)))
      .limit(2)
      .all();

    if (matches.some((row) => row.id !== excludeId)) {
      throw new ConflictException({
        success: false,
        message: `Barang "${namaBarang}" already exists under ${kodeLabel}`,
        data: null,
      });
    }
  }

  // Create Master Barang
  async create(dto: CreateMasterBarangDto) {
    const namaBarang = this.normalizeNama(dto.namaBarang);

    if (!namaBarang) {
      throw new BadRequestException({
        success: false,
        message: 'Nama barang is required',
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
        message: 'Kode rekening not found or has been deleted',
        data: null,
      });
    }

    // barang dengan nama yang sama pada kode rekening yang sama (tidak peka huruf besar/kecil)
    await this.assertNoDuplicate(kodeRekeningId, namaBarang, kode.kode);

    try {
      const item = await this.barang.create({
        kodeRekeningId,
        namaBarang: namaBarang as Varchar<255>,
      });

      return {
        success: true,
        message: 'Barang created successfully',
        data: this.formatData(item, kode),
      };
    } catch (error) {
      // handle ketika kode rekening dihapus tepat di antara pengecekan dan penyimpanan
      if (this.isConstraintViolation(error)) {
        throw new ConflictException({
          success: false,
          message:
            'Data cannot be saved because it conflicts with existing data',
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
          ? 'Data barang not found'
          : 'Data barang retrieved successfully',
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

  // Get Detail Barang
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
      message: 'Data barang retrieved successfully',
      data: this.formatData(row, kode),
    };
  }

  // Update Master Barang
  async update(id: string, dto: UpdateMasterBarangDto) {
    const idBigInt = this.parseId(id);

    if (dto.kodeRekeningId == null && dto.namaBarang == null) {
      throw new BadRequestException({
        success: false,
        message: 'No data to update',
        data: null,
      });
    }

    const existing = await this.barang
      .where((row) => row.id.eq(idBigInt))
      .where((row) => row.deletedAt.isNull())
      .first();

    if (!existing) {
      throw this.notFound();
    }

    const kodeRekeningId =
      dto.kodeRekeningId != null
        ? BigInt(dto.kodeRekeningId)
        : existing.kodeRekeningId;

    const namaBarang =
      dto.namaBarang != null
        ? this.normalizeNama(dto.namaBarang)
        : existing.namaBarang;

    if (!namaBarang) {
      throw new BadRequestException({
        success: false,
        message: 'Nama barang cannot be empty',
        data: null,
      });
    }

    const kode = await this.kodeRekening
      .where((row) => row.id.eq(kodeRekeningId))
      .first();

    // kode rekening baru harus aktif; kalau tidak diganti, barang lama
    // tetap boleh diedit walau kodenya sudah di-soft-delete
    if (
      !kode ||
      (kodeRekeningId !== existing.kodeRekeningId && kode.deletedAt)
    ) {
      throw new NotFoundException({
        success: false,
        message: 'Kode rekening not found or has been deleted',
        data: null,
      });
    }

    await this.assertNoDuplicate(
      kodeRekeningId,
      namaBarang,
      kode.kode,
      idBigInt,
    );

    try {
      const item = await this.barang
        .where((row) => row.id.eq(idBigInt))
        .where((row) => row.deletedAt.isNull())
        .update({
          kodeRekeningId,
          namaBarang: namaBarang as Varchar<255>,
          updatedAt: new Date().toISOString(),
        });

      // null = baris terhapus oleh request lain di antara pengecekan dan update
      if (!item) {
        throw this.notFound();
      }

      return {
        success: true,
        message: 'Barang updated successfully',
        data: this.formatData(item, kode),
      };
    } catch (error) {
      if (this.isConstraintViolation(error)) {
        throw new ConflictException({
          success: false,
          message:
            'Data cannot be saved because it conflicts with existing data',
          data: null,
        });
      }
      throw error;
    }
  }

  // Delete Master Barang
  async remove(id: string) {
    const idBigInt = this.parseId(id);
    const now = new Date().toISOString();

    const item = await this.barang
      .where((row) => row.id.eq(idBigInt))
      .where((row) => row.deletedAt.isNull())
      .update({ deletedAt: now, updatedAt: now });

    if (!item) {
      throw this.notFound();
    }

    return {
      success: true,
      message: 'Barang deleted successfully',
      data: null,
    };
  }

  // Delete Bulk Master Barang
  async removeMany(dto: BulkDeleteMasterBarangDto) {
    const uniqueIds = [...new Set(dto.ids)];

    if (uniqueIds.length === 0) {
      throw new BadRequestException({
        success: false,
        message: 'ids must not be empty',
        data: null,
      });
    }

    if (uniqueIds.length > 100) {
      throw new BadRequestException({
        success: false,
        message: 'Maximum 100 items per request',
        data: null,
      });
    }

    // validasi semua id dulu, supaya satu id tidak valid tidak menghapus sebagian
    const ids = uniqueIds.map((id) => this.parseId(id));
    const now = new Date().toISOString();

    const results = await Promise.allSettled(
      ids.map(async (idBigInt) => {
        const item = await this.barang
          .where((row) => row.id.eq(idBigInt))
          .where((row) => row.deletedAt.isNull())
          .update({ deletedAt: now, updatedAt: now });

        return item != null;
      }),
    );

    const deletedIds: string[] = [];
    const notFoundIds: string[] = [];
    const failedIds: string[] = [];
    let firstError: unknown;

    results.forEach((result, index) => {
      const idString = ids[index].toString();

      if (result.status === 'rejected') {
        failedIds.push(idString);
        if (firstError === undefined) firstError = result.reason;
      } else if (result.value) {
        deletedIds.push(idString);
      } else {
        notFoundIds.push(idString);
      }
    });

    if (deletedIds.length === 0) {
      // semua gagal karena error database: jangan disamarkan sebagai 404
      if (firstError !== undefined) throw firstError;
      throw this.notFound();
    }

    return {
      success: true,
      message: `${deletedIds.length} barang deleted successfully`,
      data: { deletedIds, notFoundIds, failedIds },
    };
  }
}
