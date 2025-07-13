import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/users.entity';
import AuthLoginInfoDto from './dto/auth-login-info.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: User): Promise<string> {
    return await this.createAccessToken(user);
  }

  /**
   * Validates the user credentials.
   * @param loginInfo - The login information containing username and password.
   * @returns The user if credentials are valid.
   * @throws BadRequestException if the credentials are invalid.
   */
  async validateUser(loginInfo: AuthLoginInfoDto): Promise<User> {
    const user = await this.usersService.findByUserName(loginInfo.userName);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!(await bcrypt.compare(loginInfo.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  async createAccessToken(user: User): Promise<string> {
    console.log('='.repeat(50));
    console.log(
      `creating token with user ${user.id} and username ${user.userName}`,
    );
    return await this.jwtService.signAsync({
      sub: user.id,
      username: user.userName,
    });
  }

  async validateToken(token: string): Promise<boolean> {
    return (
      (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      })) !== null
    );
  }

  async createRefreshToken(user: User): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.userName,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      },
    );
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.usersService.findByUserName(payload.username);

      if (!user) {
        throw new UnauthorizedException();
      }

      const newPayload = { username: user.userName, sub: user.id };
      return {
        accessToken: await this.jwtService.signAsync(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
