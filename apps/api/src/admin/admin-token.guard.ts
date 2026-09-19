import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const token = process.env.ADMIN_DASHBOARD_TOKEN;
    if (!token) {
      throw new UnauthorizedException('Admin token not configured');
    }

    const req = context
      .switchToHttp()
      .getRequest<
        Request & { headers: Record<string, string | string[] | undefined> }
      >();
    const header = req.headers['x-admin-token'];
    const provided = Array.isArray(header) ? header[0] : header;

    if (!provided || provided !== token) {
      throw new UnauthorizedException('Invalid admin token');
    }

    return true;
  }
}
