import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
export interface EncryptedField {
  ciphertext: Uint8Array<ArrayBuffer>;
  iv: Uint8Array<ArrayBuffer>;
  authTag: Uint8Array<ArrayBuffer>;
  keyVersion: number;
}
@Injectable()
export class FieldCryptoService {
  constructor(private readonly config: ConfigService) {}
  private key() {
    const value = this.config.get<string>("FIELD_ENCRYPTION_KEY_BASE64");
    if (!value)
      throw new ServiceUnavailableException(
        "Field encryption is not configured.",
      );
    const key = Buffer.from(value, "base64");
    if (key.length !== 32)
      throw new ServiceUnavailableException(
        "Field encryption key must be 32 bytes.",
      );
    return key;
  }
  encrypt(plaintext: string): EncryptedField {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    return {
      ciphertext: Uint8Array.from(ciphertext),
      iv: Uint8Array.from(iv),
      authTag: Uint8Array.from(cipher.getAuthTag()),
      keyVersion: 1,
    };
  }
  decrypt(value: EncryptedField) {
    const decipher = createDecipheriv("aes-256-gcm", this.key(), value.iv);
    decipher.setAuthTag(value.authTag);
    return Buffer.concat([
      decipher.update(value.ciphertext),
      decipher.final(),
    ]).toString("utf8");
  }
}
