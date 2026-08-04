import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue, Worker, type Job, type ConnectionOptions } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { TwilioAdapter } from "./twilio.adapter";
type Work = {
  kind: "expire" | "offline-expiry" | "sick-expiry" | "grace-complete" | "queue-step";
  planId: string;
  accountId?: string;
  incidentId?: string;
  position?: number;
};

type ScheduledJobKind = "expiry" | "sick" | "offline";

export function escalationJobId(kind: ScheduledJobKind, planId: string) {
  // BullMQ reserves colons in custom job IDs.
  return `${kind}-${planId}`;
}

@Injectable()
export class EscalationService implements OnModuleDestroy {
  private queue?: Queue;
  private worker?: Worker;
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly twilio: TwilioAdapter,
  ) {
    const value = this.config.get<string>("REDIS_URL");
    if (value) {
      const url = new URL(value);
      const connection: ConnectionOptions = {
        host: url.hostname,
        port: Number(url.port || 6379),
        password: url.password || undefined,
        maxRetriesPerRequest: null,
      };
      this.queue = new Queue("legacy-wolf-escalation", { connection });
      this.worker = new Worker(
        "legacy-wolf-escalation",
        (job: Job<Work>) => this.process(job),
        { connection },
      );
    }
  }
  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }
  async scheduleExpiry(planId: string, expiry: Date) {
    if (!this.queue) return;
    const jobId = escalationJobId("expiry", planId);
    const old = await this.queue.getJob(jobId);
    await old?.remove();
    await this.queue.add(
      "timer-expiry",
      { kind: "expire", planId },
      {
        jobId,
        delay: Math.max(0, expiry.getTime() - Date.now()),
        removeOnComplete: true,
      },
    );
  }
  async scheduleSick(planId: string) {
    if (!this.queue) return;
    const jobId = escalationJobId("sick", planId);
    const old = await this.queue.getJob(jobId);
    await old?.remove();
    await this.queue.add("sick-expiry", { kind: "sick-expiry", planId }, { jobId, delay: 3 * 60_000, removeOnComplete: true });
  }
  async scheduleOfflineDeadline(planId: string, accountId: string, lastSeenAt: Date, hours: number) {
    if (!this.queue) return;
    const jobId = escalationJobId("offline", planId);
    const old = await this.queue.getJob(jobId);
    await old?.remove();
    await this.queue.add("offline-expiry", { kind: "offline-expiry", planId, accountId }, { jobId, delay: Math.max(0, lastSeenAt.getTime() + hours * 3_600_000 - Date.now()), removeOnComplete: true });
  }
  async providerStatus(body: Record<string, string>) {
    const sid = body.MessageSid ?? body.CallSid;
    const status = body.MessageStatus ?? body.CallStatus ?? "unknown";
    if (sid) {
      const attempt = await this.prisma.escalationAttempt.findFirst({ where: { providerSid: sid } });
      if (attempt) {
        await this.prisma.escalationAttempt.update({ where: { id: attempt.id }, data: { status } });
        await this.audit.append({ eventType: "notification_delivery_updated", entityType: "incident", entityId: attempt.incidentId, payload: { channel: attempt.channel, status } });
      }
    }
    return { received: true };
  }
  async providerResponse(body: Record<string, string>) {
    const sid = body.CallSid;
    if (!sid || body.Digits !== "1") return;
    const attempt = await this.prisma.escalationAttempt.findFirst({ where: { providerSid: sid }, include: { incident: { include: { plan: { include: { timer: true } } } } } });
    if (!attempt) return;
    const now = new Date();
    const hours = attempt.incident.plan.timer?.intervalHours ?? 24;
    await this.prisma.$transaction([
      this.prisma.escalationAttempt.update({ where: { id: attempt.id }, data: { status: "responded", response: "safe" } }),
      this.prisma.incident.update({ where: { id: attempt.incidentId }, data: { status: "false_positive", outcome: "confirmed_safe", closedAt: now } }),
      this.prisma.plan.update({ where: { id: attempt.incident.planId }, data: { status: "protected" } }),
      this.prisma.motionTimer.update({ where: { planId: attempt.incident.planId }, data: { mode: "active", lastSignalAt: now, nextExpiryAt: new Date(now.getTime() + hours * 3_600_000) } }),
    ]);
    await this.audit.append({ eventType: "provider_safe_response", entityType: "incident", entityId: attempt.incidentId, payload: { channel: "voice" } });
  }
  private async process(job: Job<Work>) {
    if (job.data.kind === "expire") return this.expire(job.data.planId);
    if (job.data.kind === "offline-expiry" && job.data.accountId) return this.offlineExpire(job.data.planId, job.data.accountId);
    if (job.data.kind === "sick-expiry") return this.sickExpiry(job.data.planId);
    if (job.data.kind === "grace-complete" && job.data.incidentId)
      return this.beginQueue(job.data.incidentId);
    if (
      job.data.kind === "queue-step" &&
      job.data.incidentId &&
      job.data.position
    )
      return this.executeStep(job.data.incidentId, job.data.position);
  }
  private async offlineExpire(planId: string, accountId: string) {
    const [timer, device, existing] = await Promise.all([
      this.prisma.motionTimer.findUnique({ where: { planId } }),
      this.prisma.device.findFirst({ where: { accountId }, orderBy: { lastSeenAt: "desc" } }),
      this.prisma.incident.findFirst({ where: { planId, status: { notIn: ["resolved", "false_positive", "deceased"] } } }),
    ]);
    if (!timer || existing) return;
    const lastSeen = device?.lastSeenAt ?? timer.lastSignalAt;
    const deadline = lastSeen.getTime() + timer.offlineEscalationHours * 3_600_000;
    if (deadline > Date.now()) return this.scheduleOfflineDeadline(planId, accountId, lastSeen, timer.offlineEscalationHours);
    const incident = await this.prisma.incident.create({ data: { planId, trigger: "timer_expiry", status: "queue_executing" } });
    await this.prisma.plan.update({ where: { id: planId }, data: { status: "alert_active" } });
    await this.audit.append({ actorId: accountId, actorRole: "system", eventType: "offline_safety_deadline_reached", entityType: "incident", entityId: incident.id, payload: { offlineHours: timer.offlineEscalationHours, batteryRuleEnabled: timer.batteryRuleEnabled } });
    await this.beginQueue(incident.id);
  }
  private async sickExpiry(planId: string) {
    const timer = await this.prisma.motionTimer.findUnique({ where: { planId } });
    if (!timer || timer.mode !== "sick") return;
    const existing = await this.prisma.incident.findFirst({ where: { planId, status: { notIn: ["resolved", "false_positive", "deceased"] } } });
    if (existing) return;
    const incident = await this.prisma.incident.create({ data: { planId, trigger: "sick_mode", status: "queue_executing" } });
    await this.prisma.plan.update({ where: { id: planId }, data: { status: "alert_active" } });
    await this.audit.append({ eventType: "incident_opened", entityType: "incident", entityId: incident.id, payload: { trigger: "sick_mode" } });
    await this.beginQueue(incident.id);
  }
  private async expire(planId: string) {
    const timer = await this.prisma.motionTimer.findUnique({
      where: { planId },
    });
    if (
      !timer ||
      timer.mode !== "active" ||
      timer.nextExpiryAt.getTime() > Date.now()
    )
      return;
    const incident = await this.prisma.incident.create({
      data: { planId, trigger: "timer_expiry", status: "grace" },
    });
    await this.prisma.plan.update({
      where: { id: planId },
      data: { status: "alert_active" },
    });
    await this.audit.append({
      eventType: "incident_opened",
      entityType: "incident",
      entityId: incident.id,
      payload: { trigger: "timer_expiry" },
    });
    await this.queue?.add(
      "grace-complete",
      { kind: "grace-complete", planId, incidentId: incident.id },
      { delay: timer.graceMinutes * 60_000 },
    );
  }
  private async beginQueue(incidentId: string) {
    const permission = await this.prisma.incident.findUnique({ where: { id: incidentId }, include: { plan: { include: { account: { include: { authorizations: { where: { kind: "response_queue", status: "active" } } } } } } } });
    if (!permission) return;
    if (!permission.plan.account.authorizations.length) {
      await this.prisma.incident.update({ where: { id: incidentId }, data: { status: "resolved", outcome: "no_active_instruction", closedAt: new Date() } });
      await this.prisma.plan.update({ where: { id: permission.planId }, data: { status: "paused" } });
      await this.audit.append({ eventType: "escalation_blocked_no_instruction", entityType: "incident", entityId: incidentId });
      return;
    }
    const incident = await this.prisma.incident.update({
      where: { id: incidentId },
      data: { status: "queue_executing" },
      include: {
        plan: { include: { queue: { orderBy: { position: "asc" } } } },
      },
    });
    const first = incident.plan.queue[0];
    if (first)
      await this.queue?.add("queue-step", {
        kind: "queue-step",
        planId: incident.planId,
        incidentId,
        position: first.position,
      });
  }
  private async executeStep(incidentId: string, position: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        plan: {
          include: {
            account: true,
            queue: { where: { position }, include: { person: true } },
          },
        },
      },
    });
    const step = incident?.plan.queue[0];
    if (!incident || !step) return;
    if (incident.status !== "queue_executing") return;
    if (step.channel === "dispatch") {
      await this.offerResponder(incidentId);
      return;
    }
    const target = step.person?.phoneE164 ?? incident.plan.account.phoneE164 ?? "";
    const attempt = await this.prisma.escalationAttempt.create({
      data: {
        incidentId,
        stepId: step.id,
        channel: step.channel,
        target,
        status: "queued",
      },
    });
    try {
      let sid: string | undefined;
      const callback = `${this.config.get("PUBLIC_API_URL")}/v1/webhooks/twilio/status`;
      if (step.channel === "sms" || step.channel === "notify_contact")
        sid = (
          await this.twilio.sendSms(
            target,
            step.messageTemplate ??
              "Legacy Wolf is checking on the person who nominated you. Follow the instructions in your alert.",
            callback,
          )
        ).sid;
      else if (step.channel === "call")
        sid = (
          await this.twilio.call(
            target,
            `${this.config.get("PUBLIC_API_URL")}/v1/webhooks/twilio/voice`,
            callback,
          )
        ).sid;
      await this.prisma.escalationAttempt.update({
        where: { id: attempt.id },
        data: { providerSid: sid, status: sid ? "sent" : "queued" },
      });
    } catch {
      await this.prisma.escalationAttempt.update({
        where: { id: attempt.id },
        data: { status: "failed" },
      });
    }
    const next = await this.prisma.responseQueueStep.findUnique({
      where: {
        planId_position: { planId: incident.planId, position: position + 1 },
      },
    });
    if (next)
      await this.queue?.add(
        "queue-step",
        {
          kind: "queue-step",
          planId: incident.planId,
          incidentId,
          position: next.position,
        },
        { delay: step.waitMinutes * 60_000 },
      );
    else await this.offerResponder(incidentId);
  }

  private async offerResponder(incidentId: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id: incidentId }, include: { plan: { include: { property: true } } } });
    const address = incident?.plan.property?.address as { line1?: string } | undefined;
    if (!incident?.plan.property || address?.line1 === "Address confirmation required") {
      await this.audit.append({ eventType: "dispatch_blocked_missing_address", entityType: "incident", entityId: incidentId });
      return;
    }
    const shift = await this.prisma.responderShift.findFirst({
      where: { endedAt: null },
      orderBy: { lastSeenAt: "desc" },
    });
    if (!shift) {
      await this.audit.append({
        eventType: "dispatch_unavailable",
        entityType: "incident",
        entityId: incidentId,
      });
      return;
    }
    const dispatch = await this.prisma.dispatch.upsert({
      where: {
        incidentId_responderId: {
          incidentId,
          responderId: shift.responderId,
        },
      },
      create: { incidentId, responderId: shift.responderId },
      update: {},
    });
    await this.audit.append({
      eventType: "dispatch_offered",
      entityType: "dispatch",
      entityId: dispatch.id,
      payload: { incidentId, responderId: shift.responderId },
    });
  }
}
