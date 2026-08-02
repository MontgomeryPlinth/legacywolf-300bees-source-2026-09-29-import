import { describe, expect, it } from "vitest";
import { ConfigService } from "@nestjs/config";
import { FieldCryptoService } from "./field-crypto.service";
describe("FieldCryptoService", () => {
  it("round-trips AES-256-GCM fields without retaining plaintext", () => {
    const key = Buffer.alloc(32, 7).toString("base64");
    const service = new FieldCryptoService(
      new ConfigService({ FIELD_ENCRYPTION_KEY_BASE64: key }),
    );
    const encrypted = service.encrypt("4821");
    expect(Buffer.from(encrypted.ciphertext).toString()).not.toContain("4821");
    expect(service.decrypt(encrypted)).toBe("4821");
  });
});
