import {
  Body,
  Controller,
  Headers,
  Header,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { TwilioAdapter } from "./twilio.adapter";
import { EscalationService } from "./escalation.service";
interface WebhookRequest {
  protocol: string;
  get(name: string): string | undefined;
  originalUrl: string;
}
@Public()
@Controller("webhooks/twilio")
export class EscalationController {
  constructor(private readonly twilio: TwilioAdapter, private readonly escalation: EscalationService) {}
  @Post("status") status(
    @Headers("x-twilio-signature") signature: string,
    @Req() request: WebhookRequest,
    @Body() body: Record<string, string>,
  ) {
    const host = request.get("host");
    const url = `${request.protocol}://${host}${request.originalUrl}`;
    if (!this.twilio.validate(signature, url, body))
      throw new UnauthorizedException();
    return this.escalation.providerStatus(body);
  }
  @Post("voice")
  @Header("content-type", "text/xml")
  voice(@Headers("x-twilio-signature") signature: string, @Req() request: WebhookRequest, @Body() body: Record<string, string>) {
    const host = request.get("host");
    const url = `${request.protocol}://${host}${request.originalUrl}`;
    if (!this.twilio.validate(signature, url, body)) throw new UnauthorizedException();
    return `<?xml version="1.0" encoding="UTF-8"?><Response><Gather numDigits="1" timeout="10" action="/v1/webhooks/twilio/response"><Say>Legacy Wolf is checking whether you are okay. Press 1 if you are safe.</Say></Gather></Response>`;
  }

  @Post("response")
  @Header("content-type", "text/xml")
  response(@Headers("x-twilio-signature") signature: string, @Req() request: WebhookRequest, @Body() body: Record<string, string>) {
    const host = request.get("host");
    const url = `${request.protocol}://${host}${request.originalUrl}`;
    if (!this.twilio.validate(signature, url, body)) throw new UnauthorizedException();
    void this.escalation.providerResponse(body);
    return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you. Your response has been recorded.</Say></Response>`;
  }
}
