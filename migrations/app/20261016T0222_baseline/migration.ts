#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c60517b9fc68cb735b7b710ec6a14b382d12e1b140fe8bdd0bde8a291cc5d842/contract';
import endContract from '../../snapshots/c60517b9fc68cb735b7b710ec6a14b382d12e1b140fe8bdd0bde8a291cc5d842/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'auth_group',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'character varying(150)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 150 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'auth_group_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_group_permissions',
        columns: [
          col('group_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('permission_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'auth_group_permissions_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_permission',
        columns: [
          col('codename', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('content_type_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'auth_permission_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_user',
        columns: [
          col('date_joined', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'character varying(254)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 254 } },
          }),
          col('first_name', 'character varying(150)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 150 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('is_active', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('is_staff', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('is_superuser', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('last_login', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('last_name', 'character varying(150)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 150 } },
          }),
          col('password', 'character varying(128)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 128 } },
          }),
          col('username', 'character varying(150)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 150 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'auth_user_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_user_groups',
        columns: [
          col('group_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('user_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'auth_user_groups_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_user_user_permissions',
        columns: [
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('permission_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('user_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'auth_user_user_permissions_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'django_admin_log',
        columns: [
          col('action_flag', 'int2', { notNull: true, codecRef: { codecId: 'pg/int2@1' } }),
          col('action_time', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('change_message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('content_type_id', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('object_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('object_repr', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('user_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id'], { name: 'django_admin_log_pkey' }),
          checkExpression('django_admin_log_action_flag_check', sql`(action_flag >= 0)`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'django_content_type',
        columns: [
          col('app_label', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('model', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'django_content_type_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'django_migrations',
        columns: [
          col('app', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('applied', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('name', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'django_migrations_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'django_session',
        columns: [
          col('expire_date', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('session_data', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('session_key', 'character varying(40)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 40 } },
          }),
        ],
        constraints: [primaryKey(['session_key'], { name: 'django_session_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_aset',
        columns: [
          col('harga', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('keterangan', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('kode_bmd_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('kode_lengkap', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('kondisi', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('merk', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('nama_barang', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('nomor_register', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tahun', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_aset_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_cuti',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('dari_current', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('dari_n', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('dari_n1', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('jenis', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('jumlah_hari', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('keterangan', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('pegawai_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('tanggal_mulai', 'date', {
            notNull: true,
            codecRef: { codecId: 'pg/date-string@1' },
          }),
          col('tanggal_selesai', 'date', {
            notNull: true,
            codecRef: { codecId: 'pg/date-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_cuti_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_cutisaldo',
        columns: [
          col('current', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('n', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('n1', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('pegawai_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('tahun', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_cutisaldo_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_kendaraan',
        columns: [
          col('foto', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('jenis', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('masa_pajak', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('merk', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('no_mesin', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('no_rangka', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('plat_nomor', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('status_bayar', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('stnk', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('tahun', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_kendaraan_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_kgb',
        columns: [
          col('file_sk', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('gaji_baru', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('gaji_lama', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('golongan', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('kgb_berikutnya', 'date', { codecRef: { codecId: 'pg/date-string@1' } }),
          col('masa_bulan', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('masa_tahun', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('no_sk', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('pangkat', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('pegawai_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('tanggal_sk', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('tmt_kgb', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_kgb_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_kodebmd',
        columns: [
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('kode', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('nama', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('parent_id', 'int8', { codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_kodebmd_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_koderekening',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deleted_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('kategori', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('kode', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_koderekening_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_kp',
        columns: [
          col('file_sk', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('gaji', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('golongan', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('jenis_kp', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('kp_berikutnya', 'date', { codecRef: { codecId: 'pg/date-string@1' } }),
          col('masa_bulan', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('masa_tahun', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('no_bkn', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('no_sk', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('pangkat', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('pegawai_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('tanggal_bkn', 'date', { codecRef: { codecId: 'pg/date-string@1' } }),
          col('tanggal_sk', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('tmt_kp', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_kp_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_logwa',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('jenis', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('nomor', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('pegawai_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('response', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('tanggal_event', 'date', {
            notNull: true,
            codecRef: { codecId: 'pg/date-string@1' },
          }),
          col('tipe', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_logwa_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_masterbarang',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deleted_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('nama_barang', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_masterbarang_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_pegawai',
        columns: [
          col('foto', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('golongan', 'character varying(20)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('jabatan', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('nama', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('nip', 'character varying(18)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 18 } },
          }),
          col('no_hp', 'character varying(15)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 15 } },
          }),
          col('pangkat', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_pegawai_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_pemegangaset',
        columns: [
          col('aset_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('keterangan', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('kondisi', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('pegawai_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('tahun', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_pemegangaset_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_pemegangkendaraan',
        columns: [
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('kendaraan_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('keterangan', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('kondisi', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('pegawai_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_pemegangkendaraan_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_servicebarang',
        columns: [
          col('aset_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('catatan', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('file', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('keluhan', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('keterangan', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('kode_barang', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('kondisi_akhir', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('kondisi_awal', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('nama_barang', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('no_service', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('pegawai', 'character varying(200)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('penerima', 'character varying(200)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('penerima_service', 'character varying(200)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('status', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('tanggal_kembali', 'date', { codecRef: { codecId: 'pg/date-string@1' } }),
          col('tanggal_service', 'date', {
            notNull: true,
            codecRef: { codecId: 'pg/date-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_servicebarang_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_servicefile',
        columns: [
          col('file', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('jenis', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('service_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_servicefile_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'master_transaksi',
        columns: [
          col('batch_id', 'character varying(50)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('harga', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('jumlah', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('kode_rekening', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('nama_barang', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('sisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tanggal', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('tipe', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('total', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'master_transaksi_pkey' })],
      }),
      this.addUnique({
        schema: 'public',
        table: 'auth_group',
        constraint: 'auth_group_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'auth_group_permissions',
        constraint: 'auth_group_permissions_group_id_permission_id_0cd325b0_uniq',
        columns: ['group_id', 'permission_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'auth_permission',
        constraint: 'auth_permission_content_type_id_codename_01ab375a_uniq',
        columns: ['content_type_id', 'codename'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'auth_user',
        constraint: 'auth_user_username_key',
        columns: ['username'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'auth_user_groups',
        constraint: 'auth_user_groups_user_id_group_id_94350c0c_uniq',
        columns: ['user_id', 'group_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'auth_user_user_permissions',
        constraint: 'auth_user_user_permissions_user_id_permission_id_14a6b632_uniq',
        columns: ['user_id', 'permission_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'django_content_type',
        constraint: 'django_content_type_app_label_model_76bd3d3b_uniq',
        columns: ['app_label', 'model'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'master_cutisaldo',
        constraint: 'master_cutisaldo_pegawai_id_key',
        columns: ['pegawai_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'master_koderekening',
        constraint: 'master_koderekening_kode_key',
        columns: ['kode'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'master_pegawai',
        constraint: 'master_pegawai_nip_key',
        columns: ['nip'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_group',
        index: 'auth_group_name_a6ea08ec_like',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_group_permissions',
        index: 'auth_group_permissions_group_id_b120cbf9',
        columns: ['group_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_group_permissions',
        index: 'auth_group_permissions_permission_id_84c5c92e',
        columns: ['permission_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_permission',
        index: 'auth_permission_content_type_id_2f476e4b',
        columns: ['content_type_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_user',
        index: 'auth_user_username_6821ab7c_like',
        columns: ['username'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_user_groups',
        index: 'auth_user_groups_group_id_97559544',
        columns: ['group_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_user_groups',
        index: 'auth_user_groups_user_id_6a12ed8b',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_user_user_permissions',
        index: 'auth_user_user_permissions_permission_id_1fbb5f2c',
        columns: ['permission_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_user_user_permissions',
        index: 'auth_user_user_permissions_user_id_a95ead1b',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'django_admin_log',
        index: 'django_admin_log_content_type_id_c4bce8eb',
        columns: ['content_type_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'django_admin_log',
        index: 'django_admin_log_user_id_c564eba6',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'django_session',
        index: 'django_session_expire_date_a5c62663',
        columns: ['expire_date'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'django_session',
        index: 'django_session_session_key_c0390e0f_like',
        columns: ['session_key'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_aset',
        index: 'master_aset_kode_bmd_id_d5af848d',
        columns: ['kode_bmd_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_cuti',
        index: 'master_cuti_pegawai_id_cc0111cf',
        columns: ['pegawai_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_kgb',
        index: 'master_kgb_pegawai_id_10aa3f26',
        columns: ['pegawai_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_kodebmd',
        index: 'master_kodebmd_parent_id_5626ee89',
        columns: ['parent_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_koderekening',
        index: 'master_koderekening_kode_078999bc_like',
        columns: ['kode'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_kp',
        index: 'master_kp_pegawai_id_79f16391',
        columns: ['pegawai_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_logwa',
        index: 'master_logwa_pegawai_id_a0e95877',
        columns: ['pegawai_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_pegawai',
        index: 'master_pegawai_nip_d1adc0b9_like',
        columns: ['nip'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_pemegangaset',
        index: 'master_pemegangaset_aset_id_9bea47f5',
        columns: ['aset_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_pemegangaset',
        index: 'master_pemegangaset_pegawai_id_270b5727',
        columns: ['pegawai_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_pemegangkendaraan',
        index: 'master_pemegangkendaraan_kendaraan_id_49ad76d7',
        columns: ['kendaraan_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_pemegangkendaraan',
        index: 'master_pemegangkendaraan_pegawai_id_e3462423',
        columns: ['pegawai_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_servicebarang',
        index: 'master_servicebarang_aset_id_e5a8f20a',
        columns: ['aset_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'master_servicefile',
        index: 'master_servicefile_service_id_7d027653',
        columns: ['service_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_group_permissions',
        foreignKey: {
          name: 'auth_group_permissio_permission_id_84c5c92e_fk_auth_perm',
          columns: ['permission_id'],
          references: { schema: 'public', table: 'auth_permission', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_group_permissions',
        foreignKey: {
          name: 'auth_group_permissions_group_id_b120cbf9_fk_auth_group_id',
          columns: ['group_id'],
          references: { schema: 'public', table: 'auth_group', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_permission',
        foreignKey: {
          name: 'auth_permission_content_type_id_2f476e4b_fk_django_co',
          columns: ['content_type_id'],
          references: { schema: 'public', table: 'django_content_type', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_user_groups',
        foreignKey: {
          name: 'auth_user_groups_group_id_97559544_fk_auth_group_id',
          columns: ['group_id'],
          references: { schema: 'public', table: 'auth_group', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_user_groups',
        foreignKey: {
          name: 'auth_user_groups_user_id_6a12ed8b_fk_auth_user_id',
          columns: ['user_id'],
          references: { schema: 'public', table: 'auth_user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_user_user_permissions',
        foreignKey: {
          name: 'auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm',
          columns: ['permission_id'],
          references: { schema: 'public', table: 'auth_permission', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_user_user_permissions',
        foreignKey: {
          name: 'auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id',
          columns: ['user_id'],
          references: { schema: 'public', table: 'auth_user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'django_admin_log',
        foreignKey: {
          name: 'django_admin_log_content_type_id_c4bce8eb_fk_django_co',
          columns: ['content_type_id'],
          references: { schema: 'public', table: 'django_content_type', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'django_admin_log',
        foreignKey: {
          name: 'django_admin_log_user_id_c564eba6_fk_auth_user_id',
          columns: ['user_id'],
          references: { schema: 'public', table: 'auth_user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_aset',
        foreignKey: {
          name: 'master_aset_kode_bmd_id_d5af848d_fk_master_kodebmd_id',
          columns: ['kode_bmd_id'],
          references: { schema: 'public', table: 'master_kodebmd', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_cuti',
        foreignKey: {
          name: 'master_cuti_pegawai_id_cc0111cf_fk_master_pegawai_id',
          columns: ['pegawai_id'],
          references: { schema: 'public', table: 'master_pegawai', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_cutisaldo',
        foreignKey: {
          name: 'master_cutisaldo_pegawai_id_34046fd1_fk_master_pegawai_id',
          columns: ['pegawai_id'],
          references: { schema: 'public', table: 'master_pegawai', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_kgb',
        foreignKey: {
          name: 'master_kgb_pegawai_id_10aa3f26_fk_master_pegawai_id',
          columns: ['pegawai_id'],
          references: { schema: 'public', table: 'master_pegawai', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_kodebmd',
        foreignKey: {
          name: 'master_kodebmd_parent_id_5626ee89_fk_master_kodebmd_id',
          columns: ['parent_id'],
          references: { schema: 'public', table: 'master_kodebmd', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_kp',
        foreignKey: {
          name: 'master_kp_pegawai_id_79f16391_fk_master_pegawai_id',
          columns: ['pegawai_id'],
          references: { schema: 'public', table: 'master_pegawai', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_logwa',
        foreignKey: {
          name: 'master_logwa_pegawai_id_a0e95877_fk_master_pegawai_id',
          columns: ['pegawai_id'],
          references: { schema: 'public', table: 'master_pegawai', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_pemegangaset',
        foreignKey: {
          name: 'master_pemegangaset_aset_id_9bea47f5_fk_master_aset_id',
          columns: ['aset_id'],
          references: { schema: 'public', table: 'master_aset', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_pemegangaset',
        foreignKey: {
          name: 'master_pemegangaset_pegawai_id_270b5727_fk_master_pegawai_id',
          columns: ['pegawai_id'],
          references: { schema: 'public', table: 'master_pegawai', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_pemegangkendaraan',
        foreignKey: {
          name: 'master_pemegangkenda_kendaraan_id_49ad76d7_fk_master_ke',
          columns: ['kendaraan_id'],
          references: { schema: 'public', table: 'master_kendaraan', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_pemegangkendaraan',
        foreignKey: {
          name: 'master_pemegangkenda_pegawai_id_e3462423_fk_master_pe',
          columns: ['pegawai_id'],
          references: { schema: 'public', table: 'master_pegawai', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_servicebarang',
        foreignKey: {
          name: 'master_servicebarang_aset_id_e5a8f20a_fk_master_aset_id',
          columns: ['aset_id'],
          references: { schema: 'public', table: 'master_aset', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'master_servicefile',
        foreignKey: {
          name: 'master_servicefile_service_id_7d027653_fk_master_se',
          columns: ['service_id'],
          references: { schema: 'public', table: 'master_servicebarang', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
