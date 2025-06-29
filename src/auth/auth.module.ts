import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '@/users/users.module';
import { BcryptService } from './services/bcrypt.service';
import { EmailVerificationTokensService } from './services/email-verification-tokens.service';
import { EmailModule } from '@/email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { envConfig } from '@/config/env.config';
import { ConfigType } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    EmailModule,
    JwtModule.registerAsync({
      inject: [envConfig.KEY],
      useFactory: (envConfigService: ConfigType<typeof envConfig>) => ({
        secret: envConfigService.JWT_SECRET,
        signOptions: { expiresIn: envConfigService.JWT_EXPIRES }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, BcryptService, EmailVerificationTokensService],
  exports: [JwtModule]
})
export class AuthModule {}
