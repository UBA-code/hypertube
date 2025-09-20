import { Strategy } from 'passport-gitlab2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class GitlabStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    super({
      clientID: process.env.GITLAB_APP_ID,
      clientSecret: process.env.GITLAB_APP_SECRET,
      callbackURL: process.env.GITLAB_CALLBACK,
      scope: ['api'],
    });
  }

  async validate(at, rt, profile) {
    const user = new User();
    user.userName = profile.username;
    user.profilePicture = profile.avatar_url;
    user.email = profile._json.email;
    user.firstName = profile._json.name.split(' ')[0] || profile.username;
    user.lastName = profile._json.name.split(' ')[1] || '';
    user.password = '-';
    user.authType = 'gitlab';

    const createdUser = await this.usersService.findOneOrCreateByUsername(
      user.userName,
      user,
    );

    const accessToken = await this.authService.createAccessToken(createdUser);

    return { accessToken, user: createdUser };
  }
}
