import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordGuard extends AuthGuard('discord') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
