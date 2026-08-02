import { SetMetadata } from "@nestjs/common";
import type { AccountRole } from "@prisma/client";

export const ROLES_KEY = "required_roles";
export const Roles = (...roles: AccountRole[]) => SetMetadata(ROLES_KEY, roles);
