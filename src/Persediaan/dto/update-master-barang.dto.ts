import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateMasterBarangDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'kodeRekeningId must be a number' })
  @Min(1, { message: 'kodeRekeningId is not valid' })
  @Max(Number.MAX_SAFE_INTEGER, { message: 'kodeRekeningId is not valid' })
  kodeRekeningId?: number;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'namaBarang must be a string' })
  @IsNotEmpty({ message: 'namaBarang cannot be empty' })
  @MaxLength(255, { message: 'namaBarang max 255 characters' })
  namaBarang?: string;
}
