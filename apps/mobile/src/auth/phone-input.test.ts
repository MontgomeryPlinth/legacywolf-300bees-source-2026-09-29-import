import { describe, expect, it } from "vitest";
import { toE164, validPhone } from "./phone-utils";

describe("international phone input", () => {
  it("normalizes a Colombian mobile with its selected calling code", () => {
    expect(toE164("305 413 1300", "CO")).toBe("+573054131300");
    expect(validPhone("305 413 1300", "CO")).toBe(true);
  });

  it("removes a domestic trunk zero before composing E.164", () => {
    expect(toE164("0412 345 678", "AU")).toBe("+61412345678");
  });
});
