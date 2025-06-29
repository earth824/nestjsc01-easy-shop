import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { JwtPayload } from '@/common/types/jwt-payload.type';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const [bearer, token] = req.headers.authorization?.split(' ') ?? [];
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Authentication is required');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      req.user = payload;
    } catch {
      throw new UnauthorizedException('Jwt is invalid');
    }
    return true;
  }
}
