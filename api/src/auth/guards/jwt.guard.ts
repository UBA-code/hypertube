import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/skip-auth.decorator';
import { RevokedTokensService } from 'src/revoked-tokens/revoked-tokens.service';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    private revokedTokenService: RevokedTokensService,
    private reflector: Reflector,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const token = req.cookies['accessToken'];
    const isRevoked = await this.revokedTokenService.findOne({
      where: { token },
    });
    const decodedToken = await this.jwtService.decode(token);

    if (!token) {
      throw new UnauthorizedException();
    }

    if (isRevoked) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findOneBy({ id: decodedToken.sub });

    if (
      !user.verified &&
      req.originalUrl.startsWith('/auth/verify-email/') === false
    ) {
      console.log('-'.repeat(10));
      console.log('User is not verified');
      console.log('-'.repeat(10));
      req.res
        .status(401)
        .json({ redirectTo: `${process.env.CLIENT_URL}/check-email` });
      return false;
    }

    user.lastActive = new Date();

    await this.userService.saveUser(user);

    // Call super.canActivate and handle async result
    const result = super.canActivate(context); // Assuming this guard extends a base class
    if (result instanceof Observable) {
      return result.toPromise(); // Convert Observable to Promise
    }
    return result; // Handles boolean or Promise<boolean>
  }
}
