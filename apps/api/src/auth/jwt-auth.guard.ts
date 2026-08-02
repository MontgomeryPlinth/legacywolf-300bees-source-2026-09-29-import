import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { jwtVerify } from "jose";
import { IS_PUBLIC } from "./public.decorator";
interface AuthRequest {
  headers: { authorization?: string };
  auth?: { accountId: string; roles: string[] };
}
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext) {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    const secret = this.config.get<string>("JWT_SECRET");
    if (!token || !secret) throw new UnauthorizedException();
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        {
          issuer: this.config.get("JWT_ISSUER", "legacy-wolf-api"),
          audience: this.config.get("JWT_AUDIENCE", "legacy-wolf-app"),
        },
      );
      if (!payload.sub) throw new Error("missing subject");
      request.auth = {
        accountId: payload.sub,
        roles: Array.isArray(payload.roles)
          ? payload.roles.filter(
              (role): role is string => typeof role === "string",
            )
          : [],
      };
      return true;
    } catch {
      throw new UnauthorizedException("Session is invalid or expired.");
    }
  }
}
