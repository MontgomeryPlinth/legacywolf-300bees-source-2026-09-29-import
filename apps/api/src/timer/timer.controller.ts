import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { z } from "zod";
import { TimerService } from "./timer.service";
import { CurrentAccountId } from "../auth/current-account.decorator";
const update = z.object({
  intervalHours: z.number().int().min(4).max(72).optional(),
  graceMinutes: z.number().int().min(1).max(240).optional(),
  monitoringStrategy: z.enum(["motion", "check_in"]).optional(),
  cancelEscalationOnMovement: z.boolean().optional(),
});
const heartbeat = z.object({
  deviceId: z.string().uuid(),
  recordedAt: z.string().datetime(),
  signalType: z.enum(["motion", "checkin", "app_open"]),
  nonce: z.string().min(16),
  signature: z.string().min(16),
});
const mode = z.object({
  mode: z.enum(["active", "paused", "trip", "sick", "drill"]),
  modeUntil: z.string().datetime().nullable().optional(),
  modeReason: z.string().nullable().optional(),
  intervalHours: z.number().int().min(1).max(72).optional(),
});
const batteryRule = z.object({ enabled: z.boolean(), behaviour: z.enum(["suppress", "respond", "alert_contact"]), offlineEscalationHours: z.number().int().min(4).max(168) });
@Controller("timer")
export class TimerController {
  constructor(private readonly timer: TimerService) {}
  @Get() get(@CurrentAccountId() id: string) {
    return this.timer.get(id);
  }
  @Patch() update(@CurrentAccountId() id: string, @Body() body: unknown) {
    return this.timer.update(id, update.parse(body));
  }
  @Post("heartbeat") heartbeat(
    @CurrentAccountId() id: string,
    @Body() body: unknown,
  ) {
    return this.timer.heartbeat(id, heartbeat.parse(body));
  }
  @Post("check-in") checkIn(@CurrentAccountId() id: string) {
    return this.timer.checkIn(id);
  }
  @Post("mode") setMode(
    @CurrentAccountId() id: string,
    @Body() body: unknown,
  ) {
    return this.timer.setMode(id, mode.parse(body));
  }
  @Patch("battery-rule") updateBatteryRule(@CurrentAccountId() id: string, @Body() body: unknown) {
    return this.timer.updateBatteryRule(id, batteryRule.parse(body));
  }
}
