import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phone: z.string()
    .regex(/^\+61\s?\d{3}\s?\d{3}\s?\d{3}$/, "Must be a valid Australian phone number (+61 XXX XXX XXX)"),
});

export const propertySchema = z.object({
  address: z.string()
    .min(5, "Address is required"),
  unit: z.string().optional(),
  city: z.string()
    .min(2, "City is required"),
  state: z.string()
    .min(2, "State is required"),
  postcode: z.string()
    .regex(/^\d{4}$/, "Must be a valid Australian postcode (4 digits)"),
  propertyType: z.string()
    .min(1, "Property type is required"),

  // Building Access
  intercom: z.string().optional(),
  concierge: z.string().optional(),
  afterHoursCode: z.string().optional(),

  // Unit Access
  keysafeLocation: z.string().optional(),
  keysafeCode: z.string().optional(),
  doorType: z.string().optional(),

  // Alarm
  alarmSystem: z.string().optional(),
  alarmCode: z.string().optional(),
  alarmPanelLocation: z.string().optional(),
});

export const petSchema = z.object({
  name: z.string()
    .min(1, "Pet name is required")
    .max(50, "Name is too long"),
  species: z.string()
    .min(1, "Species is required"),
  breed: z.string()
    .min(1, "Breed is required"),
  age: z.coerce.number()
    .min(0, "Age must be positive")
    .max(50, "Age seems too high"),
  sex: z.enum(["Male", "Female"], {
    required_error: "Please select a sex",
  }),
  weight: z.coerce.number()
    .min(0.1, "Weight must be greater than 0")
    .max(200, "Weight seems too high"),
  microchip: z.string()
    .min(1, "Microchip number is required"),

  // Vet Info
  vetName: z.string()
    .min(1, "Vet name is required"),
  vetPhone: z.string()
    .regex(/^\+61\s?\d{1}\s?\d{4}\s?\d{4}$/, "Must be a valid Australian phone number"),

  // Medical
  conditions: z.string().optional(),
  medications: z.string().optional(),

  // Routines
  morningRoutine: z.string()
    .min(1, "Morning routine is required"),
  eveningRoutine: z.string()
    .min(1, "Evening routine is required"),

  preferences: z.string()
    .min(10, "Please provide at least 10 characters of preferences/notes"),

  // Guardians
  guardianId: z.string()
    .min(1, "Primary guardian is required"),
  backupGuardianId: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  relationship: z.string()
    .min(1, "Relationship is required"),
  phone: z.string()
    .regex(/^\+61\s?\d{3}\s?\d{3}\s?\d{3}$/, "Must be a valid Australian phone number (+61 XXX XXX XXX)"),
  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  roles: z.array(z.string())
    .min(1, "Please select at least one role"),
  instructions: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type PropertyFormData = z.infer<typeof propertySchema>;
export type PetFormData = z.infer<typeof petSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
