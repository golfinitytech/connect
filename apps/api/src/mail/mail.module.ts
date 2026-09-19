import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketingController } from './marketing.controller';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [MarketingController],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailModule {}
