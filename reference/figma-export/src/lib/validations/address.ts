import { z } from 'zod';

/**
 * Address validation schemas for form validation
 */

export const addressSchema = z.object({
  street: z.string().min(3, 'Street address must be at least 3 characters'),
  unit: z.string().optional(),
  suburb: z.string().min(2, 'Suburb is required'),
  state: z.string().length(3, 'State must be a valid 3-letter code').or(z.string().length(2, 'State must be a valid 2-letter code')),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
});

export const propertyAddressSchema = addressSchema.extend({
  propertyType: z.string().min(1, 'Property type is required'),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type PropertyAddressFormData = z.infer<typeof propertyAddressSchema>;
