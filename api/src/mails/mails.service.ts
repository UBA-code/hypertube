import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { log } from 'console';

@Injectable()
export class MailsService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(MailsService.name);
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_FROM,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string) {
    const mailOptions = {
      from: process.env.GMAIL_FROM,
      to: to,
      subject: subject,
      html: body,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      log('Email sent successfully:', result.messageId);
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new BadRequestException('Failed to send email');
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

  async sendVerifyEmail(email: string, token: string) {
    const subject = 'Verify your email';
    const body = `
      <p>Dear user,</p>
      <p>Please click the following link to verify your email:</p>
      <a href="${process.env.CLIENT_URL}/verify-email/${token}">Verify Email</a>
      <p style={{color: red;}}>Notice: this link will be valid for 10 minutes.</p>
      <p>If you did not request this email, please ignore it.</p>
    `;

    await this.sendEmail(email, subject, body);
    this.logger.log(`email has been sent to ${email}`);
  }
}
