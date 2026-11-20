import { Global, Module } from '@nestjs/common';
import { FaceStorageService } from './face-storage.service';

@Global()
@Module({
  providers: [FaceStorageService],
  exports: [FaceStorageService],
})
export class StorageModule {}
