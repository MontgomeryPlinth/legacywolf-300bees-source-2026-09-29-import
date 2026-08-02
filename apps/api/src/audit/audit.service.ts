import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async append(event: {
    actorId?: string;
    actorRole?: string;
    eventType: string;
    entityType?: string;
    entityId?: string;
    payload?: Record<string, unknown>;
  }) {
    const previous = await this.prisma.auditLog.findFirst({
      orderBy: { id: "desc" },
      select: { rowHash: true },
    });
    const payload = (event.payload ?? {}) as Prisma.InputJsonValue;
    const rowHash = createHash("sha256")
      .update(previous?.rowHash ?? Buffer.alloc(0))
      .update(JSON.stringify({ ...event, payload }))
      .digest();
    return this.prisma.auditLog.create({
      data: {
        actorId: event.actorId,
        actorRole: event.actorRole,
        eventType: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId,
        payload,
        prevHash: previous?.rowHash,
        rowHash,
      },
    });
  }
}
