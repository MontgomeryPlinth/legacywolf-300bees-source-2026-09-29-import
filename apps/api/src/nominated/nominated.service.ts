import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
@Injectable()
export class NominatedService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  plans(accountId: string) {
    return this.prisma.person.findMany({ where: { linkedAccount: accountId }, select: { id: true, name: true, relationship: true, roles: true, verification: true, instructions: true, plan: { select: { id: true, status: true, tier: true, account: { select: { preferredName: true, legalName: true } } } } } });
  }
  incidents(accountId: string) {
    return this.prisma.incident.findMany({ where: { status: { notIn: ["resolved", "false_positive", "deceased"] }, plan: { people: { some: { linkedAccount: accountId } } } }, select: { id: true, status: true, trigger: true, openedAt: true, plan: { select: { account: { select: { preferredName: true, legalName: true } }, people: { where: { linkedAccount: accountId }, select: { instructions: true, roles: true } }, pets: { select: { name: true, species: true, routine: true, medical: true } } } } }, orderBy: { openedAt: "desc" } });
  }
  async safe(accountId: string, incidentId: string) {
    const incident = await this.prisma.incident.findFirst({ where: { id: incidentId, status: { notIn: ["resolved", "false_positive", "deceased"] }, plan: { people: { some: { linkedAccount: accountId } } } }, include: { plan: { include: { timer: true } } } });
    if (!incident) throw new ForbiddenException();
    const now = new Date(); const hours = incident.plan.timer?.intervalHours ?? 24;
    await this.prisma.$transaction([
      this.prisma.incident.update({ where: { id: incidentId }, data: { status: "false_positive", outcome: "contact_confirmed_safe", closedAt: now } }),
      this.prisma.plan.update({ where: { id: incident.planId }, data: { status: "protected" } }),
      this.prisma.motionTimer.update({ where: { planId: incident.planId }, data: { mode: "active", lastSignalAt: now, nextExpiryAt: new Date(now.getTime() + hours * 3_600_000) } }),
    ]);
    await this.audit.append({ actorId: accountId, actorRole: "nominated_contact", eventType: "contact_confirmed_safe", entityType: "incident", entityId: incidentId });
    return { resolved: true };
  }
}
