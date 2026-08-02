import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Twilio from "twilio";
@Injectable()
export class TwilioAdapter {
  constructor(private readonly config: ConfigService) {}
  private client() {
    const sid = this.config.get<string>("TWILIO_ACCOUNT_SID");
    const token = this.config.get<string>("TWILIO_AUTH_TOKEN");
    if (!sid || !token)
      throw new ServiceUnavailableException("Twilio is not configured.");
    return Twilio(sid, token);
  }
  async sendVerification(identity: string, channel: "sms" | "email") {
    const service = this.config.get<string>("TWILIO_VERIFY_SERVICE_SID");
    if (!service)
      throw new ServiceUnavailableException("Twilio Verify is not configured.");
    return this.client()
      .verify.v2.services(service)
      .verifications.create({ to: identity, channel });
  }
  async checkVerification(identity: string, code: string) {
    const service = this.config.get<string>("TWILIO_VERIFY_SERVICE_SID");
    if (!service)
      throw new ServiceUnavailableException("Twilio Verify is not configured.");
    const result = await this.client()
      .verify.v2.services(service)
      .verificationChecks.create({ to: identity, code });
    return result.status === "approved";
  }
  async sendSms(to: string, body: string, statusCallback?: string) {
    const from = this.config.get<string>("TWILIO_SMS_FROM");
    if (!from)
      throw new ServiceUnavailableException(
        "Twilio SMS sender is not configured.",
      );
    return this.client().messages.create({ to, from, body, statusCallback });
  }
  async call(to: string, url: string, statusCallback?: string) {
    const from = this.config.get<string>("TWILIO_VOICE_FROM");
    if (!from)
      throw new ServiceUnavailableException(
        "Twilio voice caller is not configured.",
      );
    return this.client().calls.create({ to, from, url, statusCallback });
  }
  validate(signature: string, url: string, params: Record<string, string>) {
    const token = this.config.get<string>("TWILIO_AUTH_TOKEN");
    return Boolean(
      token && Twilio.validateRequest(token, signature, url, params),
    );
  }
}
