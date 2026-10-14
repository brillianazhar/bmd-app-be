import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateKodeBarangDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  kode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  kategori!: string;
}
