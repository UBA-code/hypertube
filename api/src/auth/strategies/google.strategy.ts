import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import GoogleUser from 'src/types/googleUser';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleUser,
  ): Promise<any> {
    const user = await this.usersService.createUser();
    user.email = profile._json.email;
    user.firstName = profile._json.given_name || '';
    user.lastName = profile._json.family_name || '';
    user.profilePicture = profile._json.picture;
    user.authType = 'google';
    user.password = '-';
    user.userName =
      profile.displayName || this.generateNameFromEmail(user.email);

    const createdUser = await this.usersService.findOneOrCreateByEmail(
      user.email,
      user,
    );
    const token = await this.authService.createAccessToken(createdUser);
    return { accessToken: token, user: createdUser };
  }
  generateNameFromEmail(email: string): string {
    const name = email.split('@')[0];
    return name.replace(/[^a-zA-Z0-9]/g, ''); // Remove special characters
  }
}
