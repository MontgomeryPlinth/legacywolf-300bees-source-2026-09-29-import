import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { TwilioAdapter } from "../escalation/twilio.adapter";
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly twilio: TwilioAdapter,
  ) {}
  private hash(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }
  private developmentAuthEnabled() {
    return this.config.get("NODE_ENV") === "development" && this.config.get("DEV_AUTH_BYPASS") === "true";
  }
  async requestOtp(input: {
    identity: string;
    channel: "sms" | "email";
    intent: "login" | "signup";
  }) {
    const identity =
      input.channel === "email"
        ? input.identity.trim().toLowerCase()
        : input.identity.replace(/[\s()-]/g, "");
    if (input.intent === "signup") {
      const existing =
        input.channel === "email"
          ? await this.prisma.account.findUnique({
              where: { email: identity },
              select: { id: true },
            })
          : await this.prisma.account.findUnique({
              where: { phoneE164: identity },
              select: { id: true },
            });
      if (existing)
        throw new BadRequestException(
          "An account with this identity already exists—log in instead.",
        );
    }
    const recent = await this.prisma.otpChallenge.count({ where: { identity, createdAt: { gte: new Date(Date.now() - 10 * 60_000) } } });
    if (recent >= 5) throw new BadRequestException("Too many verification requests. Try again in a few minutes.");
    const developmentCode = this.config.get("DEV_OTP_CODE", "246810");
    if (!this.developmentAuthEnabled()) await this.twilio.sendVerification(identity, input.channel);
    const challenge = await this.prisma.otpChallenge.create({
      data: {
        identity,
        channel: input.channel,
        codeHash: this.developmentAuthEnabled() ? this.hash(developmentCode) : "twilio-verify",
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });
    return {
      challengeId: challenge.id,
      expiresAt: challenge.expiresAt,
      delivery: this.developmentAuthEnabled() ? "development" : "pending_provider",
      ...(this.developmentAuthEnabled() ? { developmentCode } : {}),
    };
  }
  async verifyOtp(input: {
    challengeId: string;
    code: string;
    device: {
      id: string;
      platform: "ios" | "android" | "web";
      publicKey: string;
    };
  }) {
    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: input.challengeId },
    });
    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() < Date.now() ||
      challenge.attempts >= 5
    )
      throw new UnauthorizedException(
        "Verification challenge is invalid or expired.",
      );
    const approved = this.developmentAuthEnabled()
      ? challenge.codeHash === this.hash(input.code)
      : await this.twilio.checkVerification(challenge.identity, input.code);
    if (!approved) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException("Verification code is incorrect.");
    }
    const isEmail = challenge.channel === "email";
    const account = await this.prisma.account.upsert({
      where: isEmail
        ? { email: challenge.identity }
        : { phoneE164: challenge.identity },
      create: {
        email: isEmail ? challenge.identity : null,
        phoneE164: isEmail ? null : challenge.identity,
        emailVerified: isEmail,
        phoneVerified: !isEmail,
        roles: { create: { role: "user" } },
        plan: {
          create: {
            tier: "friend_alert",
            timer: {
              create: {
                intervalHours: 24,
                nextExpiryAt: new Date(Date.now() + 86_400_000),
              },
            },
          },
        },
      },
      update: isEmail ? { emailVerified: true } : { phoneVerified: true },
      include: { roles: true },
    });
    await this.prisma.$transaction([
      this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.device.upsert({
        where: { id: input.device.id },
        create: {
          id: input.device.id,
          accountId: account.id,
          platform: input.device.platform,
          devicePubkey: input.device.publicKey,
        },
        update: {
          lastSeenAt: new Date(),
          devicePubkey: input.device.publicKey,
        },
      }),
    ]);
    await this.audit.append({
      actorId: account.id,
      actorRole: "user",
      eventType: "login",
      entityType: "account",
      entityId: account.id,
    });
    return this.createSession(
      account.id,
      input.device.id,
      account.roles.map((item) => item.role),
    );
  }
  async verifyGoogle(input: {
    idToken: string;
    device: {
      id: string;
      platform: "ios" | "android" | "web";
      publicKey: string;
    };
  }) {
    const audiences = [
      this.config.get<string>("GOOGLE_CLIENT_ID_IOS"),
      this.config.get<string>("GOOGLE_CLIENT_ID_ANDROID"),
      this.config.get<string>("GOOGLE_CLIENT_ID_WEB"),
    ].filter((value): value is string => Boolean(value));
    if (!audiences.length)
      throw new BadRequestException("Google authentication is not configured.");
    const jwks = createRemoteJWKSet(
      new URL("https://www.googleapis.com/oauth2/v3/certs"),
    );
    const { payload } = await jwtVerify(input.idToken, jwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: audiences,
    });
    if (
      !payload.sub ||
      typeof payload.email !== "string" ||
      !payload.email_verified
    )
      throw new UnauthorizedException("Google identity is not verified.");
    const email = payload.email.toLowerCase();
    const account = await this.prisma.account.upsert({
      where: { email },
      create: {
        email,
        googleSub: payload.sub,
        emailVerified: true,
        roles: { create: { role: "user" } },
        plan: {
          create: {
            tier: "friend_alert",
            timer: {
              create: {
                intervalHours: 24,
                nextExpiryAt: new Date(Date.now() + 86_400_000),
              },
            },
          },
        },
      },
      update: { googleSub: payload.sub, emailVerified: true },
      include: { roles: true },
    });
    await this.prisma.device.upsert({
      where: { id: input.device.id },
      create: {
        id: input.device.id,
        accountId: account.id,
        platform: input.device.platform,
        devicePubkey: input.device.publicKey,
      },
      update: { lastSeenAt: new Date(), devicePubkey: input.device.publicKey },
    });
    await this.audit.append({
      actorId: account.id,
      actorRole: "user",
      eventType: "google_login",
      entityType: "account",
      entityId: account.id,
    });
    return this.createSession(
      account.id,
      input.device.id,
      account.roles.map((item) => item.role),
    );
  }
  async refresh(input: { refreshToken: string; deviceId: string }) {
    const [index, secret] = input.refreshToken.split(".", 2);
    if (!index || !secret) throw new UnauthorizedException();
    const current = await this.prisma.refreshToken.findUnique({
      where: { id: index },
      include: { account: { include: { roles: true } } },
    });
    if (
      !current ||
      current.deviceId !== input.deviceId ||
      current.expiresAt.getTime() < Date.now() ||
      current.tokenHash !== this.hash(secret)
    ) {
      if (current)
        await this.prisma.refreshToken.updateMany({
          where: { familyId: current.familyId },
          data: { revokedAt: new Date() },
        });
      throw new UnauthorizedException("Refresh token reuse detected.");
    }
    if (current.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: current.familyId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException("Refresh token reuse detected.");
    }
    await this.prisma.refreshToken.update({
      where: { id: current.id },
      data: { revokedAt: new Date() },
    });
    return this.createSession(
      current.accountId,
      input.deviceId,
      current.account.roles.map((item) => item.role),
      current.familyId,
    );
  }
  private async createSession(
    accountId: string,
    deviceId: string,
    roles: string[],
    familyId: string = randomUUID(),
  ) {
    const secret = randomBytes(48).toString("base64url");
    const record = await this.prisma.refreshToken.create({
      data: {
        accountId,
        deviceId,
        tokenHash: this.hash(secret),
        familyId,
        expiresAt: new Date(Date.now() + 30 * 86_400_000),
      },
    });
    return {
      accountId,
      roles,
      accessToken: await this.sign(accountId, roles),
      refreshToken: `${record.id}.${secret}`,
      expiresIn: 900,
    };
  }
  private async sign(subject: string, roles: string[]) {
    const secret = this.config.get<string>("JWT_SECRET");
    if (!secret)
      throw new BadRequestException("JWT signing is not configured.");
    return new SignJWT({ roles })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(subject)
      .setIssuer(this.config.get("JWT_ISSUER", "legacy-wolf-api"))
      .setAudience(this.config.get("JWT_AUDIENCE", "legacy-wolf-app"))
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(secret));
  }
}
