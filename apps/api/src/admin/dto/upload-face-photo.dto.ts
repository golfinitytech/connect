import { IsString } from 'class-validator';

export class UploadFacePhotoDto {
  @IsString()
  imageBase64!: string;
}
