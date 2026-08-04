import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { createPublicKey, verify } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { EscalationService } from "../escalation/escalation.service";
@Injectable()
export class TimerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly escalation: EscalationService,
  ) {}
  async get(accountId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { accountId },
      include: { timer: true },
    });
    if (!plan?.timer) throw new NotFoundException("Motion Timer not found.");
    return plan.timer;
  }
  async update(
    accountId: string,
    input: { intervalHours?: number; graceMinutes?: number; monitoringStrategy?: "motion" | "check_in"; cancelEscalationOnMovement?: boolean },
  ) {
    const current = await this.get(accountId);
    const nextExpiryAt = new Date(
      current.lastSignalAt.getTime() + (input.intervalHours ?? current.intervalHours) * 3_600_000,
    );
    const timer = await this.prisma.motionTimer.update({
      where: { planId: current.planId },
      data: { ...input, nextExpiryAt },
    });
    await this.escalation.scheduleExpiry(timer.planId, timer.nextExpiryAt);
    await this.audit.append({
      actorId: accountId,
      actorRole: "user",
      eventType: "timer_change",
      entityType: "plan",
      entityId: timer.planId,
      payload: input,
    });
    return timer;
  }
  async heartbeat(
    accountId: string,
    input: {
      deviceId: string;
      recordedAt: string;
      signalType: "motion" | "checkin" | "app_open";
      nonce: string;
      signature: string;
    },
  ) {
    const device = await this.prisma.device.findFirst({
      where: { id: input.deviceId, accountId },
    });
    if (!device) throw new UnauthorizedException("Device is not registered.");
    if (!device.monitoringSource) {
      const nominated = await this.prisma.device.findFirst({
        where: { accountId, monitoringSource: true },
      });
      if (nominated)
        throw new UnauthorizedException(
          "This is not the account’s nominated monitoring device.",
        );
      await this.prisma.device.update({
        where: { id: device.id },
        data: { monitoringSource: true },
      });
    }
    const message = Buffer.from(
      `${input.deviceId}.${input.recordedAt}.${input.signalType}.${input.nonce}`,
    );
    const valid = verify(
      null,
      message,
      createPublicKey(device.devicePubkey),
      Buffer.from(input.signature, "base64"),
    );
    if (!valid)
      throw new UnauthorizedException("Heartbeat signature is invalid.");
    const current = await this.get(accountId);
    const receivedAt = new Date();
    const nextExpiryAt = new Date(
      receivedAt.getTime() + current.intervalHours * 3_600_000,
    );
    await this.prisma.$transaction([
      this.prisma.heartbeat.create({
        data: {
          accountId,
          deviceId: input.deviceId,
          recordedAt: new Date(input.recordedAt),
          signalType: input.signalType,
          nonce: input.nonce,
          signature: input.signature,
        },
      }),
      this.prisma.motionTimer.update({
        where: { planId: current.planId },
        data: { lastSignalAt: receivedAt, nextExpiryAt },
      }),
      this.prisma.device.update({
        where: { id: device.id },
        data: { lastSeenAt: receivedAt },
      }),
    ]);
    if (input.signalType === "motion" && current.cancelEscalationOnMovement) {
      const incident = await this.prisma.incident.findFirst({ where: { planId: current.planId, status: { notIn: ["resolved", "false_positive", "deceased"] } } });
      if (incident) {
        await this.prisma.$transaction([
          this.prisma.incident.update({ where: { id: incident.id }, data: { status: "false_positive", outcome: "movement_resumed", closedAt: receivedAt } }),
          this.prisma.plan.update({ where: { id: current.planId }, data: { status: "protected" } }),
        ]);
        await this.audit.append({ actorId: accountId, actorRole: "system", eventType: "escalation_cancelled_on_movement", entityType: "incident", entityId: incident.id });
      }
    }
    await this.escalation.scheduleExpiry(current.planId, nextExpiryAt);
    await this.escalation.scheduleOfflineDeadline(current.planId, accountId, receivedAt, current.offlineEscalationHours);
    return { lastSignalAt: receivedAt, nextExpiryAt };
  }
  async checkIn(accountId: string) {
    const current = await this.get(accountId);
    const lastSignalAt = new Date();
    const nextExpiryAt = new Date(
      lastSignalAt.getTime() + current.intervalHours * 3_600_000,
    );
    const timer = await this.prisma.motionTimer.update({
      where: { planId: current.planId },
      data: {
        lastSignalAt,
        nextExpiryAt,
        mode: "active",
        modeUntil: null,
        modeReason: null,
      },
    });
    await this.prisma.plan.update({
      where: { id: current.planId },
      data: { status: "protected" },
    });
    await this.escalation.scheduleExpiry(current.planId, nextExpiryAt);
    await this.audit.append({
      actorId: accountId,
      actorRole: "user",
      eventType: "checkin",
      entityType: "plan",
      entityId: current.planId,
    });
    return timer;
  }
  async setMode(
    accountId: string,
    input: {
      mode: "active" | "paused" | "trip" | "sick" | "drill";
      modeUntil?: string | null;
      modeReason?: string | null;
      intervalHours?: number;
    },
  ) {
    const current = await this.get(accountId);
    const timer = await this.prisma.motionTimer.update({
      where: { planId: current.planId },
      data: {
        mode: input.mode,
        modeUntil: input.modeUntil ? new Date(input.modeUntil) : null,
        modeReason: input.modeReason ?? null,
        intervalHours: input.intervalHours ?? current.intervalHours,
      },
    });
    await this.prisma.plan.update({
      where: { id: current.planId },
      data: {
        status:
          input.mode === "active"
            ? "protected"
            : input.mode === "trip"
              ? "trip_mode"
              : "paused",
      },
    });
    await this.audit.append({
      actorId: accountId,
      actorRole: "user",
      eventType: "timer_mode",
      entityType: "plan",
      entityId: current.planId,
      payload: { mode: input.mode },
    });
    if (input.mode === "sick") await this.escalation.scheduleSick(current.planId);
    return timer;
  }
  async updateBatteryRule(accountId: string, input: { enabled: boolean; behaviour: "suppress" | "respond" | "alert_contact"; offlineEscalationHours: number }) {
    const current = await this.get(accountId);
    const timer = await this.prisma.motionTimer.update({ where: { planId: current.planId }, data: { batteryRuleEnabled: input.enabled, batteryBehaviour: input.behaviour, offlineEscalationHours: input.offlineEscalationHours } });
    const device = await this.prisma.device.findFirst({ where: { accountId }, orderBy: { lastSeenAt: "desc" } });
    await this.escalation.scheduleOfflineDeadline(current.planId, accountId, device?.lastSeenAt ?? new Date(), input.offlineEscalationHours);
    await this.audit.append({ actorId: accountId, actorRole: "user", eventType: "battery_rule_updated", entityType: "plan", entityId: current.planId, payload: input });
    return timer;
  }
}
