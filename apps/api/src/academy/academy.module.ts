import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AcademyAuthGuard } from './academy-auth.guard';
import { AcademyAuthController, AcademyController } from './academy.controller';
import { AcademyService } from './academy.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
    }),
  ],
  controllers: [AcademyAuthController, AcademyController],
  providers: [AcademyService, AcademyAuthGuard],
})
export class AcademyModule {}
