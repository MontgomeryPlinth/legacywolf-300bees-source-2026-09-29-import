import { Body, Controller, Headers, Post, Req } from "@nestjs/common";
import { z } from "zod";
import { CurrentAccountId } from "../auth/current-account.decorator";
import { Public } from "../auth/public.decorator";
import { BillingService } from "./billing.service";

const checkout = z.object({ tier: z.enum(["friend_alert", "attend_check", "attend_check_pet", "full"]), successUrl: z.string().url(), cancelUrl: z.string().url() });
@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}
  @Post("checkout") checkout(@CurrentAccountId() id: string, @Body() body: unknown) { return this.billing.checkout(id, checkout.parse(body)); }
  @Public()
  @Post("webhook") webhook(@Headers("stripe-signature") signature: string, @Req() request: { rawBody?: Buffer }) { return this.billing.webhook(signature, request.rawBody); }
}
