import { LoginDto } from '@/auth/dtos/login.dto';
import { RegisterDto } from '@/auth/dtos/register.dto';
import { BcryptService } from '@/auth/services/bcrypt.service';
import { EmailVerificationTokensService } from '@/auth/services/email-verification-tokens.service';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtPayload } from '@/common/types/jwt-payload.type';
import { envConfig } from '@/config/env.config';
import { EmailService } from '@/email/email.service';
import { UsersService } from '@/users/services/users.service';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly emailVerificationTokensService: EmailVerificationTokensService,
    private readonly emailService: EmailService,
    @Inject(envConfig.KEY)
    private readonly envConfigService: ConfigType<typeof envConfig>,
    private readonly jwtService: JwtService
  ) {}

  async registerWithCredentials(registerDto: RegisterDto): Promise<void> {
    // Check email exist
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email already in use');
    // Hash a password
    registerDto.password = await this.bcryptService.hash(registerDto.password);

    // Create new user
    const user = await this.usersService.create(registerDto);

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');

    // Create email verification with expires at (1day)
    await this.emailVerificationTokensService.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    // Send verification email
    // link: http://localhost:9999/auth/verify?token=
    const link = `${this.envConfigService.BASE_URL}/auth/verify?token=${token}`;
    await this.emailService.sendVerifyEmail(user.email, link);
  }

  async verifyEmail(token?: string): Promise<void> {
    // Check token defined?
    if (!token) throw new BadRequestException('Verification token is missing');
    // Query token in emailverification table
    const emailVerificationToken =
      await this.emailVerificationTokensService.findByToken(token);
    if (!emailVerificationToken)
      throw new NotFoundException(
        'Verification token not found or has been deleted'
      );
    // Check if token expired
    if (emailVerificationToken.expiresAt < new Date()) {
      await this.emailVerificationTokensService.delete(
        emailVerificationToken.id
      );
      throw new BadRequestException('Link has been expired');
    }
    // Delete token from  emailverification table and update isVerified to true
    await Promise.all([
      this.emailVerificationTokensService.delete(emailVerificationToken.id),
      this.usersService.update(emailVerificationToken.userId, {
        isVerified: true
      })
    ]);
  }

  async loginWithCredentials(loginDto: LoginDto): Promise<string> {
    // find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new BadRequestException('Invalid credentials');
    // check isVerified
    if (!user.isVerified) throw new BadRequestException('Account not verified');
    // compare password
    const isMatch = await this.bcryptService.compare(
      loginDto.password,
      user.password ?? ''
    );
    if (!isMatch) throw new BadRequestException('Invalid credentials');
    // genereate access token
    const payload: JwtPayload = { sub: user.id, role: user.role as UserRole };
    return this.jwtService.signAsync(payload);
  }
}
