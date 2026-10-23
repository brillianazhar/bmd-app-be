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
import { QueryKodeBarangDto } from './dto/query-kode-barang.dto.js';

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
        message: 'Kode Rekening Id is not valid',
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
        message: 'Kode rekening is still in use in master barang',
        errors: usedIds.map(
          (id) => `Kode rekening with id ${id} is still in use`,
        ),
        data: null,
      });
    }
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      success: false,
      message: 'Kode rekening not found',
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
  async findAll(query: QueryKodeBarangDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const currentPage = Math.min(100000, Math.max(1, Math.floor(page) || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(limit) || 10));

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
          ? 'Kode rekening not found'
          : 'Kode rekening retrieved successfully',
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
        message: 'Kode and kategori are required',
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
          message: 'Kode rekening is already in use',
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
          ? 'Kode rekening restored successfully'
          : 'Kode rekening created successfully',
        data: this.formatData(item),
      };
    } catch (error) {
      // jaga-jaga kalau ada dua request bersamaan dengan kode yang sama
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          success: false,
          message: 'Kode rekening is already in use',
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
        message: 'No changes were made',
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
        message: 'Kode dan kategori must not be empty',
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
            ? 'Kode rekening is already used by a deleted record'
            : 'Kode rekening is already in use',
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
        message: 'Kode rekening updated successfully',
        data: this.formatData(item),
      };
    } catch (error) {
      // jaga-jaga kalau ada dua request bersamaan dengan kode yang sama
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          success: false,
          message: 'Kode rekening is already in use',
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
        message: 'Kode rekening not found',
        data: null,
      });
    }

    return {
      success: true,
      message: 'Kode rekening deleted successfully',
      data: null,
    };
  }

  // Delete Bulk Kode Barang
  async removeMany(dto: BulkDeleteKodeBarangDto) {
    const uniqueIds = [...new Set(dto.ids)];

    if (uniqueIds.length === 0) {
      throw new BadRequestException({
        success: false,
        message: 'IDs must not be empty',
        data: null,
      });
    }

    if (uniqueIds.length > 100) {
      throw new BadRequestException({
        success: false,
        message: 'Maximum 100 items per deletion',
        data: null,
      });
    }

    // validasi semua id dulu, supaya satu id tidak valid tidak menghapus sebagian
    const ids = uniqueIds.map((id) => this.parseId(id));
    await this.assertNotUsedByBarang(ids);
    const now = new Date().toISOString();

    const results = await Promise.allSettled(
      ids.map(async (idBigInt) => {
        const item = await this.model
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
      message: `${deletedIds.length} kode rekening deleted successfully`,
      data: { deletedIds, notFoundIds, failedIds },
    };
  }
}
