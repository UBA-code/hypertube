import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User]), MailsModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
