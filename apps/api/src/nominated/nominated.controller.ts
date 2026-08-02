import { Controller, Get, Param, Post } from "@nestjs/common";
import { CurrentAccountId } from "../auth/current-account.decorator";
import { Roles } from "../auth/roles.decorator";
import { NominatedService } from "./nominated.service";
@Roles("nominated_contact")
@Controller("nominated")
export class NominatedController {
  constructor(private readonly nominated: NominatedService) {}
  @Get("plans") plans(@CurrentAccountId() id: string) { return this.nominated.plans(id); }
  @Get("incidents") incidents(@CurrentAccountId() id: string) { return this.nominated.incidents(id); }
  @Post("incidents/:id/safe") safe(@CurrentAccountId() id: string, @Param("id") incidentId: string) { return this.nominated.safe(id, incidentId); }
}
