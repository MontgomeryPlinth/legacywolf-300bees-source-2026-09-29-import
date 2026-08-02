import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuditModule } from "./audit/audit.module";
import { CryptoModule } from "./crypto/crypto.module";
import { AuthModule } from "./auth/auth.module";
import { AccountsModule } from "./accounts/accounts.module";
import { PlansModule } from "./plans/plans.module";
import { TimerModule } from "./timer/timer.module";
import { DomainModule } from "./domain/domain.module";
import { EscalationModule } from "./escalation/escalation.module";
import { OperationsModule } from "./operations/operations.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { BillingModule } from "./billing/billing.module";
import { StorageModule } from "./storage/storage.module";
import { NominatedModule } from "./nominated/nominated.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuditModule,
    CryptoModule,
    AuthModule,
    AccountsModule,
    PlansModule,
    EscalationModule,
    TimerModule,
    DomainModule,
    OperationsModule,
    NotificationsModule,
    BillingModule,
    StorageModule,
    NominatedModule,
  ],
})
export class AppModule {}
