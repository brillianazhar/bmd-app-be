import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateKodeBarangDto {
  @IsString({ message: 'Kode must be a string' })
  @IsNotEmpty({ message: 'Kode should not be empty' })
  @MaxLength(50, { message: 'Maximum 50 character' })
  kode!: string;

  @IsString({ message: 'Kategori must be a string' })
  @IsNotEmpty({ message: 'Kategori should not be empty' })
  @MaxLength(100, { message: 'Maximum 100 character' })
  kategori!: string;
}
