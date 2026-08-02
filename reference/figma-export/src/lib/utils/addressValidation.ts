/**
 * Address Validation Utility
 * Validates Australian addresses against postal data
 */

import { POSTAL_DATA } from './postalDatabase';

// Australian state/territory codes
export const AUSTRALIAN_STATES = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NT', name: 'Northern Territory' },
];

export interface AddressValidationResult {
  isValid: boolean;
  errors: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
  suggestions?: {
    suburb?: string[];
    state?: string;
  };
}

export interface AddressData {
  street: string;
  unit?: string;
  suburb: string;
  state: string;
  postcode: string;
}

/**
 * Validates an Australian postcode format
 */
export function validatePostcodeFormat(postcode: string): boolean {
  // Australian postcodes are 4 digits
  return /^\d{4}$/.test(postcode);
}

/**
 * Validates if a postcode exists in the postal database
 */
export function validatePostcodeExists(postcode: string): boolean {
  return postcode in POSTAL_DATA;
}

/**
 * Gets valid suburbs for a given postcode
 */
export function getSuburbsForPostcode(postcode: string): string[] {
  const data = POSTAL_DATA[postcode];
  return data ? data.suburbs : [];
}

/**
 * Gets the state for a given postcode
 */
export function getStateForPostcode(postcode: string): string | null {
  const data = POSTAL_DATA[postcode];
  return data ? data.state : null;
}

/**
 * Validates a complete address against postal data
 */
export async function validateAddress(address: AddressData): Promise<AddressValidationResult> {
  const errors: AddressValidationResult['errors'] = {};
  const suggestions: AddressValidationResult['suggestions'] = {};

  // Validate street address
  if (!address.street || address.street.trim().length < 3) {
    errors.street = 'Street address must be at least 3 characters';
  }

  // Validate postcode format
  if (!address.postcode) {
    errors.postcode = 'Postcode is required';
  } else if (!validatePostcodeFormat(address.postcode)) {
    errors.postcode = 'Postcode must be 4 digits';
  } else if (!validatePostcodeExists(address.postcode)) {
    errors.postcode = 'This postcode does not exist in our database';
  } else {
    // Validate suburb matches postcode
    const validSuburbs = getSuburbsForPostcode(address.postcode);
    const suburbMatch = validSuburbs.some(
      (suburb) => suburb.toLowerCase() === address.suburb.toLowerCase()
    );

    if (!suburbMatch) {
      errors.suburb = `Suburb does not match postcode ${address.postcode}`;
      suggestions.suburb = validSuburbs;
    }

    // Validate state matches postcode
    const validState = getStateForPostcode(address.postcode);
    if (validState && validState !== address.state) {
      errors.state = `State does not match postcode ${address.postcode}`;
      suggestions.state = validState;
    }
  }

  // Validate suburb
  if (!address.suburb || address.suburb.trim().length < 2) {
    errors.suburb = errors.suburb || 'Suburb is required';
  }

  // Validate state
  if (!address.state) {
    errors.state = errors.state || 'State is required';
  } else {
    const validState = AUSTRALIAN_STATES.find((s) => s.code === address.state);
    if (!validState) {
      errors.state = 'Invalid state code';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    suggestions,
  };
}

/**
 * Formats an address for display
 */
export function formatAddress(address: AddressData): string {
  const parts = [address.street];
  if (address.unit) {
    parts[0] = `${address.unit}, ${parts[0]}`;
  }
  parts.push(`${address.suburb} ${address.state} ${address.postcode}`);
  return parts.join(', ');
}

/**
 * Auto-fills state and suburb suggestions based on postcode
 */
export function getAddressSuggestionsFromPostcode(postcode: string): {
  state?: string;
  suburbs: string[];
} {
  if (!validatePostcodeFormat(postcode) || !validatePostcodeExists(postcode)) {
    return { suburbs: [] };
  }

  return {
    state: getStateForPostcode(postcode) || undefined,
    suburbs: getSuburbsForPostcode(postcode),
  };
}