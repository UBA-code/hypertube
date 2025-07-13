import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class FortyTwoGuard extends AuthGuard('42') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
