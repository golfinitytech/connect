import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('marketing')
export class MarketingController {
  private readonly logger = new Logger(MarketingController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('send-bulk')
  async sendBulkMarketingEmail(
    @Body()
    body: {
      title: string;
      content: string;
      ctaText?: string;
      ctaUrl?: string;
    },
  ) {
    const users = await this.prisma.user.findMany({
      include: { preference: true },
    });

    const eligibleUsers = users.filter(
      (user) => user.preference?.marketingEmails !== false,
    );

    this.logger.log(
      `Starting bulk marketing email to ${eligibleUsers.length} users`,
    );

    const results = await Promise.allSettled(
      eligibleUsers.map((user) =>
        this.emailService.sendMarketingEmail(
          user.email,
          user.fullName,
          body.title,
          body.content,
          body.ctaText,
          body.ctaUrl,
        ),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      message: `Marketing campaign processed`,
      totalEligible: eligibleUsers.length,
      succeeded,
      failed,
    };
  }
}
