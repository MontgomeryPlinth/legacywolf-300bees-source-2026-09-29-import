/**
 * Postal Database Configuration
 * 
 * This file contains the mock postal database used for address validation.
 * In production, this should be replaced with API calls to a real postal service.
 * 
 * To add more postcodes, simply add entries to the POSTAL_DATA object below.
 */

export interface PostalEntry {
  suburbs: string[];
  state: string;
}

/**
 * Mock Australian Postal Database
 * 
 * Format:
 * 'postcode': { suburbs: ['Suburb1', 'Suburb2'], state: 'STATE' }
 * 
 * To add more postcodes, copy this template:
 * '2XXX': { suburbs: ['YourSuburb'], state: 'NSW' },
 */
export const POSTAL_DATA: Record<string, PostalEntry> = {
  // New South Wales (NSW)
  '2000': { suburbs: ['Sydney', 'Haymarket', 'The Rocks'], state: 'NSW' },
  '2060': { suburbs: ['North Sydney', 'McMahons Point', 'Lavender Bay'], state: 'NSW' },
  '2009': { suburbs: ['Pyrmont'], state: 'NSW' },
  '2011': { suburbs: ['Elizabeth Bay', 'Potts Point', 'Rushcutters Bay'], state: 'NSW' },
  '2007': { suburbs: ['Ultimo', 'Broadway'], state: 'NSW' },
  '2042': { suburbs: ['Enmore', 'Newtown'], state: 'NSW' },
  '2600': { suburbs: ['Canberra'], state: 'ACT' },
  
  // Victoria (VIC)
  '3000': { suburbs: ['Melbourne'], state: 'VIC' },
  
  // Queensland (QLD)
  '4000': { suburbs: ['Brisbane', 'Spring Hill'], state: 'QLD' },
  
  // South Australia (SA)
  '5000': { suburbs: ['Adelaide'], state: 'SA' },
  
  // Western Australia (WA)
  '6000': { suburbs: ['Perth'], state: 'WA' },
  
  // Tasmania (TAS)
  '7000': { suburbs: ['Hobart'], state: 'TAS' },
  
  // Northern Territory (NT)
  '0800': { suburbs: ['Darwin'], state: 'NT' },
  
  // Add more postcodes below:
  // 'XXXX': { suburbs: ['Suburb Name'], state: 'XX' },
};

/**
 * Get postal data for a specific postcode
 */
export function getPostalData(postcode: string): PostalEntry | null {
  return POSTAL_DATA[postcode] || null;
}

/**
 * Check if a postcode exists in the database
 */
export function postcodeExists(postcode: string): boolean {
  return postcode in POSTAL_DATA;
}

/**
 * Get all available postcodes
 */
export function getAllPostcodes(): string[] {
  return Object.keys(POSTAL_DATA);
}

/**
 * Search for suburbs by partial name
 * Useful for autocomplete functionality
 */
export function searchSuburbs(query: string): Array<{ suburb: string; postcode: string; state: string }> {
  const results: Array<{ suburb: string; postcode: string; state: string }> = [];
  const lowerQuery = query.toLowerCase();
  
  Object.entries(POSTAL_DATA).forEach(([postcode, data]) => {
    data.suburbs.forEach((suburb) => {
      if (suburb.toLowerCase().includes(lowerQuery)) {
        results.push({
          suburb,
          postcode,
          state: data.state,
        });
      }
    });
  });
  
  return results;
}

/**
 * Get all suburbs for a state
 */
export function getSuburbsByState(stateCode: string): Array<{ suburb: string; postcode: string }> {
  const results: Array<{ suburb: string; postcode: string }> = [];
  
  Object.entries(POSTAL_DATA).forEach(([postcode, data]) => {
    if (data.state === stateCode) {
      data.suburbs.forEach((suburb) => {
        results.push({ suburb, postcode });
      });
    }
  });
  
  return results;
}

/**
 * Template for adding bulk postcodes
 * 
 * Example usage:
 * ```
 * const newPostcodes = {
 *   '2010': { suburbs: ['Darlinghurst', 'Surry Hills'], state: 'NSW' },
 *   '2021': { suburbs: ['Paddington'], state: 'NSW' },
 *   '2030': { suburbs: ['Dover Heights', 'Rose Bay'], state: 'NSW' },
 * };
 * 
 * Object.assign(POSTAL_DATA, newPostcodes);
 * ```
 */

// Export for use in address validation
export default POSTAL_DATA;
