import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { AccountRole, AccountStatus, IncidentStatus, Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { FieldCryptoService } from "../crypto/field-crypto.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService, private readonly crypto: FieldCryptoService) {}

  dispatches(responderId: string) {
    return this.prisma.dispatch.findMany({ where: { responderId }, include: { incident: { include: { plan: { include: { property: true, people: true, pets: true } } } } }, orderBy: { offeredAt: "desc" } });
  }

  currentShift(responderId: string) {
    return this.prisma.responderShift.findFirst({ where: { responderId, endedAt: null }, orderBy: { startedAt: "desc" } });
  }

  async startShift(responderId: string, location: { latitude?: number; longitude?: number }) {
    const current = await this.currentShift(responderId);
    if (current) return current;
    return this.prisma.responderShift.create({ data: { responderId, lastLat: location.latitude, lastLng: location.longitude } });
  }

  async endShift(responderId: string) {
    const current = await this.currentShift(responderId);
    if (!current) throw new NotFoundException("No active shift.");
    return this.prisma.responderShift.update({ where: { id: current.id }, data: { endedAt: new Date() } });
  }

  async transitionDispatch(responderId: string, id: string, next: "accepted" | "on_scene") {
    const dispatch = await this.prisma.dispatch.findFirst({ where: { id, responderId } });
    if (!dispatch) throw new NotFoundException();
    if ((next === "accepted" && dispatch.status !== "offered") || (next === "on_scene" && dispatch.status !== "accepted")) throw new ForbiddenException("Dispatch transition is not valid.");
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dispatch.update({ where: { id }, data: next === "accepted" ? { status: next, acceptedAt: now } : { status: next, arrivedAt: now } });
      await tx.incident.update({ where: { id: dispatch.incidentId }, data: { status: next === "accepted" ? "dispatched" : "on_scene" } });
      return updated;
    });
  }

  async report(responderId: string, incidentId: string, input: { outcome: string; notes?: string | null; actions: string[] }) {
    const dispatch = await this.prisma.dispatch.findFirst({ where: { incidentId, responderId, status: { in: ["accepted", "on_scene"] } } });
    if (!dispatch) throw new ForbiddenException("Only the assigned responder can report this incident.");
    const now = new Date();
    const report = await this.prisma.$transaction(async (tx) => {
      const created = await tx.incidentReport.upsert({ where: { incidentId }, create: { incidentId, responderId, ...input }, update: { ...input, responderId, submittedAt: now } });
      await tx.dispatch.update({ where: { id: dispatch.id }, data: { status: "completed", completedAt: now } });
      await tx.incident.update({ where: { id: incidentId }, data: { status: "resolved", outcome: input.outcome, closedAt: now } });
      return created;
    });
    await this.audit.append({ actorId: responderId, actorRole: "responder", eventType: "incident_report_submitted", entityType: "incident", entityId: incidentId });
    return report;
  }

  async reveal(actorId: string, accessDetailId: string, input: { incidentId: string; reason: string }) {
    const [detail, actor] = await Promise.all([
      this.prisma.accessDetail.findUnique({ where: { id: accessDetailId }, include: { property: true } }),
      this.prisma.account.findUnique({ where: { id: actorId }, include: { roles: true } }),
    ]);
    if (!detail || !actor) throw new NotFoundException();
    const admin = actor.roles.some((item) => item.role === "admin");
    const incident = await this.prisma.incident.findFirst({ where: { id: input.incidentId, planId: detail.property.planId, status: { notIn: ["resolved", "false_positive", "deceased"] }, ...(admin ? {} : { dispatches: { some: { responderId: actorId, status: { in: ["accepted", "on_scene"] } } } }) } });
    if (!incident) throw new ForbiddenException("An active assigned incident is required to reveal access details.");
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    await this.prisma.accessDecryption.create({ data: { accessDetailId, incidentId: incident.id, actorId, reason: input.reason, expiresAt } });
    await this.audit.append({ actorId, actorRole: admin ? "admin" : "responder", eventType: "access_detail_revealed", entityType: "access_detail", entityId: accessDetailId, payload: { incidentId: incident.id, reason: input.reason } });
    return { fieldName: detail.fieldName, plaintext: this.crypto.decrypt(detail), expiresAt };
  }

  async dashboard() {
    const [users, responders, activeIncidents, protectedPlans] = await Promise.all([
      this.prisma.account.count(), this.prisma.accountRoleGrant.count({ where: { role: "responder" } }),
      this.prisma.incident.count({ where: { status: { notIn: ["resolved", "false_positive", "deceased"] } } }),
      this.prisma.plan.count({ where: { status: "protected" } }),
    ]);
    return { users, responders, activeIncidents, protectedPlans };
  }

  incidents(status?: string) {
    const allowed: IncidentStatus[] = ["grace", "outreach", "queue_executing", "dispatched", "on_scene", "resolved", "false_positive", "deceased"];
    const where = status && allowed.includes(status as IncidentStatus) ? { status: status as IncidentStatus } : {};
    return this.prisma.incident.findMany({ where, include: { plan: { include: { account: { select: { id: true, preferredName: true, legalName: true } } } }, dispatches: true, report: true }, orderBy: { openedAt: "desc" }, take: 200 });
  }

  accounts(query?: string, responders = false) {
    const search: Prisma.AccountWhereInput = query ? { OR: [{ email: { contains: query, mode: "insensitive" } }, { phoneE164: { contains: query } }, { legalName: { contains: query, mode: "insensitive" } }, { preferredName: { contains: query, mode: "insensitive" } }] } : {};
    return this.prisma.account.findMany({ where: { ...search, ...(responders ? { roles: { some: { role: "responder" } } } : {}) }, select: { id: true, email: true, phoneE164: true, legalName: true, preferredName: true, status: true, roles: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 200 });
  }

  async setAccountStatus(actorId: string, id: string, status: AccountStatus) {
    if (actorId === id && status !== "active") throw new ForbiddenException("You cannot suspend your own admin account.");
    const account = await this.prisma.account.update({ where: { id }, data: { status } });
    await this.audit.append({ actorId, actorRole: "admin", eventType: "account_status_changed", entityType: "account", entityId: id, payload: { status } });
    return account;
  }

  async setRole(actorId: string, accountId: string, input: { role: AccountRole; enabled: boolean }) {
    if (actorId === accountId && input.role === "admin" && !input.enabled) throw new ForbiddenException("You cannot remove your own admin role.");
    if (input.enabled) await this.prisma.accountRoleGrant.upsert({ where: { accountId_role: { accountId, role: input.role } }, create: { accountId, role: input.role }, update: {} });
    else await this.prisma.accountRoleGrant.deleteMany({ where: { accountId, role: input.role } });
    await this.audit.append({ actorId, actorRole: "admin", eventType: "account_role_changed", entityType: "account", entityId: accountId, payload: input });
    return this.prisma.account.findUnique({ where: { id: accountId }, include: { roles: true } });
  }
}
