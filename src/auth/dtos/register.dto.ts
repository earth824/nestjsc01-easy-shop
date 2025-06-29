import { UserRole } from '@/common/enums/user-role.enum';
import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsAlphanumeric()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.USER;
}
