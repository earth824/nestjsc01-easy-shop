import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { envConfig } from '@/config/env.config';
import { ConfigType } from '@nestjs/config';
import * as path from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [envConfig.KEY],
      useFactory: (envConfigService: ConfigType<typeof envConfig>) => ({
        transport: {
          host: envConfigService.SMTP_HOST,
          port: envConfigService.SMTP_PORT,
          secure: false,
          auth: {
            user: envConfigService.SMTP_USERNAME,
            pass: envConfigService.SMTP_PASSWORD
          }
        },
        defaults: {
          from: 'Easy shop <no-reply@easyshop.com>'
        },
        template: {
          dir: path.join(__dirname, 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false
          }
        }
      })
    })
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
