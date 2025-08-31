import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/users.entity';
import AuthLoginInfoDto from './dto/auth-login-info.dto';
import { log } from 'console';
import { MailsService } from 'src/mails/mails.service';
import { RevokedTokensService } from 'src/revoked-tokens/revoked-tokens.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailsService,
    private revokedTokensService: RevokedTokensService,
  ) {}

  async login(user: User): Promise<string> {
    return await this.createAccessToken(user);
  }

  async logout(userId: number, token: string) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['revokedTokens'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const decodedToken = await this.decodeToken(token);

    const revokedToken = this.revokedTokensService.createRevokedToken({
      user,
      token,
      type: 'accessToken',
      expiredAt: new Date(decodedToken.exp * 1000), // date constructor takes milliseconds
    });

    await this.revokedTokensService.saveRevokedToken(revokedToken);
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

  async decodeToken(token: string): Promise<any> {
    return await this.jwtService.decode(token);
  }

  async validateToken(token: string): Promise<boolean> {
    return (
      (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      })) !== null
    );
  }

  async validateResetToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      });
      return true;
    } catch {
      throw new BadRequestException('Invalid token, possibly expired');
    }
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
    const decodedToken = await this.jwtService.decode(token);

    user.password = await this.usersService.hashPassword(newPassword);

    const revokedToken = this.revokedTokensService.createRevokedToken({
      token,
      user,
      type: 'forget-password-token',
      expiredAt: new Date(decodedToken.exp * 1000),
    });

    await this.revokedTokensService.saveRevokedToken(revokedToken);
    await this.usersService.saveUser(user);
    log(
      `user ${user.userName} with email ${user.email} is change it's password`,
    );
    return { message: 'password changed successfuly' };
  }

  async sendVerificationMail(
    email: string,
    user: User,
    type: 'verification' | 'change',
  ) {
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.userName,
        email: email,
        type: type,
      },
      {
        secret: process.env.JWT_VERIFY_MAIL_SECRET,
        expiresIn: process.env.JWT_VERIFY_MAIL_EXPIRATION,
      },
    );

    await this.mailService.sendVerifyEmail(email, token);
    this.logger.log(`Verification email sent to ${email}`);
  }

  async verifyEmailByToken(userId: number, token: string) {
    const user = await this.usersService.findOneBy({ id: userId });

    const isRevoked = await this.revokedTokensService.findOne({
      where: { token },
    });

    if (isRevoked) {
      throw new BadRequestException('Invalid token');
    }

    try {
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_VERIFY_MAIL_SECRET,
      });
      const decodedToken = await this.jwtService.decode(token);
      if (decodedToken.sub !== user.id) {
        throw new BadRequestException('Invalid Token');
      }
      const revokedToken = await this.revokedTokensService.createRevokedToken({
        token,
        user,
        expiredAt: new Date(decodedToken.exp * 1000),
        type: 'email-verification-token',
      });

      user.verified = true;
      if (decodedToken.type === 'change') {
        user.email = decodedToken.email;
      }
      await this.usersService.saveUser(user);
      await this.revokedTokensService.saveRevokedToken(revokedToken);
    } catch {
      throw new BadRequestException('Invalid token');
    }
  }
}
