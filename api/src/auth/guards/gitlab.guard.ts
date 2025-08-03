import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GitlabGuard extends AuthGuard('gitlab') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
