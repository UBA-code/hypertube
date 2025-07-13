import { Strategy } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';
import GitHubUser from 'src/types/githubUser';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GitHubUser,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.usersService.createUser();
    const userObj = profile._json;

    user.email = profile.emails[0]?.value;
    user.firstName = userObj.name;
    user.lastName = '';
    user.avatar = userObj.avatar_url;
    user.authType = 'github';
    user.password = '-';
    user.userName = userObj.login;

    const createdUser = await this.usersService.findOneOrCreateByUsername(
      user.userName,
      user,
    );
    const token = await this.authService.createAccessToken(createdUser);
    return { accessToken: token, user: createdUser };
  }
}
