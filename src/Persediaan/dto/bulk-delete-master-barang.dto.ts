import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  Matches,
} from 'class-validator';

export class BulkDeleteMasterBarangDto {
  @IsArray({ message: 'ids must be an array' })
  @ArrayNotEmpty({ message: 'ids must not be empty' })
  @ArrayMaxSize(100, { message: 'ids must contain at most 100 items' })
  @IsString({ each: true })
  @Matches(/^[1-9]\d{0,18}$/, {
    each: true,
    message: 'ids contains an invalid id',
  })
  ids!: string[];
}
