import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './guards/jwt.guard';
import { FortyTwoStrategy } from './strategies/42.strategy';
import { GoogleAuthStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { MailsModule } from 'src/mails/mails.module';
import { RevokedTokensModule } from 'src/revoked-tokens/revoked-tokens.module';
import { GitlabStrategy } from './strategies/gitlab.strategy';
import { DiscordStrategy } from './strategies/discord.strategy';

@Module({
  exports: [AuthService],
  imports: [
    PassportModule,
    forwardRef(() => UsersModule),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    MailsModule,
    RevokedTokensModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FortyTwoStrategy,
    GoogleAuthStrategy,
    GithubStrategy,
    GitlabStrategy,
    DiscordStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
