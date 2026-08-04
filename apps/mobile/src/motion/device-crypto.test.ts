import { createPublicKey, verify } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  fromBase64,
  keyPairFromSeed,
  publicKeyPem,
  signPayload,
} from "./device-crypto";

describe("device Ed25519 identity", () => {
  it("creates signatures accepted by the API verifier", () => {
    const pair = keyPairFromSeed(Uint8Array.from({ length: 32 }, (_, i) => i));
    const payload =
      "3bbcee2c-821d-4ec4-89d0-244be43bc130.2026-08-03T18:00:00.000Z.motion.test-nonce";
    const signature = signPayload(payload, pair.secretKey);

    expect(
      verify(
        null,
        Buffer.from(payload),
        createPublicKey(publicKeyPem(pair.publicKey)),
        Buffer.from(fromBase64(signature)),
      ),
    ).toBe(true);
  });
});
