import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async send(options: any, emails: string[]): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: emails,
        subject: options.subject,
        html: options.message,
        text: options.message,
      });
    } catch (err) {
      console.log(err);
    }
  }
}
