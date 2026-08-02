# Address Validation - Quick Start Guide

## ✅ What's Been Implemented

The Legacy Wolf app now includes a complete address validation system that:
- ✅ Validates addresses against Australian postal data
- ✅ Auto-fills state based on postcode
- ✅ Suggests correct suburbs when there's a mismatch
- ✅ Provides real-time validation feedback
- ✅ Works in the Property Access page
- ✅ Can be reused in any form that needs addresses

## 🚀 Quick Test

1. **Navigate to Property Access:**
   - Login as a User
   - Click on "Property" in the bottom navigation
   - Click "Update Address" button

2. **Try Valid Address:**
   - Postcode: `2060`
   - State: Auto-fills to `NSW`
   - Suburb: `North Sydney` (or try typing wrong suburb to see suggestions)
   - Street: `42 Melbourne Street`
   - Unit: `Apartment 7B` (optional)
   - Click "Save Address"

3. **Try Invalid Address:**
   - Postcode: `2060`
   - Suburb: `Sydney` (wrong for this postcode)
   - See suggestions: "North Sydney", "McMahons Point", "Lavender Bay"
   - Click on a suggestion to auto-fill

## 📁 Key Files

### Components
- `/src/app/components/forms/AddressInput.tsx` - Reusable address input component
- `/src/app/components/forms/AddressFormDialog.tsx` - Dialog for updating addresses
- `/src/app/components/user/screens/PropertyAccess.tsx` - Updated to use address dialog

### Utilities
- `/src/lib/utils/addressValidation.ts` - Core validation logic and postal database
- `/src/lib/validations/address.ts` - Zod schemas for form validation

### Documentation
- `/ADDRESS_VALIDATION.md` - Complete documentation
- `/ADDRESS_VALIDATION_QUICK_START.md` - This file

## 🧪 Valid Test Addresses

Use these addresses to test the system:

### Sydney
```
Postcode: 2060
Suburbs: North Sydney, McMahons Point, Lavender Bay
State: NSW
```

```
Postcode: 2000
Suburbs: Sydney, Haymarket, The Rocks
State: NSW
```

```
Postcode: 2009
Suburbs: Pyrmont
State: NSW
```

### Melbourne
```
Postcode: 3000
Suburbs: Melbourne
State: VIC
```

### Other Cities
- Brisbane: `4000` → Brisbane, Spring Hill (QLD)
- Adelaide: `5000` → Adelaide (SA)
- Perth: `6000` → Perth (WA)
- Hobart: `7000` → Hobart (TAS)
- Canberra: `2600` → Canberra (ACT)
- Darwin: `0800` → Darwin (NT)

## 🔄 How It Works

1. **User enters postcode** → System auto-fills state
2. **User enters suburb** → System validates against postcode
3. **Mismatch detected** → System shows clickable suggestions
4. **All fields valid** → Green checkmark appears
5. **User clicks save** → Address updates in app context

## 🎨 Visual Feedback

- **🟢 Green checkmark** = Address verified with postal data
- **🔴 Red text** = Error message for invalid field
- **🔵 Blue badges** = Clickable suggestions
- **⏳ Typing delay** = 500ms debounce before validation runs

## 🔧 Adding to Your Forms

### Simple Integration

```tsx
import { AddressInput } from './components/forms/AddressInput';
import { useState } from 'react';

function MyForm() {
  const [address, setAddress] = useState({
    street: '',
    unit: '',
    suburb: '',
    state: '',
    postcode: '',
  });

  return (
    <AddressInput
      value={address}
      onChange={setAddress}
    />
  );
}
```

### With Validation Callback

```tsx
const [isValid, setIsValid] = useState(false);

<AddressInput
  value={address}
  onChange={setAddress}
  onValidationChange={(result) => setIsValid(result.isValid)}
/>

<button disabled={!isValid}>Submit</button>
```

### Using the Dialog

```tsx
import { AddressFormDialog } from './components/forms/AddressFormDialog';

const [open, setOpen] = useState(false);

<AddressFormDialog
  open={open}
  onOpenChange={setOpen}
  onSave={(address) => {
    console.log('New address:', address);
  }}
/>
```

## 🌟 Features

### Auto-fill State
Type a postcode → state automatically fills

### Smart Suggestions
Type wrong suburb → system suggests correct ones

### Real-time Validation
Validates as you type (with 500ms delay)

### Property Type Selection
Built-in property type dropdown in the dialog:
- House
- Apartment Building
- Townhouse
- Unit
- Other

## 🐛 Common Issues

### Issue: "Postcode does not exist"
**Solution:** Use one of the valid test postcodes listed above

### Issue: "Suburb does not match postcode"
**Solution:** Click on one of the suggested suburbs

### Issue: State won't auto-fill
**Solution:** Make sure postcode is exactly 4 digits

## 📝 Notes

- Mock database includes ~13 postcodes for testing
- In production, replace with real postal API (Australia Post, AddressFinder, etc.)
- Validation is client-side for quick feedback
- All components are fully typed with TypeScript
- Follows Legacy Wolf brand guidelines (Guardian Green #B5C42C)

## ✨ Next Steps

To extend the system:

1. **Add more postcodes** to `/src/lib/utils/addressValidation.ts`
2. **Integrate real API** - Replace mock database with Australia Post API
3. **Add autocomplete** - Use Google Places API for street address autocomplete
4. **Support international** - Add validation for non-Australian addresses
5. **Add to other forms** - Use AddressInput in admin forms, responder forms, etc.

## 🆘 Need Help?

Refer to `/ADDRESS_VALIDATION.md` for complete documentation including:
- Full API reference
- Integration examples
- Future enhancement ideas
- Testing guide
