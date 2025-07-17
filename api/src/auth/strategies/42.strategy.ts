import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';
import intraUser from 'src/types/intraUser';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super({
      clientID: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
      callbackURL: process.env.FORTY_TWO_CALLBACK,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<{ accessToken: string; user: User }> {
    const intraUser: intraUser = profile._json;
    const user = await this.usersService.createUser();

    user.email = intraUser.email;
    user.firstName = intraUser.first_name;
    user.lastName = intraUser.last_name;
    user.profilePicture = profile._json.image.versions.medium;
    user.authType = '42';
    user.password = '-';
    user.userName = intraUser.login;

    const createdUser = await this.usersService.findOneOrCreateByUsername(
      user.userName,
      user,
    );
    const token = await this.authService.createAccessToken(createdUser);
    return { accessToken: token, user: createdUser };
  }
}
