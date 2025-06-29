import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyEmail(email: string, link: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your email to unlock your account',
      template: './verify-email',
      context: {
        link
      }
    });
  }
}
