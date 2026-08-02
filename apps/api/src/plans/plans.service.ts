import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}
  async getByAccount(accountId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { accountId },
      include: { timer: true, queue: { orderBy: { position: "asc" } } },
    });
    if (!plan) throw new NotFoundException("Plan not found.");
    return plan;
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
