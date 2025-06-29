import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { EmailVerificationToken, Prisma } from 'prisma/generated/prisma';

@Injectable()
export class EmailVerificationTokensService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: Prisma.XOR<
      Prisma.EmailVerificationTokenCreateInput,
      Prisma.EmailVerificationTokenUncheckedCreateInput
    >
  ): Promise<void> {
    await this.prismaService.emailVerificationToken.create({ data });
  }

  findByToken(token: string): Promise<EmailVerificationToken | null> {
    return this.prismaService.emailVerificationToken.findUnique({
      where: { token }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.emailVerificationToken.delete({ where: { id } });
  }
}
