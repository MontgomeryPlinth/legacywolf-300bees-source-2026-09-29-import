import nacl from "tweetnacl";

const ED25519_PKCS8_SEED_PREFIX = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06,
  0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

const ED25519_SPKI_PUBLIC_PREFIX = Uint8Array.from([
  0x30, 0x2a, 0x30, 0x05, 0x06, 0x03,
  0x2b, 0x65, 0x70, 0x03, 0x21, 0x00,
]);

export function base64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary);
}

export function fromBase64(value: string) {
  const binary = globalThis.atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function hasPrefix(value: Uint8Array, prefix: Uint8Array) {
  return prefix.every((byte, index) => value[index] === byte);
}

export function keyPairFromPrivateBytes(privateBytes: Uint8Array) {
  if (privateBytes.length === nacl.sign.secretKeyLength) {
    return nacl.sign.keyPair.fromSecretKey(privateBytes);
  }

  if (privateBytes.length === nacl.sign.seedLength) {
    return nacl.sign.keyPair.fromSeed(privateBytes);
  }

  // WebCrypto exports an Ed25519 private key as a PKCS#8 document whose
  // final 32 bytes are the seed. Accept it so web-created identities migrate.
  if (
    privateBytes.length === ED25519_PKCS8_SEED_PREFIX.length + nacl.sign.seedLength &&
    hasPrefix(privateBytes, ED25519_PKCS8_SEED_PREFIX)
  ) {
    return nacl.sign.keyPair.fromSeed(
      privateBytes.slice(ED25519_PKCS8_SEED_PREFIX.length),
    );
  }

  return null;
}

export function keyPairFromSeed(seed: Uint8Array) {
  if (seed.length !== nacl.sign.seedLength) {
    throw new Error(`Ed25519 seeds must contain ${nacl.sign.seedLength} bytes.`);
  }
  return nacl.sign.keyPair.fromSeed(seed);
}

export function publicKeyPem(publicKey: Uint8Array) {
  if (publicKey.length !== nacl.sign.publicKeyLength) {
    throw new Error(
      `Ed25519 public keys must contain ${nacl.sign.publicKeyLength} bytes.`,
    );
  }

  const spki = new Uint8Array(
    ED25519_SPKI_PUBLIC_PREFIX.length + publicKey.length,
  );
  spki.set(ED25519_SPKI_PUBLIC_PREFIX);
  spki.set(publicKey, ED25519_SPKI_PUBLIC_PREFIX.length);
  const encoded = base64(spki);
  const lines = encoded.match(/.{1,64}/g)?.join("\n") ?? encoded;
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}

export function signPayload(payload: string, secretKey: Uint8Array) {
  // Heartbeat payloads contain UUIDs, ISO dates, identifiers, and punctuation;
  // all are ASCII and can be encoded without a TextEncoder polyfill.
  const message = Uint8Array.from(payload, (char) => char.charCodeAt(0));
  return base64(nacl.sign.detached(message, secretKey));
}
