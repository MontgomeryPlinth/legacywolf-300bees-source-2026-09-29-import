import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  async register(accountId: string, input: { deviceId: string; pushToken: string }) {
    await this.prisma.device.updateMany({ where: { accountId, monitoringSource: true, id: { not: input.deviceId } }, data: { monitoringSource: false } });
    const result = await this.prisma.device.updateMany({ where: { id: input.deviceId, accountId }, data: { pushToken: input.pushToken, lastSeenAt: new Date(), monitoringSource: true } });
    return { registered: result.count === 1 };
  }
  async send(accountId: string, title: string, body: string, data: Record<string, unknown> = {}) {
    const tokens = (await this.prisma.device.findMany({ where: { accountId, pushToken: { not: null } }, select: { pushToken: true } })).flatMap((item) => item.pushToken ? [item.pushToken] : []);
    if (!tokens.length) throw new ServiceUnavailableException("No push-enabled device is registered.");
    const response = await fetch("https://exp.host/--/api/v2/push/send", { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(tokens.map((to) => ({ to, title, body, data, sound: "default", priority: "high" }))) });
    const payload = await response.json() as Record<string, unknown>;
    await this.audit.append({ actorRole: "system", eventType: "push_delivery_requested", entityType: "account", entityId: accountId, payload: { accepted: response.ok, deviceCount: tokens.length } });
    if (!response.ok) throw new ServiceUnavailableException("Push provider rejected the request.");
    return payload;
  }
}
