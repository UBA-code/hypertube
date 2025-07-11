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
import { File, FileInterceptor } from '@nest-lab/fastify-multer';
import { UserDto } from 'src/users/dto/user.dto';
import { LocalGuard } from './guards/local.guard';

import { userInfoDto } from 'src/users/dto/user-info.dto';
import { plainToInstance } from 'class-transformer';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { FastifyReply, FastifyRequest as Request } from 'fastify';

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
  @UseInterceptors(FileInterceptor('avatar'))
  async createUser(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() user: UserDto,
    @UploadedFile() file?: File,
  ) {
    const { accessToken, user: newUser } = await this.usersService.create(
      user,
      file,
    );

    res.setCookie('accessToken', accessToken, {
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
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const accessToken = await this.authService.login(req['user']);

    res.setCookie('accessToken', accessToken, {
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
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.setCookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { message: 'Logout successful' };
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
