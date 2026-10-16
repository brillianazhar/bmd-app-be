import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateKodeBarangDto } from './dto/create-kode-barang.dto.js';
import { or } from '@prisma/orm-postgres/orm-client';
import { Varchar } from '@prisma/orm-postgres/target/codec-types';
import { UpdateKodeBarangDto } from './dto/update-kode-barang.dto.js';
import { BulkDeleteKodeBarangDto } from './dto/bulk-delete-kode-barang.dto.js';

const MAX_BIGINT = BigInt('9223372036854775807');

@Injectable()
export class KodeBarangService {
  constructor(private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.MasterKoderekening;
  }

  private parseId(id: string): bigint {
    if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > MAX_BIGINT) {
      throw new BadRequestException({
        success: false,
        message: 'ID kode rekening tidak valid',
        data: null,
      });
    }

    return BigInt(id);
  }

  private isUniqueViolation(error: unknown): boolean {
    const seen = new Set<unknown>();
    let current: unknown = error;

    while (current && typeof current === 'object' && !seen.has(current)) {
      seen.add(current);
      const e = current as {
        code?: unknown;
        message?: unknown;
        cause?: unknown;
      };

      if (
        typeof e.code === 'string' &&
        (e.code === '23505' || e.code.toUpperCase().includes('UNIQUE'))
      ) {
        return true;
      }

      if (
        typeof e.message === 'string' &&
        /unique constraint|duplicate key|unique violation/i.test(e.message)
      ) {
        return true;
      }

      current = e.cause;
    }

    return false;
  }

  // karakter wildcard LIKE dianggap teks biasa
  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }

  // Guard ketika kode barang yg masih digunakan akan dihapus
  private async assertNotUsedByBarang(ids: bigint[]) {
    if (ids.length === 0) return;

    const used = await this.prisma.db.orm.public.MasterMasterbarang.where(
      (row) => row.deletedAt.isNull(),
    )
      .where((row) => row.kodeRekeningId.in(ids))
      .all();

    if (used.length > 0) {
      const usedIds = [
        ...new Set(used.map((row) => row.kodeRekeningId.toString())),
      ];

      throw new ConflictException({
        success: false,
        message: 'Kode rekening masih digunakan oleh data barang',
        errors: usedIds.map(
          (id) => `Kode rekening dengan id ${id} masih dipakai`,
        ),
        data: null,
      });
    }
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      success: false,
      message: 'Data kode rekening tidak ditemukan',
      data: null,
    });
  }

  private formatData(item: {
    id: bigint;
    kode: string;
    kategori: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }) {
    return {
      ...item,
      id: item.id.toString(),
    };
  }

  // Get All Kode Barang
  async findAll(page = '1', limit = '10', search = '') {
    const currentPage = Math.min(
      100000,
      Math.max(1, Math.floor(Number(page)) || 1),
    );
    const pageSize = Math.min(
      100,
      Math.max(1, Math.floor(Number(limit)) || 10),
    );

    const keyword = (typeof search === 'string' ? search : '')
      .trim()
      .slice(0, 100);
    const offset = (currentPage - 1) * pageSize;

    const applyFilters = () => {
      const activeQuery = this.model.where((item) => item.deletedAt.isNull());

      if (!keyword) {
        return activeQuery;
      }

      const pattern = `%${this.escapeLike(keyword)}%`;

      return activeQuery.where((item) =>
        or(item.kode.ilike(pattern), item.kategori.ilike(pattern)),
      );
    };

    const [result, countResult] = await Promise.all([
      applyFilters()
        .orderBy((item) => item.kode.asc())
        .limit(pageSize)
        .offset(offset)
        .all(),

      applyFilters().aggregate((aggregate) => ({
        total: aggregate.count(),
      })),
    ]);

    const totalItems = Number(countResult.total);
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      success: true,
      message:
        totalItems === 0
          ? 'Data kode rekening tidak ditemukan'
          : 'Data kode rekening berhasil diambil',
      data: result.map((item) => this.formatData(item)),
      meta: {
        pagination: {
          page: currentPage,
          limit: pageSize,
          totalItems,
          totalPages,
          hasPreviousPage: currentPage > 1,
          hasNextPage: currentPage < totalPages,
        },
      },
    };
  }

  // Create Kode Barang
  async create(dto: CreateKodeBarangDto) {
    const kodeValue = dto.kode.trim();
    const kategoriValue = dto.kategori.trim();

    if (!kodeValue || !kategoriValue) {
      throw new BadRequestException({
        success: false,
        message: 'Kode dan kategori wajib diisi',
        data: null,
      });
    }

    const kode = kodeValue as Varchar<50>;
    const kategori = kategoriValue as Varchar<100>;

    try {
      const existing = await this.model
        .where((row) => row.kode.eq(kode))
        .first();

      if (existing && !existing.deletedAt) {
        throw new ConflictException({
          success: false,
          message: 'Kode rekening sudah digunakan',
          data: null,
        });
      }

      const item = existing
        ? await this.model
            .where((row) => row.id.eq(existing.id))
            .update({
              kategori,
              deletedAt: null,
              updatedAt: new Date().toISOString(),
            })
        : await this.model.create({ kode, kategori });

      if (!item) {
        throw this.notFound();
      }

      return {
        success: true,
        message: existing
          ? 'Data kode rekening berhasil dipulihkan'
          : 'Data kode rekening berhasil ditambahkan',
        data: this.formatData(item),
      };
    } catch (error) {
      // jaga-jaga kalau ada dua request bersamaan dengan kode yang sama
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          success: false,
          message: 'Kode rekening sudah digunakan',
          data: null,
        });
      }

      throw error;
    }
  }

  // Update Kode Barang
  async update(id: string, dto: UpdateKodeBarangDto) {
    const idBigInt = this.parseId(id);

    if (dto.kode === undefined && dto.kategori === undefined) {
      throw new BadRequestException({
        success: false,
        message: 'Tidak ada data yang diubah',
        data: null,
      });
    }

    const changes: {
      kode?: Varchar<50>;
      kategori?: Varchar<100>;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (dto.kode !== undefined) {
      changes.kode = dto.kode.trim() as Varchar<50>;
    }

    if (dto.kategori !== undefined) {
      changes.kategori = dto.kategori.trim() as Varchar<100>;
    }

    if (changes.kode === '' || changes.kategori === '') {
      throw new BadRequestException({
        success: false,
        message: 'Kode dan kategori tidak boleh kosong',
        data: null,
      });
    }

    // cek duplikasi kode (termasuk baris yang sudah di-soft-delete,
    // karena constraint unik tetap menghitungnya)
    const newKode = changes.kode;
    if (newKode !== undefined) {
      const holder = await this.model
        .where((row) => row.kode.eq(newKode))
        .first();

      if (holder && holder.id !== idBigInt) {
        throw new ConflictException({
          success: false,
          message: holder.deletedAt
            ? 'Kode rekening sudah dipakai oleh data yang telah dihapus'
            : 'Kode rekening sudah digunakan',
          data: null,
        });
      }
    }

    try {
      const item = await this.model
        .where((row) => row.id.eq(idBigInt))
        .where((row) => row.deletedAt.isNull())
        .update(changes);

      if (!item) {
        throw this.notFound();
      }

      return {
        success: true,
        message: 'Data kode rekening berhasil diperbarui',
        data: this.formatData(item),
      };
    } catch (error) {
      // jaga-jaga kalau ada dua request bersamaan dengan kode yang sama
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          success: false,
          message: 'Kode rekening sudah digunakan',
          data: null,
        });
      }

      throw error;
    }
  }

  // Delete Kode Barang
  async remove(id: string) {
    const idBigInt = this.parseId(id);
    await this.assertNotUsedByBarang([idBigInt]);
    const now = new Date().toISOString();

    const item = await this.prisma.db.orm.public.MasterKoderekening.where(
      (row) => row.id.eq(idBigInt),
    )
      .where((row) => row.deletedAt.isNull())
      .update({
        deletedAt: now,
        updatedAt: now,
      });

    if (!item) {
      throw new NotFoundException({
        success: false,
        message: 'Data kode rekening tidak ditemukan',
        data: null,
      });
    }

    return {
      success: true,
      message: 'Data kode rekening berhasil dihapus',
      data: null,
    };
  }

  // Delete Bulk Kode Barang
  async removeMany(dto: BulkDeleteKodeBarangDto) {
    const uniqueIds = [...new Set(dto.ids)];

    if (uniqueIds.length === 0) {
      throw new BadRequestException({
        success: false,
        message: 'Daftar ID tidak boleh kosong',
        data: null,
      });
    }

    if (uniqueIds.length > 100) {
      throw new BadRequestException({
        success: false,
        message: 'Maksimal 100 data per penghapusan',
        data: null,
      });
    }

    const ids = uniqueIds.map((id) => this.parseId(id));
    await this.assertNotUsedByBarang(ids);
    const now = new Date().toISOString();

    const results = await Promise.all(
      ids.map(async (idBigInt) => {
        const item = await this.model
          .where((row) => row.id.eq(idBigInt))
          .where((row) => row.deletedAt.isNull())
          .update({
            deletedAt: now,
            updatedAt: now,
          });

        return { id: idBigInt.toString(), deleted: item != null };
      }),
    );

    const deletedIds = results.filter((r) => r.deleted).map((r) => r.id);
    const notFoundIds = results.filter((r) => !r.deleted).map((r) => r.id);

    if (deletedIds.length === 0) {
      throw this.notFound();
    }

    return {
      success: true,
      message: `${deletedIds.length} data kode rekening berhasil dihapus`,
      data: {
        deletedIds,
        notFoundIds,
      },
    };
  }
}
