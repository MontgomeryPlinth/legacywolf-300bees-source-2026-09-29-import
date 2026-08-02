import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AccountRole } from "@prisma/client";
import { ROLES_KEY } from "./roles.decorator";

interface RoleRequest { auth?: { accountId: string; roles: string[] } }

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<AccountRole[]>(ROLES_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!required?.length) return true;
    const roles = context.switchToHttp().getRequest<RoleRequest>().auth?.roles ?? [];
    if (required.some((role) => roles.includes(role))) return true;
    throw new ForbiddenException("Your account is not authorized for this operation.");
  }
}
