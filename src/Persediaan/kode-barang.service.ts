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

@Injectable()
export class KodeBarangService {
  constructor(private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.MasterKoderekening;
  }

  private parseId(id: string): bigint {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException({
        success: false,
        message: 'ID kode rekening tidak valid',
        data: null,
      });
    }

    return BigInt(id);
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof Error &&
      'code' in error &&
      error.code === 'CONSTRAINT.UNIQUE'
    );
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

  //Get All
  async findAll(page = '1', limit = '10', search = '') {
    const currentPage = Math.max(1, Math.floor(Number(page)) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Math.floor(Number(limit)) || 10),
    );

    const keyword = search.trim();
    const offset = (currentPage - 1) * pageSize;

    const query = this.prisma.db.orm.public.MasterKoderekening;

    const applyFilters = () => {
      const activeQuery = query.where((item) => item.deletedAt.isNull());

      if (!keyword) {
        return activeQuery;
      }

      return activeQuery.where((item) =>
        or(
          item.kode.ilike(`%${keyword}%`),
          item.kategori.ilike(`%${keyword}%`),
        ),
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

    const data = result.map((item) => ({
      ...item,
      id: item.id.toString(),
    }));

    return {
      success: true,
      message: 'Data kode rekening berhasil diambil',
      data,
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

  async create(dto: CreateKodeBarangDto) {
    const kodeValue = dto.kode.trim();
    const kategoriValue = dto.kategori.trim();

    if (!kodeValue || !kategoriValue) {
      throw new BadRequestException('Kode dan kategori wajib diisi');
    }

    const kode = kodeValue as Varchar<50>;
    const kategori = kategoriValue as Varchar<100>;

    const item = await this.prisma.db.orm.public.MasterKoderekening.create({
      kode,
      kategori,
    });

    return {
      success: true,
      message: 'Data kode rekening berhasil ditambahkan',
      data: {
        ...item,
        id: item.id.toString(),
      },
    };
  }

  //Update
  async update(id: string, dto: UpdateKodeBarangDto) {
    const idBigInt = this.parseId(id);

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
      throw new BadRequestException('Kode dan kategori tidak boleh kosong');
    }

    try {
      const item = await this.prisma.db.orm.public.MasterKoderekening.where(
        (row) => row.id.eq(idBigInt),
      )
        .where((row) => row.deletedAt.isNull())
        .update(changes);

      if (!item) {
        throw new NotFoundException({
          success: false,
          message: 'Data kode rekening tidak ditemukan',
          data: null,
        });
      }

      return {
        success: true,
        message: 'Data kode rekening berhasil diperbarui',
        data: {
          ...item,
          id: item.id.toString(),
        },
      };
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'CONSTRAINT.UNIQUE'
      ) {
        throw new ConflictException({
          success: false,
          message: 'Kode rekening sudah digunakan',
          data: null,
        });
      }

      throw error;
    }
  }

  //Delete
  async remove(id: string) {
    const idBigInt = this.parseId(id);
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

  //Delete Bulk
  async removeMany(dto: BulkDeleteKodeBarangDto) {
    // Hilangkan duplikat, lalu validasi dan ubah tiap id ke bigint.
    const uniqueIds = [...new Set(dto.ids)];
    const ids = uniqueIds.map((id) => this.parseId(id));
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
