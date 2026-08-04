import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

export function calculatePlanHealthScore(input: {
  hasPeopleAndQueue: boolean;
  hasPropertyAccess: boolean;
  hasPets: boolean;
  hasWishes: boolean;
}) {
  return Object.values(input).filter(Boolean).length * 25;
}

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}
  async getByAccount(accountId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { accountId },
      include: {
        timer: true,
        queue: { orderBy: { position: "asc" } },
        property: {
          include: { _count: { select: { accessDetails: true } } },
        },
        _count: {
          select: { letters: true, people: true, pets: true, voiceMemos: true },
        },
      },
    });
    if (!plan) throw new NotFoundException("Plan not found.");
    const healthScore = calculatePlanHealthScore({
      hasPeopleAndQueue: plan._count.people > 0 && plan.queue.length > 0,
      hasPropertyAccess: Boolean(plan.property?._count.accessDetails),
      hasPets: plan._count.pets > 0,
      hasWishes: plan._count.letters + plan._count.voiceMemos > 0,
    });
    if (healthScore !== plan.healthScore) {
      await this.prisma.plan.update({
        where: { id: plan.id },
        data: { healthScore },
      });
    }
    return { ...plan, healthScore };
  }
  async update(
    accountId: string,
    data: {
      tier?: "friend_alert" | "attend_check" | "attend_check_pet" | "full";
      status?: "setup" | "protected" | "paused" | "trip_mode" | "alert_active";
    },
  ) {
    const plan = await this.prisma.plan.update({ where: { accountId }, data });
    if (data.status === "protected") {
      const current = await this.prisma.authorization.findFirst({ where: { accountId, kind: "response_queue" } });
      const authorizationData = { provider: "in_app_instruction", status: "active", metadata: { planId: plan.id, tier: plan.tier } };
      if (current) await this.prisma.authorization.update({ where: { id: current.id }, data: authorizationData });
      else await this.prisma.authorization.create({ data: { accountId, kind: "response_queue", ...authorizationData } });
    }
    await this.audit.append({
      actorId: accountId,
      actorRole: "user",
      eventType: "plan_change",
      entityType: "plan",
      entityId: plan.id,
      payload: data,
    });
    if (data.status === "protected") await this.audit.append({ actorId: accountId, actorRole: "user", eventType: "instruction_authorized", entityType: "plan", entityId: plan.id, payload: { tier: plan.tier } });
    return plan;
  }
}
