import { GameMode } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRoundDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  courseId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  teeBoxId!: string;

  @IsEnum(GameMode)
  gameMode!: GameMode;

  @IsArray()
  @IsString({ each: true })
  playerIds!: string[];
}
