import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
const device = z.object({
  id: z.string().uuid(),
  platform: z.enum(["ios", "android", "web"]),
  publicKey: z.string().min(16),
});
const requestSchema = z.object({
  identity: z.string().min(3),
  channel: z.enum(["sms", "email"]),
  intent: z.enum(["login", "signup"]).default("login"),
});
const verifySchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
  device,
});
const googleSchema = z.object({ idToken: z.string().min(100), device });
const refreshSchema = z.object({
  refreshToken: z.string().min(64),
  deviceId: z.string().uuid(),
});
@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("otp/request")
  request(@Body() body: unknown) {
    return this.auth.requestOtp(requestSchema.parse(body));
  }
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("otp/verify")
  verify(@Body() body: unknown) {
    return this.auth.verifyOtp(verifySchema.parse(body));
  }
  @Post("google") google(@Body() body: unknown) {
    return this.auth.verifyGoogle(googleSchema.parse(body));
  }
  @Post("refresh") refresh(@Body() body: unknown) {
    return this.auth.refresh(refreshSchema.parse(body));
  }
}
