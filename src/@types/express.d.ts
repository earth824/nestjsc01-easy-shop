import { JwtPayload } from '@/common/types/jwt-payload.type';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
