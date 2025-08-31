import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';
import { LocalGuard } from './guards/local.guard';
import { userInfoDto } from 'src/users/dto/user-info.dto';
import { plainToInstance } from 'class-transformer';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { FortyTwoGuard } from './guards/42.guard';
import { Request, Response } from 'express';
import { User } from 'src/users/users.entity';
import { FileValidationPipe } from 'src/pipes/FileValidationPipe';
import { UploadInterceptor } from 'src/interceptors/upload-interceptor';
import { GoogleGuard } from './guards/google.guard';
import { GithubGuard } from './guards/github.guard';
import { MailsService } from 'src/mails/mails.service';
import {
  EmailPayload,
  AuthResponse,
  ResetPasswordPayload,
} from './dto/auth.dto';

import { RevokedTokensService } from 'src/revoked-tokens/revoked-tokens.service';
import { GitlabGuard } from './guards/gitlab.guard';
import { DiscordGuard } from './guards/discord.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private revokedTokensService: RevokedTokensService,
    private authService: AuthService,
    private usersService: UsersService,
    private mailService: MailsService,
  ) {}

  @SkipAuth()
  @Post('register')
  @ApiOperation({ summary: 'create new user' })
  @ApiResponse({
    status: 201,
    description: 'Return created user',
    type: AuthResponse,
  })
  @UseInterceptors(UploadInterceptor('profilePicture'))
  async createUser(
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) user: UserDto,
    @UploadedFile(FileValidationPipe) file?: Express.Multer.File,
  ): Promise<AuthResponse> {
    try {
      const { accessToken, user: newUser } = await this.usersService.create(
        user,
        file,
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return {
        success: true,
        message: 'User created successfully',
        user: plainToInstance(userInfoDto, newUser),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SkipAuth()
  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalGuard)
  @ApiOperation({ summary: 'login user' })
  @ApiResponse({
    status: 200,
    description: 'Return access token and user info',
    type: AuthResponse,
  })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    try {
      const accessToken = await this.authService.login(req.user as User);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return {
        success: true,
        message: 'User logged in successfully',
        user: plainToInstance(userInfoDto, req['user']),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SkipAuth()
  @ApiOperation({ summary: 'send email with reset link' })
  @ApiResponse({
    status: 200,
    description:
      'the endpoint will return 200 either the email is found or not',
  })
  @HttpCode(200)
  @Post('forgot-password')
  async resetPassword(@Body(ValidationPipe) payload: EmailPayload) {
    return await this.authService.sendResetPassword(payload.email);
  }

  @SkipAuth()
  @ApiOperation({ summary: 'change password if the token is valid' })
  @Post('reset-password')
  async resetPasswordWithToken(
    @Body(ValidationPipe) payload: ResetPasswordPayload,
  ) {
    const isRevoked = await this.revokedTokensService.findOne({
      where: { token: payload.token },
    });

    if (isRevoked) {
      throw new UnauthorizedException('Invalid token');
    }

    return await this.authService.resetPassowrd(
      payload.token,
      payload.newPassword,
    );
  }

  @SkipAuth()
  @Post('logout')
  @ApiOperation({ summary: 'logout user' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req['user']) {
      await this.authService.logout(
        req['user']['id'],
        req.cookies['accessToken'],
      );
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { message: 'Logout successful' };
  }

  // ############## oauth strategies ##############

  @Get('42')
  @SkipAuth()
  @UseGuards(FortyTwoGuard)
  @ApiOperation({
    summary: 'login with 42, redirect to / after authentication',
  })
  async fortyTwoAuth() {}

  @Get('42/redirect')
  @SkipAuth()
  @UseGuards(FortyTwoGuard)
  async fortyTwoAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('accessToken', req['user']['accessToken'], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }

  @Get('google')
  @SkipAuth()
  @UseGuards(GoogleGuard)
  @ApiOperation({
    summary: 'login with google, redirect to / after authentication',
  })
  async GoogleAuth() {}

  @Get('google/redirect')
  @SkipAuth()
  @UseGuards(GoogleGuard)
  async GoogleAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('accessToken', req['user']['accessToken'], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }

  @Get('github')
  @SkipAuth()
  @UseGuards(GithubGuard)
  @ApiOperation({
    summary: 'login with github, redirect to / after authentication',
  })
  async GithubAuth() {}

  @Get('github/redirect')
  @SkipAuth()
  @UseGuards(GithubGuard)
  async GithubAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('accessToken', req['user']['accessToken'], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }

  @Get('gitlab')
  @SkipAuth()
  @UseGuards(GitlabGuard)
  async gitlabAuth() {}

  @Get('gitlab/redirect')
  @SkipAuth()
  @UseGuards(GitlabGuard)
  async gitlabAuthCallback(@Req() req: Request, @Res() res: Response) {
    res.cookie('accessToken', req['user']['accessToken'], {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }

  @Get('discord')
  @SkipAuth()
  @UseGuards(DiscordGuard)
  async discordAuth() {}

  @Get('discord/redirect')
  @SkipAuth()
  @UseGuards(DiscordGuard)
  async discordAuthCallback(@Req() req: Request, @Res() res: Response) {
    res.cookie('accessToken', req['user']['accessToken'], {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }

  @Get('me')
  @ApiOperation({ summary: 'get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return user profile',
    type: userInfoDto,
  })
  async getProfile(@Req() req: Request) {
    const user = await this.usersService.findById(req['user']['id']);

    return plainToInstance(userInfoDto, user);
  }

  @Post('send-verification-mail')
  @ApiOperation({ summary: 'send verification mail to user' })
  async sendVerificationMail(@Req() req: Request) {
    const user = await this.usersService.findOneBy({ id: req['user']['id'] });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verified) {
      throw new BadRequestException('User is already verified');
    }

    return await this.authService.sendVerificationMail(
      user.email,
      user,
      'verification',
    );
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'verify email' })
  async verifyEmail(@Param('token') token: string, @Req() req: Request) {
    return await this.authService.verifyEmailByToken(req['user']['id'], token);
  }

  @Get('isVerified')
  async isVerified(@Req() req: Request) {
    const user = await this.usersService.findOneBy({ id: req['user']['id'] });

    if (!user) throw new NotFoundException('User not found');
    return { isVerified: user.verified };
  }
}
