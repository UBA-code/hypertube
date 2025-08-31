import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailsModule } from 'src/mails/mails.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    MailsModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
