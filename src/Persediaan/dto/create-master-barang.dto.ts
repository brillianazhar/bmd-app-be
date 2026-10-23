import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateMasterBarangDto {
  @Type(() => Number)
  @IsInt({ message: 'kodeRekeningId must be number' })
  @Min(1, { message: 'kodeRekeningId is not valid' })
  @Max(Number.MAX_SAFE_INTEGER, { message: 'kodeRekeningId is not valid' })
  kodeRekeningId!: number;

  @Transform(trim)
  @IsString({ message: 'namaBarang must be a string' })
  @IsNotEmpty({ message: 'namaBarang should not be empty' })
  @MaxLength(255, { message: 'Maximum 255 character' })
  namaBarang!: string;
}
