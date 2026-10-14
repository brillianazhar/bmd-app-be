import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  Matches,
} from 'class-validator';

export class BulkDeleteKodeBarangDto {
  @IsArray({ message: 'ids harus berupa array' })
  @ArrayNotEmpty({ message: 'ids tidak boleh kosong' })
  @ArrayMaxSize(100, { message: 'Maksimal 100 data per permintaan' })
  @ArrayUnique({ message: 'ids tidak boleh duplikat' })
  @Matches(/^[1-9]\d*$/, {
    each: true,
    message: 'Setiap ID harus berupa angka bulat positif',
  })
  ids!: string[];
}
