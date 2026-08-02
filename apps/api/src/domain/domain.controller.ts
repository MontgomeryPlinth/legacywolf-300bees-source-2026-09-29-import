import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { z } from "zod";
import { CurrentAccountId } from "../auth/current-account.decorator";
import { DomainService } from "./domain.service";
const person = z.object({
  name: z.string().min(1),
  relationship: z.string().nullable().optional(),
  phoneE164: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  roles: z.array(z.string()).default([]),
  instructions: z.string().nullable().optional(),
  verification: z.enum(["pending", "verified", "declined", "unreachable"]).optional(),
  invitedAt: z.string().datetime().nullable().optional(),
  verifiedAt: z.string().datetime().nullable().optional(),
});
const pet = z.object({
  name: z.string().min(1),
  species: z.string().nullable().optional(),
  breed: z.string().nullable().optional(),
  ageYears: z.number().int().min(0).nullable().optional(),
  sex: z.string().nullable().optional(),
  weightKg: z.number().min(0).nullable().optional(),
  microchipId: z.string().nullable().optional(),
  photoKey: z.string().nullable().optional(),
  vetContact: z.record(z.unknown()).nullable().optional(),
  medical: z.record(z.unknown()).nullable().optional(),
  routine: z.record(z.unknown()).nullable().optional(),
  preferences: z.record(z.unknown()).nullable().optional(),
  emergencyFundCents: z.number().int().min(0).nullable().optional(),
  guardianPrimary: z.string().uuid().nullable().optional(),
  guardianBackup: z.string().uuid().nullable().optional(),
});
const property = z.object({
  address: z.record(z.unknown()),
  propertyType: z.string().nullable().optional(),
  unitDetails: z.string().nullable().optional(),
});
const access = z.object({
  fieldName: z.string().min(1),
  plaintext: z.string().min(1),
});
const accessMedia = z.object({ section: z.enum(["building", "unit", "alarm"]), mediaType: z.enum(["image", "video"]), dataUrl: z.string().min(1), label: z.string().max(160).default("") });
const queue = z.object({
  position: z.number().int().positive(),
  channel: z.enum(["push", "sms", "call", "notify_contact", "dispatch"]),
  targetPerson: z.string().uuid().nullable(),
  waitMinutes: z.number().int().min(0),
  messageTemplate: z.string().nullable(),
});
const queueList = z.array(queue).min(1).max(10).superRefine((steps, context) => {
  const positions = steps.map((step) => step.position).sort((a, b) => a - b);
  if (!positions.every((position, index) => position === index + 1)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Queue positions must be consecutive." });
  if (steps.filter((step) => step.channel === "dispatch").length > 1) context.addIssue({ code: z.ZodIssueCode.custom, message: "Only one responder attendance step is allowed." });
});
const letter = z.object({
  recipient: z.string().uuid().nullable(),
  body: z.string().min(1),
  deliveryTrigger: z.enum([
    "on_activation",
    "on_confirmed_death",
    "on_family_arrival",
  ]),
});
@Controller()
export class DomainController {
  constructor(private readonly domain: DomainService) {}
  @Get("people") people(@CurrentAccountId() id: string) {
    return this.domain.people(id);
  }
  @Post("people") addPerson(
    @CurrentAccountId() id: string,
    @Body() body: unknown,
  ) {
    return this.domain.addPerson(id, person.parse(body));
  }
  @Put("people/:id") updatePerson(@CurrentAccountId() accountId: string, @Param("id") id: string, @Body() body: unknown) {
    return this.domain.updatePerson(accountId, id, person.parse(body));
  }
  @Delete("people/:id") removePerson(
    @CurrentAccountId() accountId: string,
    @Param("id") id: string,
  ) {
    return this.domain.removeOwned(accountId, "person", id);
  }
  @Get("pets") pets(@CurrentAccountId() id: string) {
    return this.domain.pets(id);
  }
  @Post("pets") addPet(@CurrentAccountId() id: string, @Body() body: unknown) {
    return this.domain.addPet(id, pet.parse(body));
  }
  @Put("pets/:id") updatePet(@CurrentAccountId() accountId: string, @Param("id") id: string, @Body() body: unknown) {
    return this.domain.updatePet(accountId, id, pet.partial().parse(body));
  }
  @Delete("pets/:id") removePet(
    @CurrentAccountId() accountId: string,
    @Param("id") id: string,
  ) {
    return this.domain.removeOwned(accountId, "pet", id);
  }
  @Get("property") getProperty(@CurrentAccountId() id: string) {
    return this.domain.property(id);
  }
  @Put("property") saveProperty(
    @CurrentAccountId() id: string,
    @Body() body: unknown,
  ) {
    return this.domain.saveProperty(id, property.parse(body));
  }
  @Post("property/access") saveAccess(
    @CurrentAccountId() id: string,
    @Body() body: unknown,
  ) {
    return this.domain.saveAccess(id, access.parse(body));
  }
  @Get("property/access-media") accessMedia(@CurrentAccountId() id: string) { return this.domain.accessMedia(id); }
  @Post("property/access-media") addAccessMedia(@CurrentAccountId() id: string, @Body() body: unknown) { return this.domain.addAccessMedia(id, accessMedia.parse(body)); }
  @Delete("property/access-media/:id") removeAccessMedia(@CurrentAccountId() accountId: string, @Param("id") id: string) { return this.domain.removeAccessMedia(accountId, id); }
  @Get("response-queue") getQueue(@CurrentAccountId() id: string) {
    return this.domain.queue(id);
  }
  @Post("response-queue") addQueue(
    @CurrentAccountId() id: string,
    @Body() body: unknown,
  ) {
    return this.domain.addQueue(id, queue.parse(body));
  }
  @Put("response-queue") replaceQueue(@CurrentAccountId() id: string, @Body() body: unknown) {
    return this.domain.replaceQueue(id, queueList.parse(body));
  }
  @Put("response-queue/:id") updateQueue(
    @CurrentAccountId() accountId: string,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.domain.updateQueue(accountId, id, queue.parse(body));
  }
  @Delete("response-queue/:id") removeQueue(
    @CurrentAccountId() accountId: string,
    @Param("id") id: string,
  ) {
    return this.domain.removeOwned(accountId, "queue", id);
  }
  @Get("wishes/letters") letters(@CurrentAccountId() id: string) {
    return this.domain.letters(id);
  }
  @Post("wishes/letters") addLetter(
    @CurrentAccountId() id: string,
    @Body() body: unknown,
  ) {
    return this.domain.addLetter(id, letter.parse(body));
  }
  @Delete("wishes/letters/:id") removeLetter(
    @CurrentAccountId() accountId: string,
    @Param("id") id: string,
  ) {
    return this.domain.removeLetter(accountId, id);
  }
}
