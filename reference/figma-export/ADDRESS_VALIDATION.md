# Address Validation System

## Overview

The Legacy Wolf app includes a comprehensive address validation system that validates Australian addresses against postal data. This ensures that all addresses entered in the system are valid and correctly formatted.

## Features

- ✅ **Real-time validation** - Addresses are validated as users type
- ✅ **Postal data verification** - Validates suburb/postcode/state combinations
- ✅ **Auto-fill suggestions** - Automatically fills state based on postcode
- ✅ **Smart suggestions** - Suggests correct suburbs when there's a mismatch
- ✅ **Visual feedback** - Clear error messages and success indicators
- ✅ **Reusable components** - Can be used in any form requiring address input

## Components

### 1. AddressInput Component

A reusable component that provides a complete address input form with validation.

**Location:** `/src/app/components/forms/AddressInput.tsx`

**Usage:**

```tsx
import { AddressInput } from './components/forms/AddressInput';
import type { AddressData } from '../../lib/utils/addressValidation';

function MyForm() {
  const [address, setAddress] = useState<AddressData>({
    street: '',
    unit: '',
    suburb: '',
    state: '',
    postcode: '',
  });

  const [isValid, setIsValid] = useState(false);

  return (
    <AddressInput
      value={address}
      onChange={setAddress}
      onValidationChange={(result) => setIsValid(result.isValid)}
    />
  );
}
```

**Props:**

- `value: AddressData` - Current address data
- `onChange: (address: AddressData) => void` - Called when address changes
- `onValidationChange?: (result: AddressValidationResult) => void` - Called when validation completes
- `disabled?: boolean` - Disable all inputs

### 2. AddressFormDialog Component

A modal dialog specifically designed for updating property addresses.

**Location:** `/src/app/components/forms/AddressFormDialog.tsx`

**Usage:**

```tsx
import { AddressFormDialog } from './components/forms/AddressFormDialog';

function PropertyPage() {
  const [showDialog, setShowDialog] = useState(false);

  const handleSave = (address: PropertyAddressData) => {
    // Update your property address
    updateProperty(address);
  };

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>Update Address</Button>
      
      <AddressFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        initialAddress={currentAddress}
        onSave={handleSave}
      />
    </>
  );
}
```

**Props:**

- `open: boolean` - Dialog open state
- `onOpenChange: (open: boolean) => void` - Called when dialog should open/close
- `initialAddress?: PropertyAddressData` - Initial address values
- `onSave: (address: PropertyAddressData) => void` - Called when user saves
- `title?: string` - Dialog title (default: "Update Address")
- `description?: string` - Dialog description

## Validation Utilities

### Location: `/src/lib/utils/addressValidation.ts`

### Functions

#### `validateAddress(address: AddressData): Promise<AddressValidationResult>`

Validates a complete address against postal data.

**Returns:**
```typescript
{
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
```

#### `validatePostcodeFormat(postcode: string): boolean`

Checks if postcode is in correct 4-digit format.

#### `validatePostcodeExists(postcode: string): boolean`

Checks if postcode exists in the postal database.

#### `getSuburbsForPostcode(postcode: string): string[]`

Returns valid suburbs for a given postcode.

#### `getStateForPostcode(postcode: string): string | null`

Returns the correct state for a given postcode.

#### `getAddressSuggestionsFromPostcode(postcode: string)`

Gets auto-fill suggestions based on postcode.

**Returns:**
```typescript
{
  state?: string;
  suburbs: string[];
}
```

#### `formatAddress(address: AddressData): string`

Formats an address for display.

## Validation Rules

### Street Address
- Minimum 3 characters
- Required field

### Unit/Apartment
- Optional field
- No validation rules

### Postcode
- Must be exactly 4 digits
- Must exist in postal database
- Must match the selected suburb and state

### Suburb
- Minimum 2 characters
- Must match one of the valid suburbs for the entered postcode
- Case-insensitive matching

