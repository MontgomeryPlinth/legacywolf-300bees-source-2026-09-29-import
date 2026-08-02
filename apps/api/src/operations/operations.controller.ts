import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { CurrentAccountId } from "../auth/current-account.decorator";
import { Roles } from "../auth/roles.decorator";
import { OperationsService } from "./operations.service";

const report = z.object({ outcome: z.string().min(1).max(80), notes: z.string().max(4000).nullable().optional(), actions: z.array(z.string().max(160)).max(30).default([]) });
const status = z.object({ status: z.enum(["active", "suspended", "deletion_pending"]) });
const role = z.object({ role: z.enum(["user", "nominated_contact", "responder", "admin"]), enabled: z.boolean() });
const reveal = z.object({ incidentId: z.string().uuid(), reason: z.string().min(5).max(240) });
const location = z.object({ latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional() });

@Controller()
export class OperationsController {
  constructor(private readonly operations: OperationsService) {}

  @Roles("responder")
  @Get("responder/dispatches")
  dispatches(@CurrentAccountId() id: string) { return this.operations.dispatches(id); }

  @Roles("responder")
  @Get("responder/shift")
  shift(@CurrentAccountId() id: string) { return this.operations.currentShift(id); }

  @Roles("responder")
  @Post("responder/shift/start")
  startShift(@CurrentAccountId() id: string, @Body() body: unknown) { return this.operations.startShift(id, location.parse(body)); }

  @Roles("responder")
  @Post("responder/shift/end")
  endShift(@CurrentAccountId() id: string) { return this.operations.endShift(id); }

  @Roles("responder")
  @Post("responder/dispatches/:id/accept")
  accept(@CurrentAccountId() id: string, @Param("id") dispatchId: string) { return this.operations.transitionDispatch(id, dispatchId, "accepted"); }

  @Roles("responder")
  @Post("responder/dispatches/:id/arrive")
  arrive(@CurrentAccountId() id: string, @Param("id") dispatchId: string) { return this.operations.transitionDispatch(id, dispatchId, "on_scene"); }

  @Roles("responder")
  @Post("responder/incidents/:id/report")
  submitReport(@CurrentAccountId() id: string, @Param("id") incidentId: string, @Body() body: unknown) { return this.operations.report(id, incidentId, report.parse(body)); }

  @Roles("responder", "admin")
  @Post("operations/access/:id/reveal")
  reveal(@CurrentAccountId() id: string, @Param("id") accessId: string, @Body() body: unknown) { return this.operations.reveal(id, accessId, reveal.parse(body)); }

  @Roles("admin")
  @Get("admin/dashboard")
  dashboard() { return this.operations.dashboard(); }

  @Roles("admin")
  @Get("admin/incidents")
  incidents(@Query("status") incidentStatus?: string) { return this.operations.incidents(incidentStatus); }

  @Roles("admin")
  @Get("admin/users")
  users(@Query("q") query?: string) { return this.operations.accounts(query, false); }

  @Roles("admin")
  @Get("admin/responders")
  responders(@Query("q") query?: string) { return this.operations.accounts(query, true); }

  @Roles("admin")
  @Patch("admin/users/:id/status")
  setStatus(@CurrentAccountId() actorId: string, @Param("id") id: string, @Body() body: unknown) { return this.operations.setAccountStatus(actorId, id, status.parse(body).status); }

  @Roles("admin")
  @Patch("admin/users/:id/role")
  setRole(@CurrentAccountId() actorId: string, @Param("id") id: string, @Body() body: unknown) { return this.operations.setRole(actorId, id, role.parse(body)); }
}
