import { FairwayHit } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateHoleScoreDto {
  @IsString()
  userId!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  strokes!: number;

  @IsInt()
  @Min(0)
  @Max(10)
  putts!: number;

  @IsOptional()
  @IsEnum(FairwayHit)
  fairwayHit?: FairwayHit;

  @IsOptional()
  @IsBoolean()
  gir?: boolean;
}
