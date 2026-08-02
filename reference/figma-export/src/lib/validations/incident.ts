import { z } from "zod";

export const incidentReportSchema = z.object({
  userId: z.string()
    .min(1, "User ID is required"),
  priority: z.enum(["critical", "high", "medium", "low"], {
    required_error: "Priority is required",
  }),
  services: z.array(z.string())
    .min(1, "At least one service must be selected"),
  notes: z.string()
    .min(10, "Notes must be at least 10 characters")
    .max(1000, "Notes are too long"),
  dispatchResponder: z.boolean().optional(),
  responderId: z.string().optional(),
});

export const incidentUpdateSchema = z.object({
  status: z.enum([
    "triggered",
    "dispatched",
    "en-route",
    "on-scene",
    "resolved",
    "false-alarm"
  ]),
  notes: z.string()
    .max(1000, "Notes are too long")
    .optional(),
  photos: z.array(z.string()).optional(),
});

export const incidentResolutionSchema = z.object({
  resolution: z.enum(["resolved", "false-alarm"], {
    required_error: "Resolution type is required",
  }),
  notes: z.string()
    .min(10, "Please provide details about the resolution")
    .max(1000, "Notes are too long"),
  userContacted: z.boolean(),
  propertySecured: z.boolean(),
  petStatus: z.enum(["safe", "handed-to-guardian", "vet-required", "not-applicable"]).optional(),
  followUpRequired: z.boolean(),
});

export const dispatchResponderSchema = z.object({
  incidentId: z.string()
    .min(1, "Incident ID is required"),
  responderId: z.string()
    .min(1, "Please select a responder"),
  priority: z.enum(["critical", "high", "medium", "low"]),
  specialInstructions: z.string()
    .max(500, "Instructions are too long")
    .optional(),
});

export type IncidentReportFormData = z.infer<typeof incidentReportSchema>;
export type IncidentUpdateFormData = z.infer<typeof incidentUpdateSchema>;
export type IncidentResolutionFormData = z.infer<typeof incidentResolutionSchema>;
export type DispatchResponderFormData = z.infer<typeof dispatchResponderSchema>;
