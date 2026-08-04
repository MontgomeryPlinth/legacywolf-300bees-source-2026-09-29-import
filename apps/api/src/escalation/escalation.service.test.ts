import { describe, expect, it } from "vitest";

import { escalationJobId } from "./escalation.service";

describe("escalationJobId", () => {
  it.each(["expiry", "sick", "offline"] as const)(
    "creates a BullMQ-safe %s job ID",
    (kind) => {
      const jobId = escalationJobId(
        kind,
        "8ae33d80-2bca-4df0-b4f4-a241689402af",
      );

      expect(jobId).toBe(
        `${kind}-8ae33d80-2bca-4df0-b4f4-a241689402af`,
      );
      expect(jobId).not.toContain(":");
    },
  );
});
