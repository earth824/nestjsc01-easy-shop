import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/common/types/jwt-payload.type';
import { SuccessResult } from '@/common/types/success-result.type';
import { UsersService } from '@/users/services/users.service';
import {
  Controller,
  Patch,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'prisma/generated/prisma';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(FileInterceptor('image'))
  @Patch('upload')
  async updateUserImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() curentUser: JwtPayload
  ): Promise<SuccessResult<Omit<User, 'password'>>> {
    const user = await this.usersService.uploadUserImage(curentUser.sub, file);
    return { message: 'Upload profile image successfully', data: user };
  }
}
