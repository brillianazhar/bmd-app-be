import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsString,
  Matches,
} from 'class-validator';

export class BulkDeleteKodeBarangDto {
  @IsArray({ message: 'IDs must be an array' })
  @ArrayNotEmpty({ message: 'IDs should not be empty' })
  @ArrayMaxSize(100, { message: 'Maximum 100 items per request' })
  @ArrayUnique({ message: 'IDs must not contain duplicate values' })
  @IsString({ each: true, message: 'Each ID must be a string' })
  @Matches(/^[1-9]\d{0,18}$/, {
    each: true,
    message: 'Each ID must be a positive integer',
  })
  ids!: string[];
}
