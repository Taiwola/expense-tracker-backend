import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailService: MailerService) {}

  async sendResetPassword(email: string, resetLink: string): Promise<boolean> {
    try {
      await this.mailService.sendMail({
        to: email,
        from: process.env.AUTH_EMAIL as string,
        subject: 'Reset Password Link for Your Account',
        html: `<p>Please click on the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      });
      
      console.log('Mail sent successfully');
      return true; // Return success
    } catch (error) {
      console.error('Mail Error: ', error);
      throw new HttpException(
        'Mail not sent',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  
  async sendWelcomeMail(email: string) {
    const message = `Hi! Welcome to our platform ${process.env.APP_NAME}.
    We are glad you joined us and we hope that your experience with us will be pleasant
    If there is anything else I can help you with please let me know`;

    try {
      await this.mailService.sendMail({
        to: email,
        from: process.env.AUTH_EMAIL as string,
        subject: `${process.env.APP_NAME}: Thank You For Joining Us`,
        text: message,
      });
    } catch (error) {
      console.log('Mail Error: ', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
