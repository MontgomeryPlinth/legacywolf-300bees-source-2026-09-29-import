import { z } from "zod";

export const userSearchSchema = z.object({
  query: z.string().optional(),
  planTier: z.enum(["friend-alert", "attend-check", "pet-guardian", "full", "all"]).optional(),
  status: z.enum(["protected", "paused", "trip-mode", "all"]).optional(),
  sortBy: z.enum(["name", "joinedDate", "planTier", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const incidentSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum([
    "triggered",
    "dispatched",
    "en-route",
    "on-scene",
    "resolved",
    "false-alarm",
    "active",
    "all"
  ]).optional(),
  priority: z.enum(["critical", "high", "medium", "low", "all"]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  responderId: z.string().optional(),
  sortBy: z.enum(["triggeredAt", "priority", "status", "userName"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const responderSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(["available", "on-call", "dispatched", "off-duty", "all"]).optional(),
  zone: z.string().optional(),
  certification: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(["name", "rating", "totalIncidents", "lastActive"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const activityFilterSchema = z.object({
  type: z.enum([
    "user-joined",
    "incident-triggered",
    "incident-resolved",
    "responder-dispatched",
    "check-in-missed",
    "plan-upgraded",
    "all"
  ]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  userId: z.string().optional(),
  incidentId: z.string().optional(),
  responderId: z.string().optional(),
});

export type UserSearchFormData = z.infer<typeof userSearchSchema>;
export type IncidentSearchFormData = z.infer<typeof incidentSearchSchema>;
export type ResponderSearchFormData = z.infer<typeof responderSearchSchema>;
export type ActivityFilterFormData = z.infer<typeof activityFilterSchema>;
