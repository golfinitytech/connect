import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AcademyRole } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export const ACADEMY_AUDIENCE = 'academy';

export type AcademyPrincipal = {
  id: string;
  role: AcademyRole;
  name: string;
  email: string;
};

const ROLES_KEY = 'academyRoles';
/** Restrict a route to the given academy roles (default: any signed-in account). */
export const AcademyRoles = (...roles: AcademyRole[]) =>
  SetMetadata(ROLES_KEY, roles);

export const CurrentAcademyUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AcademyPrincipal =>
    ctx.switchToHttp().getRequest().academyUser,
);

@Injectable()
export class AcademyAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { academyUser?: AcademyPrincipal }>();
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException();

    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(token, { audience: ACADEMY_AUDIENCE });
    } catch {
      throw new UnauthorizedException();
    }

    const account = await this.prisma.academyAccount.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, name: true, email: true, status: true },
    });
    if (!account || account.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }

    const roles = this.reflector.getAllAndOverride<AcademyRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (roles?.length && !roles.includes(account.role)) {
      throw new ForbiddenException();
    }

    req.academyUser = {
      id: account.id,
      role: account.role,
      name: account.name,
      email: account.email,
    };
    return true;
  }
}
