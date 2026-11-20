import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // The database is remote (Supabase): every query is a network round-trip, so the
    // default 5s interactive-transaction timeout is too tight for multi-step writes.
    super({ transactionOptions: { maxWait: 10_000, timeout: 60_000 } });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
