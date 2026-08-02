import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { FieldCryptoService } from "../crypto/field-crypto.service";
@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService, private readonly crypto: FieldCryptoService) {}
  async get(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!account) throw new NotFoundException("Account not found.");
    return { ...account, roles: account.roles.map((item) => item.role) };
  }
  async update(id: string, input: { preferredName?: string | null; legalName?: string | null; dob?: string | null }) {
    const account = await this.prisma.account.update({
      where: { id },
      data: { ...input, dob: input.dob ? new Date(input.dob) : input.dob },
      include: { roles: true },
    });
    await this.audit.append({ actorId: id, actorRole: "user", eventType: "profile_updated", entityType: "account", entityId: id });
    return { ...account, roles: account.roles.map((item) => item.role) };
  }
  history(id: string) { return this.prisma.auditLog.findMany({ where: { actorId: id }, select: { id: true, eventType: true, entityType: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 100 }); }
  authorizations(id: string) { return this.prisma.authorization.findMany({ where: { accountId: id }, select: { id: true, kind: true, provider: true, status: true, expiresAt: true, createdAt: true, updatedAt: true } }); }
  async authorize(id: string, input: { kind: string; signerName: string; accepted: true }) { const authorization = await this.prisma.authorization.create({ data: { accountId: id, kind: input.kind, provider: "in_app", status: "active", metadata: { signerName: input.signerName, acceptedAt: new Date().toISOString(), consentVersion: "2026-07" } } }); await this.audit.append({ actorId: id, actorRole: "user", eventType: "legal_authorization_signed", entityType: "authorization", entityId: authorization.id, payload: { kind: input.kind } }); return authorization; }
  devices(id: string) { return this.prisma.device.findMany({ where: { accountId: id }, select: { id: true, platform: true, monitoringSource: true, biometricBound: true, lastSeenAt: true, createdAt: true }, orderBy: { createdAt: "desc" } }); }
  legalDocuments(id: string) { return this.prisma.legalDocument.findMany({ where: { accountId: id }, select: { id: true, name: true, category: true, notes: true, mimeType: true, createdAt: true }, orderBy: { createdAt: "desc" } }); }
  async addLegalDocument(id: string, input: { name: string; category: string; notes?: string | null; mimeType: string; dataUrl: string }) { const { dataUrl, ...metadata } = input; const encrypted = this.crypto.encrypt(dataUrl); const document = await this.prisma.legalDocument.create({ data: { accountId: id, ...metadata, ...encrypted } }); await this.audit.append({ actorId: id, actorRole: "user", eventType: "legal_document_uploaded", entityType: "legal_document", entityId: document.id, payload: { name: input.name, category: input.category } }); return { id: document.id, ...metadata, createdAt: document.createdAt }; }
}
