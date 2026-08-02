import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import type { PlanTier } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BillingService {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {}
  private client() {
    const key = this.config.get<string>("STRIPE_SECRET_KEY");
    if (!key) throw new ServiceUnavailableException("Billing is not configured.");
    return new Stripe(key);
  }
  async checkout(accountId: string, input: { tier: PlanTier; successUrl: string; cancelUrl: string }) {
    const price = this.config.get<string>(`STRIPE_PRICE_${input.tier.toUpperCase()}`);
    if (!price) throw new ServiceUnavailableException("This plan price is not configured.");
    const account = await this.prisma.account.findUniqueOrThrow({ where: { id: accountId }, include: { subscription: true } });
    const session = await this.client().checkout.sessions.create({ mode: "subscription", customer: account.subscription?.providerCustomerId ?? undefined, customer_email: account.subscription?.providerCustomerId ? undefined : account.email ?? undefined, line_items: [{ price, quantity: 1 }], success_url: input.successUrl, cancel_url: input.cancelUrl, metadata: { accountId, tier: input.tier } });
    return { url: session.url };
  }
  async webhook(signature: string, rawBody?: Buffer) {
    const secret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!secret || !rawBody || !signature) throw new BadRequestException("Webhook verification is unavailable.");
    const event = this.client().webhooks.constructEvent(rawBody, signature, secret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const accountId = session.metadata?.accountId;
      const tier = session.metadata?.tier as PlanTier | undefined;
      if (accountId && tier && typeof session.customer === "string" && typeof session.subscription === "string") await this.prisma.subscription.upsert({ where: { accountId }, create: { accountId, tier, status: "active", providerCustomerId: session.customer, providerSubscription: session.subscription }, update: { tier, status: "active", providerCustomerId: session.customer, providerSubscription: session.subscription } });
    }
    return { received: true };
  }
}
