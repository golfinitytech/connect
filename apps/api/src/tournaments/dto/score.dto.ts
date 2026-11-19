import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Note: the dashboard's axios interceptor appends `course` to every
 * /tournaments request body, so every DTO accepts an optional `course`.
 */
class WithCourse {
  @IsOptional()
  @IsString()
  course?: string;
}

export class EnterScoreDto extends WithCourse {
  @IsString()
  playerId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(18)
  hole!: number;

  /** Gross strokes. Null/omitted together with out=false clears the hole. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  strokes?: number | null;

  @IsOptional()
  @IsBoolean()
  out?: boolean;

  /** Version the client last saw; mismatch -> 409 so devices don't overwrite each other. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  expectedVersion?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  actorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  groupCode?: string;
}

export class ValidateScoresDto extends WithCourse {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  playerIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(18)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(18, { each: true })
  holes!: number[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  validatedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  groupCode?: string;
}

export class MarshalEditDto extends EnterScoreDto {
  @IsString()
  @MaxLength(20)
  marshalPin!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}

export class VerifyMarshalDto extends WithCourse {
  @IsString()
  @MaxLength(20)
  marshalPin!: string;
}

export class PostMessageDto extends WithCourse {
  /** control | all | marshal | "FLIGHT <code>" (direct reply to one flight) */
  @IsString()
  @Matches(/^(control|all|marshal|FLIGHT [A-Za-z0-9-]{1,30})$/)
  to!: string;

  @IsIn(['caddie', 'admin', 'marshal'])
  fromRole!: 'caddie' | 'admin' | 'marshal';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  from?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  groupCode?: string;

  @IsString()
  @MaxLength(1000)
  text!: string;
}

export class UpdateSettingsDto extends WithCourse {
  /** 4 digits: the tablet marshal keypad accepts exactly 4. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN marshal harus 4 angka.' })
  marshalPin?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(18)
  @ArrayMaxSize(18)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(3, { each: true })
  @Max(6, { each: true })
  pars?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}
