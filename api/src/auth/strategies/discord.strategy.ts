import { Strategy } from 'passport-discord';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK,
      scope: ['identify', 'email'],
    });
  }

  async validate(at: string, rt: string, profile: any) {
    const createdUser = new User();

    createdUser.authType = 'discord';
    createdUser.userName = profile.username;
    createdUser.profilePicture = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`;
    createdUser.email = profile.email;
    createdUser.firstName = profile.global_name || '';
    createdUser.lastName = '';
    createdUser.password = '-';

    const newUser = await this.usersService.findOneOrCreateByEmail(
      createdUser.email,
      createdUser,
    );
    const accessToken = await this.authService.createAccessToken(newUser);

    return { accessToken, user: newUser };
  }
}
