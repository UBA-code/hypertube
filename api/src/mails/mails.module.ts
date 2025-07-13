import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';

@Module({
  exports: [MailsService],
  providers: [MailsService],
})
export class MailsModule {}
