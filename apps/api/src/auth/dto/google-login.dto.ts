import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'The ID token from Google Sign-In via Firebase' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
