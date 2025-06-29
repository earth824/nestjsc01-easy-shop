import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { validateEnv } from '@/config/schema';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { envConfig } from '@/config/env.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { UploadModule } from './upload/upload.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [envConfig]
    }),
    AuthModule,
    UsersModule,
    EmailModule,
    ThrottlerModule.forRootAsync({
      inject: [envConfig.KEY],
      useFactory: (envConfigService: ConfigType<typeof envConfig>) => ({
        throttlers: [
          { ttl: envConfigService.TTL_MS, limit: envConfigService.TTL_LIMIT }
        ]
      })
    }),
    UploadModule,
    ProductsModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard }
  ]
})
export class AppModule {}
