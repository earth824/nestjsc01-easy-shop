import { PrismaService } from '@/database/prisma.service';
import { CloudinaryService } from '@/upload/cloudinary.service';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'prisma/generated/prisma';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  create(
    data: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>
  ): Promise<User> {
    return this.prismaService.user.create({ data });
  }

  update(
    id: string,
    data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>
  ): Promise<Omit<User, 'password'>> {
    return this.prismaService.user.update({
      where: { id },
      data,
      omit: { password: true }
    });
  }

  async uploadUserImage(
    id: string,
    file: Express.Multer.File
  ): Promise<Omit<User, 'password'>> {
    // upload image to cloudinary
    const result = await this.cloudinaryService.uploadFile(file);
    // update image url to user table
    return this.update(id, { profileImageUrl: result.secure_url });
  }
}
