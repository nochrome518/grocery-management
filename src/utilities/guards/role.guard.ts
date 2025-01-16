import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { UserType } from 'src/models/enums/user-type.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const isAdminRoute = this.reflector.get<boolean>('isAdminRoute', context.getHandler());

    if (!isAdminRoute || user.role === UserType.Admin) {
      return true;
    }

    throw new UnauthorizedException(`Access denied for user: ${user.email} with userType: ${user.role}`);
  }
}
