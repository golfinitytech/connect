import { IsNumber, IsOptional } from 'class-validator';

export class PingDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