### State
- Must be a valid Australian state/territory code
- Must match the state for the entered postcode
- Supported codes: NSW, VIC, QLD, WA, SA, TAS, ACT, NT

## Postal Database

The current implementation uses a mock postal database with common Australian postcodes. In production, this should be replaced with:

1. **Australia Post API** - Official postal data
2. **AddressFinder** - Commercial address validation service
3. **Google Places API** - Address autocomplete and validation

### Current Mock Data

The mock database includes postcodes for:
- Sydney metro areas (2000, 2060, 2009, 2011, 2007, 2042)
- Melbourne (3000)
- Brisbane (4000)
- Adelaide (5000)
- Perth (6000)
- Hobart (7000)
- Darwin (0800)
- Canberra (2600)

### Extending the Database

To add more postcodes to the mock database:

```typescript
// In /src/lib/utils/addressValidation.ts
const MOCK_POSTAL_DATABASE: Record<string, { suburbs: string[]; state: string }> = {
  '2000': { suburbs: ['Sydney', 'Haymarket'], state: 'NSW' },
  // Add your postcodes here
  '3056': { suburbs: ['Brunswick', 'Brunswick West'], state: 'VIC' },
};
```

## Integration Examples

### Example 1: Property Access Page

See `/src/app/components/user/screens/PropertyAccess.tsx` for a complete working example.

### Example 2: Custom Form with Address

```tsx
import { useState } from 'react';
import { AddressInput } from './components/forms/AddressInput';
import type { AddressData, AddressValidationResult } from '../lib/utils/addressValidation';

function CustomForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      unit: '',
      suburb: '',
      state: '',
      postcode: '',
    },
  });

  const [addressValid, setAddressValid] = useState(false);

  const handleSubmit = () => {
    if (!addressValid) {
      alert('Please enter a valid address');
      return;
    }
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      
      <AddressInput
        value={formData.address}
        onChange={(address) => setFormData({ ...formData, address })}
        onValidationChange={(result) => setAddressValid(result.isValid)}
      />
      
      <button type="submit" disabled={!addressValid}>
        Submit
      </button>
    </form>
  );
}
```

## User Experience Features

### Auto-fill State
When a user enters a valid postcode, the state is automatically filled based on the postal database.

### Suburb Suggestions
If the entered suburb doesn't match the postcode, clickable suggestions are shown for the correct suburbs.

### Real-time Validation
Validation occurs 500ms after the user stops typing, providing immediate feedback without being intrusive.

### Visual Indicators
- ✅ Green checkmark when address is valid
- ❌ Red error messages for invalid fields
- 💡 Blue badges for clickable suggestions

## Future Enhancements

1. **API Integration** - Replace mock database with real postal service API
2. **Address Autocomplete** - Add autocomplete as user types street address
3. **Geocoding** - Validate addresses using geocoding services
4. **International Support** - Add support for non-Australian addresses
5. **Address History** - Save and suggest previously used addresses
6. **Smart Formatting** - Auto-format addresses to standard format

## Testing

To test the address validation:

1. **Valid Address:**
   - Street: "42 Melbourne Street"
   - Unit: "Apartment 7B"
   - Postcode: "2060"
   - Suburb: "North Sydney" (will auto-suggest if you type something else)
   - State: "NSW" (will auto-fill from postcode)

2. **Invalid Suburb:**
   - Enter postcode "2060"
   - Enter suburb "Sydney" (incorrect for this postcode)
   - System will suggest: "North Sydney", "McMahons Point", "Lavender Bay"

3. **Invalid Postcode:**
   - Enter postcode "9999"
   - System will show error: "This postcode does not exist in our database"

## Notes for Developers

- All address validation is performed client-side for quick feedback
- The validation is asynchronous to support future API integration
- All components are fully typed with TypeScript
- The system uses Zod schemas for form validation compatibility
- Components are styled with Tailwind CSS following Legacy Wolf brand guidelines
