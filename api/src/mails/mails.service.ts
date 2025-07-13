import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { log } from 'console';

@Injectable()
export class MailsService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string) {
    const command = new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      Message: {
        Body: { Html: { Charset: 'UTF-8', Data: body } },
        Subject: { Charset: 'UTF-8', Data: subject },
      },
      Source: process.env.AWS_SENDER_EMAIL,
    });

    try {
      await this.sesClient.send(command);
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const subject = 'Reset Password';
    const body = `
      <p>Dear user,</p>
      <p>Please click the following link to reset your password:</p>
      <a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset Password</a>
      <p style={{color: red;}}>Notice: this link will be valid for 10 minutes.</p>
      <p>If you did not request this email, please ignore it.</p>
    `;

    await this.sendEmail(email, subject, body);
    log(`email has been sent to ${email}`);
  }
}
