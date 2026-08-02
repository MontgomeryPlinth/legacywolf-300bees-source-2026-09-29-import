import { describe, expect, it } from "vitest";
import { MockApiClient } from "./mock-client";

describe("MockApiClient timer", () => {
  it("resets next_expiry_at from authoritative mock state", async () => {
    let now = new Date("2026-07-10T12:00:00.000Z");
    const client = new MockApiClient({ latencyMs: 0, now: () => now });
    await client.timerApi.update({ interval_hours: 6, grace_minutes: 5 });
    now = new Date("2026-07-10T13:00:00.000Z");
    const timer = await client.timerApi.checkIn();
    expect(timer.next_expiry_at).toBe("2026-07-10T19:00:00.000Z");
  });

  it("never returns plaintext access details", async () => {
    const client = new MockApiClient({ latencyMs: 0 });
    const detail = await client.propertyApi.saveAccessDetail(
      "keysafe_code",
      "1234",
    );
    expect(detail.masked_value).toBe("••••");
    expect(
      JSON.stringify(await client.propertyApi.listAccessDetails()),
    ).not.toContain("1234");
  });

  it("uses an OTP challenge before resolving an account", async () => {
    const client = new MockApiClient({ latencyMs: 0 });
    await client.auth.requestOtp("+61400000000");
    const account = await client.auth.verifyOtp("123456");
    expect(account.roles).toContain("user");
    expect(account.phone_verified).toBe(true);
    await expect(client.auth.requestSignupOtp("+61400000000")).rejects.toThrow(
      "already exists",
    );
  });

  it("applies timer modes through the same authoritative timer", async () => {
    const client = new MockApiClient({ latencyMs: 0 });
    const timer = await client.timerApi.setMode("trip", {
      until: "2026-07-12T12:00:00.000Z",
      reason: "User trip",
    });
    expect(timer.mode).toBe("trip");
    expect((await client.plans.get()).status).toBe("trip_mode");
  });
});
