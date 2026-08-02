import { Body, Controller, Get, Patch } from "@nestjs/common";
import { z } from "zod";
import { PlansService } from "./plans.service";
import { CurrentAccountId } from "../auth/current-account.decorator";
const patch = z.object({
  tier: z
    .enum(["friend_alert", "attend_check", "attend_check_pet", "full"])
    .optional(),
  status: z
    .enum(["setup", "protected", "paused", "trip_mode", "alert_active"])
    .optional(),
});
@Controller("plan")
export class PlansController {
  constructor(private readonly plans: PlansService) {}
  @Get() get(@CurrentAccountId() id: string) {
    return this.plans.getByAccount(id);
  }
  @Patch() update(@CurrentAccountId() id: string, @Body() body: unknown) {
    return this.plans.update(id, patch.parse(body));
  }
}
