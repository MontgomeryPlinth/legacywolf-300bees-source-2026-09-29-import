import { describe, expect, it } from "vitest";
import { colors, spacing } from "./index";

describe("brand tokens", () => {
  it("keeps the binding palette and rhythm", () => {
    expect(Object.keys(colors)).toHaveLength(11);
    expect(spacing[1]).toBe(4);
  });
});
