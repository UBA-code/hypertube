import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class GithubGuard extends AuthGuard('github') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
