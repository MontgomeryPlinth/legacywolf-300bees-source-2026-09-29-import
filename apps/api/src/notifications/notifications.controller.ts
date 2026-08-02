import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentAccountId } from "../auth/current-account.decorator";
import { NotificationsService } from "./notifications.service";

const token = z.object({ deviceId: z.string().uuid(), pushToken: z.string().min(10).max(512) });
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}
  @Post("device") register(@CurrentAccountId() accountId: string, @Body() body: unknown) {
    return this.notifications.register(accountId, token.parse(body));
  }
}
