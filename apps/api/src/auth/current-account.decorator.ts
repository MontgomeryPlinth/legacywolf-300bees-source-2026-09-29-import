import { createParamDecorator, ExecutionContext } from "@nestjs/common";
interface AuthRequest {
  auth?: { accountId: string; roles: string[] };
}
export const CurrentAccountId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return request.auth?.accountId;
  },
);
