import {
  AcademyProgressStatus,
  AcademyRole,
  AcademySessionStatus,
} from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AcademyLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsIn(['student', 'coach', 'admin'])
  role!: 'student' | 'coach' | 'admin';
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class CreateSessionDto {
  @IsString()
  coachId!: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  /** ISO datetime of the start; sessions last 90 minutes unless endsAt is given. */
  @IsDateString()
  startsAt!: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;

  /** Admin/coach only: book on behalf of this student. */
  @IsOptional()
  @IsString()
  studentId?: string;
}

export class UpdateSessionStatusDto {
  @IsEnum(AcademySessionStatus)
  status!: AcademySessionStatus;
}

export class CompleteEvaluationDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateProgressDto {
  @IsString()
  studentId!: string;

  @IsString()
  lessonId!: string;

  @IsEnum(AcademyProgressStatus)
  status!: AcademyProgressStatus;
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  text!: string;
}

export class CreateAccountDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(AcademyRole)
  role!: AcademyRole;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  coachId?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsString()
  packageName?: string;

  @IsOptional()
  @IsNumber()
  remainingSessions?: number;
}

export class AssignCoachDto {
  @IsOptional()
  @IsString()
  coachId?: string | null;
}

export class CreateFeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsIn(['Training Program', 'App Performance', 'Facility', 'Coaching', 'Other'])
  category!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  message!: string;
}
