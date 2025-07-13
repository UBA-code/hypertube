import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/users.entity';
import AuthLoginInfoDto from './dto/auth-login-info.dto';
import { log } from 'console';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailsService,
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

  async createResetToken(user: User) {
    return await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.userName,
      },
      {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRATION,
      },
    );
  }

  async validateToken(token: string): Promise<boolean> {
    return (
      (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      })) !== null
    );
  }

  async validateResetToken(token: string): Promise<boolean> {
    return (
      (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      })) !== null
    );
  }

  async sendResetPassword(email: string) {
    const foundUsers = await this.usersService.findManyBy({
      email: email,
      authType: 'local',
    });
    if (!foundUsers.length) {
      log(`no users found with email ${email}`);
      return;
    }
    const user = foundUsers[0];

    const resetToken = await this.createResetToken(user);

    user.resetToken = resetToken;
    await this.usersService.saveUser(user);
    log(`sending email to ${user.email}`);
    await this.mailService.sendResetPasswordEmail(user.email, resetToken);
  }

  async resetPassowrd(token: string, newPassword: string) {
    if (!(await this.validateResetToken(token)))
      throw new BadRequestException('Invalid token');
    const { sub } = await this.jwtService.decode(token);
    const user = await this.usersService.findOneBy({
      id: sub,
      authType: 'local',
    });
    if (!user) {
      log(`no users found with id ${sub}`);
      return;
    }
    user.password = await this.usersService.hashPassword(newPassword);
    user.resetToken = '';
    await this.usersService.saveUser(user);
    log(
      `user ${user.userName} with email ${user.email} is change it's password`,
    );
    return { message: 'password changed successfuly' };
  }
}
