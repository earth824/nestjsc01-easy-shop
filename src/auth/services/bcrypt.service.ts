import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 10);
  }

  compare(plainText: string, digest: string): Promise<boolean> {
    return bcrypt.compare(plainText, digest);
  }
}
