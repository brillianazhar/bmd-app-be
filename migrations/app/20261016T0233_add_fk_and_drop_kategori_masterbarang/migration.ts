#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2802b11a75c9835b4554134d89b0e85733c4b3e25e0e4f83ae09b5e9c15c3bf9/contract';
import startContract from '../../snapshots/2802b11a75c9835b4554134d89b0e85733c4b3e25e0e4f83ae09b5e9c15c3bf9/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9c10bd148e70f55d46f14b2b19a1619c31feb1420031e2318fbca4619789d70c/contract';
import endContract from '../../snapshots/9c10bd148e70f55d46f14b2b19a1619c31feb1420031e2318fbca4619789d70c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'master_masterbarang', column: 'kategori' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
