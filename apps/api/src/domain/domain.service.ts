import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PlansService } from "../plans/plans.service";
import { FieldCryptoService } from "../crypto/field-crypto.service";
import { AuditService } from "../audit/audit.service";
@Injectable()
export class DomainService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plans: PlansService,
    private readonly crypto: FieldCryptoService,
    private readonly audit: AuditService,
  ) {}
  private async planId(accountId: string) {
    return (await this.plans.getByAccount(accountId)).id;
  }
  async people(accountId: string) {
    return this.prisma.person.findMany({
      where: { planId: await this.planId(accountId) },
      orderBy: { escalationOrder: "asc" },
    });
  }
  async addPerson(
    accountId: string,
    input: {
      name: string;
      relationship?: string | null;
      phoneE164?: string | null;
      email?: string | null;
      roles: string[];
      instructions?: string | null;
      verification?: "pending" | "verified" | "declined" | "unreachable";
      invitedAt?: string | null;
      verifiedAt?: string | null;
    },
  ) {
    const planId = await this.planId(accountId);
    const linked = input.email
      ? await this.prisma.account.findUnique({ where: { email: input.email } })
      : input.phoneE164
        ? await this.prisma.account.findUnique({
            where: { phoneE164: input.phoneE164 },
          })
        : null;
    if (linked)
      await this.prisma.accountRoleGrant.upsert({
        where: {
          accountId_role: { accountId: linked.id, role: "nominated_contact" },
        },
        create: { accountId: linked.id, role: "nominated_contact" },
        update: {},
      });
    const count = await this.prisma.person.count({ where: { planId } });
    const person = await this.prisma.person.create({
      data: {
        ...input,
        invitedAt: input.invitedAt ? new Date(input.invitedAt) : null,
        verifiedAt: input.verifiedAt ? new Date(input.verifiedAt) : null,
        planId,
        linkedAccount: linked?.id,
        escalationOrder: count + 1,
      },
    });
    await this.audit.append({
      actorId: accountId,
      actorRole: "user",
      eventType: "person_added",
      entityType: "person",
      entityId: person.id,
    });
    return person;
  }
  async updatePerson(accountId: string, id: string, input: { name: string; relationship?: string | null; phoneE164?: string | null; email?: string | null; roles: string[]; instructions?: string | null; verification?: "pending" | "verified" | "declined" | "unreachable"; invitedAt?: string | null; verifiedAt?: string | null }) {
    const planId = await this.planId(accountId);
    const owned = await this.prisma.person.findFirst({ where: { id, planId } });
    if (!owned) throw new NotFoundException();
    const person = await this.prisma.person.update({ where: { id }, data: { ...input, invitedAt: input.invitedAt ? new Date(input.invitedAt) : input.invitedAt, verifiedAt: input.verifiedAt ? new Date(input.verifiedAt) : input.verifiedAt } });
    await this.audit.append({ actorId: accountId, actorRole: "user", eventType: "person_updated", entityType: "person", entityId: id });
    return person;
  }
  async pets(accountId: string) {
    return this.prisma.pet.findMany({
      where: { planId: await this.planId(accountId) },
    });
  }
  async addPet(
    accountId: string,
    input: {
      name: string;
      species?: string | null;
      breed?: string | null;
      ageYears?: number | null; sex?: string | null; weightKg?: number | null; microchipId?: string | null; photoKey?: string | null;
      vetContact?: Record<string, unknown> | null; preferences?: Record<string, unknown> | null; emergencyFundCents?: number | null;
      medical?: Record<string, unknown> | null;
      routine?: Record<string, unknown> | null;
      guardianPrimary?: string | null;
      guardianBackup?: string | null;
    },
  ) {
    const planId = await this.planId(accountId);
    for (const guardianId of [input.guardianPrimary, input.guardianBackup].filter((value): value is string => Boolean(value))) {
      const guardian = await this.prisma.person.findFirst({ where: { id: guardianId, planId } });
      if (!guardian) throw new NotFoundException("Pet guardian must be one of your nominated people.");
    }
    const pet = await this.prisma.pet.create({
      data: {
        ...input,
        medical: input.medical as Prisma.InputJsonValue | undefined,
        routine: input.routine as Prisma.InputJsonValue | undefined,
        vetContact: input.vetContact as Prisma.InputJsonValue | undefined,
        preferences: input.preferences as Prisma.InputJsonValue | undefined,
        planId,
      },
    });
    await this.syncPetGuardianRoles(planId, input.guardianPrimary, input.guardianBackup);
    return pet;
  }
  async updatePet(accountId: string, id: string, input: { name?: string; species?: string | null; breed?: string | null; ageYears?: number | null; sex?: string | null; weightKg?: number | null; microchipId?: string | null; photoKey?: string | null; vetContact?: Record<string, unknown> | null; medical?: Record<string, unknown> | null; routine?: Record<string, unknown> | null; preferences?: Record<string, unknown> | null; emergencyFundCents?: number | null; guardianPrimary?: string | null; guardianBackup?: string | null }) {
    const planId = await this.planId(accountId);
    const owned = await this.prisma.pet.findFirst({ where: { id, planId } });
    if (!owned) throw new NotFoundException();
    for (const guardianId of [input.guardianPrimary, input.guardianBackup].filter((value): value is string => Boolean(value))) {
      const guardian = await this.prisma.person.findFirst({ where: { id: guardianId, planId } });
      if (!guardian) throw new NotFoundException("Pet guardian must be one of your nominated people.");
    }
    const pet = await this.prisma.pet.update({ where: { id }, data: { ...input, medical: input.medical as Prisma.InputJsonValue | undefined, routine: input.routine as Prisma.InputJsonValue | undefined, vetContact: input.vetContact as Prisma.InputJsonValue | undefined, preferences: input.preferences as Prisma.InputJsonValue | undefined } });
    await this.syncPetGuardianRoles(planId, input.guardianPrimary, input.guardianBackup);
    return pet;
  }
  private async syncPetGuardianRoles(planId: string, primary?: string | null, backup?: string | null) {
    for (const [id, role] of [[primary, "pet_guardian_primary"], [backup, "pet_guardian_backup"]] as const) {
      if (!id) continue;
      const person = await this.prisma.person.findFirst({ where: { id, planId } });
      if (person && !person.roles.includes(role)) await this.prisma.person.update({ where: { id }, data: { roles: [...person.roles, role] } });
    }
  }
  async property(accountId: string) {
    const value = await this.prisma.property.findUnique({
      where: { planId: await this.planId(accountId) },
      include: {
        accessDetails: {
          select: { id: true, fieldName: true, updatedAt: true },
        },
      },
    });
    return value
      ? {
          ...value,
          accessDetails: value.accessDetails.map((item) => ({
            ...item,
            maskedValue: "••••",
          })),
        }
      : null;
  }
  async saveProperty(
    accountId: string,
    input: {
      address: Record<string, unknown>;
      propertyType?: string | null;
      unitDetails?: string | null;
    },
  ) {
    const planId = await this.planId(accountId);
    return this.prisma.property.upsert({
      where: { planId },
      create: {
        ...input,
        address: input.address as Prisma.InputJsonValue,
        planId,
      },
      update: { ...input, address: input.address as Prisma.InputJsonValue },
    });
  }
  async saveAccess(
    accountId: string,
    input: { fieldName: string; plaintext: string },
  ) {
    const planId = await this.planId(accountId);
    const property = await this.prisma.property.findUnique({
      where: { planId },
    });
    if (!property) throw new NotFoundException("Property must be saved first.");
    const encrypted = this.crypto.encrypt(input.plaintext);
    const detail = await this.prisma.accessDetail.upsert({
      where: {
        propertyId_fieldName: {
          propertyId: property.id,
          fieldName: input.fieldName,
        },
      },
      create: {
        propertyId: property.id,
        fieldName: input.fieldName,
        ...encrypted,
      },
      update: encrypted,
    });
    await this.audit.append({
      actorId: accountId,
      actorRole: "user",
      eventType: "access_detail_saved",
      entityType: "access_detail",
      entityId: detail.id,
      payload: { fieldName: input.fieldName },
    });
    return {
      id: detail.id,
      fieldName: detail.fieldName,
      maskedValue: "••••",
      updatedAt: detail.updatedAt,
    };
  }
  async accessMedia(accountId: string) {
    const property = await this.prisma.property.findUnique({ where: { planId: await this.planId(accountId) } });
    return property ? this.prisma.propertyAccessMedia.findMany({ where: { propertyId: property.id }, orderBy: { createdAt: "asc" } }) : [];
  }
  async addAccessMedia(accountId: string, input: { section: string; mediaType: string; dataUrl: string; label: string }) {
    const property = await this.prisma.property.findUnique({ where: { planId: await this.planId(accountId) } });
    if (!property) throw new NotFoundException("Property must be saved first.");
    const media = await this.prisma.propertyAccessMedia.create({ data: { ...input, propertyId: property.id } });
    await this.audit.append({ actorId: accountId, actorRole: "user", eventType: "property_access_media_added", entityType: "property_access_media", entityId: media.id });
    return media;
  }
  async removeAccessMedia(accountId: string, id: string) {
    const property = await this.prisma.property.findUnique({ where: { planId: await this.planId(accountId) } });
    const media = property ? await this.prisma.propertyAccessMedia.findFirst({ where: { id, propertyId: property.id } }) : null;
    if (!media) throw new NotFoundException();
    await this.prisma.propertyAccessMedia.delete({ where: { id } });
    return { ok: true };
  }
  async queue(accountId: string) {
    return this.prisma.responseQueueStep.findMany({
      where: { planId: await this.planId(accountId) },
      orderBy: { position: "asc" },
    });
  }
  async addQueue(
    accountId: string,
    input: {
      position: number;
      channel: string;
      targetPerson: string | null;
      waitMinutes: number;
      messageTemplate: string | null;
    },
  ) {
    return this.prisma.responseQueueStep.create({
      data: { ...input, planId: await this.planId(accountId) },
    });
  }
  async updateQueue(
    accountId: string,
    id: string,
    input: {
      position: number;
      channel: string;
      targetPerson: string | null;
      waitMinutes: number;
      messageTemplate: string | null;
    },
  ) {
    const planId = await this.planId(accountId);
    const owned = await this.prisma.responseQueueStep.findFirst({
      where: { id, planId },
    });
    if (!owned) throw new NotFoundException();
    return this.prisma.responseQueueStep.update({ where: { id }, data: input });
  }
  async replaceQueue(accountId: string, steps: { position: number; channel: string; targetPerson: string | null; waitMinutes: number; messageTemplate: string | null }[]) {
    const planId = await this.planId(accountId);
    const targetIds = steps.map((step) => step.targetPerson).filter((id): id is string => Boolean(id));
    if (targetIds.length) {
      const ownedTargets = await this.prisma.person.count({ where: { id: { in: targetIds }, planId } });
      if (ownedTargets !== new Set(targetIds).size) throw new NotFoundException("A queue contact was not found in this plan.");
    }
    const saved = await this.prisma.$transaction(async (tx) => {
      await tx.responseQueueStep.deleteMany({ where: { planId } });
      await tx.responseQueueStep.createMany({ data: steps.map((step) => ({ ...step, planId })) });
      return tx.responseQueueStep.findMany({ where: { planId }, orderBy: { position: "asc" } });
    });
    await this.audit.append({ actorId: accountId, actorRole: "user", eventType: "response_queue_updated", entityType: "plan", entityId: planId, payload: { steps: saved.map(({ position, channel, waitMinutes }) => ({ position, channel, waitMinutes })) } });
    return saved;
  }
  async letters(accountId: string) {
    return this.prisma.handoffLetter.findMany({
      where: { planId: await this.planId(accountId) },
      select: {
        id: true,
        recipient: true,
        deliveryTrigger: true,
        releasedAt: true,
      },
    });
  }
  async addLetter(
    accountId: string,
    input: { recipient: string | null; body: string; deliveryTrigger: string },
  ) {
    const encrypted = this.crypto.encrypt(input.body);
    return this.prisma.handoffLetter.create({
      data: {
        planId: await this.planId(accountId),
        recipient: input.recipient,
        deliveryTrigger: input.deliveryTrigger,
        ...encrypted,
      },
      select: {
        id: true,
        recipient: true,
        deliveryTrigger: true,
        releasedAt: true,
      },
    });
  }
  async removeLetter(accountId: string, id: string) {
    const result = await this.prisma.handoffLetter.deleteMany({
      where: { id, planId: await this.planId(accountId) },
    });
    if (!result.count) throw new NotFoundException();
  }
  async removeOwned(
    accountId: string,
    type: "person" | "pet" | "queue",
    id: string,
  ) {
    const planId = await this.planId(accountId);
    if (type === "person") {
      const result = await this.prisma.person.deleteMany({
        where: { id, planId },
      });
      if (!result.count) throw new NotFoundException();
      return;
    }
    if (type === "pet") {
      const result = await this.prisma.pet.deleteMany({
        where: { id, planId },
      });
      if (!result.count) throw new NotFoundException();
      return;
    }
    const result = await this.prisma.responseQueueStep.deleteMany({
      where: { id, planId },
    });
    if (!result.count) throw new NotFoundException();
  }
}
