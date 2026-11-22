import { NestFactory } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

// Reused across invocations while the function instance stays warm.
let handlerPromise: Promise<Handler> | null = null;

async function createHandler(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  configureApp(app);
  await app.init();
  return app.getHttpAdapter().getInstance() as Handler;
}

/** Vercel Node.js function entry: every request is routed here (see apps/api/vercel.json). */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!handlerPromise) {
    handlerPromise = createHandler().catch((err) => {
      handlerPromise = null; // retry bootstrap on the next request
      throw err;
    });
  }
  const app = await handlerPromise;
  app(req, res);
}
