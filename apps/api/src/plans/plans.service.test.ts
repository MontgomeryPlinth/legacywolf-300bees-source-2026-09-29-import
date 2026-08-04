import { describe, expect, it } from "vitest";

import { calculatePlanHealthScore } from "./plans.service";

describe("calculatePlanHealthScore", () => {
  it("awards 25% for each completed readiness area", () => {
    expect(
      calculatePlanHealthScore({
        hasPeopleAndQueue: true,
        hasPropertyAccess: false,
        hasPets: false,
        hasWishes: false,
      }),
    ).toBe(25);
  });

  it("reaches 100% when every readiness area is complete", () => {
    expect(
      calculatePlanHealthScore({
        hasPeopleAndQueue: true,
        hasPropertyAccess: true,
        hasPets: true,
        hasWishes: true,
      }),
    ).toBe(100);
  });
});
