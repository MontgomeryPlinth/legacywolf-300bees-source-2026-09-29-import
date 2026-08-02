import { Global, Module } from "@nestjs/common";
import { EscalationController } from "./escalation.controller";
import { EscalationService } from "./escalation.service";
import { TwilioAdapter } from "./twilio.adapter";
@Global()
@Module({
  controllers: [EscalationController],
  providers: [EscalationService, TwilioAdapter],
  exports: [EscalationService, TwilioAdapter],
})
export class EscalationModule {}
