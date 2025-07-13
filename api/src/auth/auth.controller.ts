import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @SkipAuth()
  @Post('register')
  @ApiOperation({ summary: 'create new user' })
  @ApiResponse({
    status: 201,
    description: 'Return created user',
    type: userInfoDto,
  })
  @UseInterceptors(UploadInterceptor('avatar'))
  async createUser(
    @Res({ passthrough: true }) res: Response,
    @Body() user: UserDto,
    @UploadedFile(FileValidationPipe) file?: Express.Multer.File,
  ) {
    const { accessToken, user: newUser } = await this.usersService.create(
      user,
      file,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return plainToInstance(userInfoDto, newUser);
  }

  @SkipAuth()
  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalGuard)
  @ApiOperation({ summary: 'login user' })
  @ApiResponse({
    status: 200,
    description: 'Return access token and user info',
    type: userInfoDto,
  })
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = await this.authService.login(req.user as User);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return plainToInstance(userInfoDto, req['user']);
  }

  @Post('logout')
  @ApiOperation({ summary: 'logout user' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { message: 'Logout successful' };
  }

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

    return res.redirect(`${process.env.CLIENT_URL}/`);
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

    return res.redirect(`${process.env.CLIENT_URL}/`);
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
    console.log(req);
    res.cookie('accessToken', req['user']['accessToken'], {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.redirect(`${process.env.CLIENT_URL}/`);
  }

  @Get('profile')
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

  @SkipAuth()
  @Get('hello')
  getHello() {
    return 'Hello World!';
  }
}
