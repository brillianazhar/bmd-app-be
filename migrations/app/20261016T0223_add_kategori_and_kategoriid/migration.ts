#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2802b11a75c9835b4554134d89b0e85733c4b3e25e0e4f83ae09b5e9c15c3bf9/contract';
import endContract from '../../snapshots/2802b11a75c9835b4554134d89b0e85733c4b3e25e0e4f83ae09b5e9c15c3bf9/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c60517b9fc68cb735b7b710ec6a14b382d12e1b140fe8bdd0bde8a291cc5d842/contract';
import startContract from '../../snapshots/c60517b9fc68cb735b7b710ec6a14b382d12e1b140fe8bdd0bde8a291cc5d842/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'master_masterbarang',
        column: col('kategori', 'character varying(100)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
        }),
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'master_masterbarang',
        column: 'kode_rekening_id',
        type: 'int8',
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_masterbarang',
        index: 'master_masterbarang_kode_rekening_id_idx_a47ac379',
        columns: ['kode_rekening_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_masterbarang',
        foreignKey: {
          name: 'master_masterbarang_kode_rekening_id_fkey',
          columns: ['kode_rekening_id'],
          references: { schema: 'public', table: 'master_koderekening', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
