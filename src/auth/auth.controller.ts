import { LoginDto } from '@/auth/dtos/login.dto';
import { RegisterDto } from '@/auth/dtos/register.dto';
import { AuthService } from '@/auth/services/auth.service';
import { Public } from '@/common/decorators/public.decorator';
import { SuccessResult } from '@/common/types/success-result.type';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async registerWithCredentials(
    @Body() registerDto: RegisterDto
  ): Promise<SuccessResult> {
    await this.authService.registerWithCredentials(registerDto);
    return { message: 'Successfully registration' };
  }

  @Public()
  @Get('verify')
  async verifyEmail(@Query('token') token?: string): Promise<SuccessResult> {
    await this.authService.verifyEmail(token);
    return { message: 'Account has been verified' };
  }

  @Public()
  @Throttle({ default: { ttl: 300000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async loginWithCredentials(
    @Body() loginDto: LoginDto
  ): Promise<SuccessResult<{ access_token: string }>> {
    const access_token = await this.authService.loginWithCredentials(loginDto);
    return { message: 'Successfully login', data: { access_token } };
  }
}
