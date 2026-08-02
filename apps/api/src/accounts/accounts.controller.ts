import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { z } from "zod";
import { AccountsService } from "./accounts.service";
import { CurrentAccountId } from "../auth/current-account.decorator";
@Controller("account")
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}
  @Get() get(@CurrentAccountId() id: string) {
    return this.accounts.get(id);
  }
  @Patch() update(@CurrentAccountId() id: string, @Body() body: unknown) {
    return this.accounts.update(id, z.object({ preferredName: z.string().trim().min(1).max(80).nullable().optional(), legalName: z.string().trim().min(1).max(120).nullable().optional(), dob: z.string().date().nullable().optional() }).parse(body));
  }
  @Get("history") history(@CurrentAccountId() id: string) { return this.accounts.history(id); }
  @Get("authorizations") authorizations(@CurrentAccountId() id: string) { return this.accounts.authorizations(id); }
  @Post("authorizations") authorize(@CurrentAccountId() id: string, @Body() body: unknown) { return this.accounts.authorize(id, z.object({ kind: z.enum(["property_access", "responder_attendance", "pet_care", "emergency_services", "wishes_release"]), signerName: z.string().trim().min(2).max(120), accepted: z.literal(true) }).parse(body)); }
  @Get("devices") devices(@CurrentAccountId() id: string) { return this.accounts.devices(id); }
  @Get("legal-documents") legalDocuments(@CurrentAccountId() id: string) { return this.accounts.legalDocuments(id); }
  @Post("legal-documents") addLegalDocument(@CurrentAccountId() id: string, @Body() body: unknown) { return this.accounts.addLegalDocument(id, z.object({ name: z.string().trim().min(1).max(160), category: z.string().trim().min(1).max(80), notes: z.string().max(1000).nullable().optional(), mimeType: z.string().min(1).max(120), dataUrl: z.string().min(1) }).parse(body)); }
}
