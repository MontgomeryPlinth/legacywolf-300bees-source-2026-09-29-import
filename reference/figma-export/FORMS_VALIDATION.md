# Forms & Validation Documentation

## Overview

The Legacy Wolf application uses **react-hook-form** with **Zod** for form validation. All forms are type-safe, accessible, and follow consistent patterns.

## Architecture

### Stack
- **react-hook-form** v7.55.0 - Form state management and validation
- **zod** v4.4.3 - Schema validation
- **@hookform/resolvers** v5.4.0 - Zod integration with react-hook-form

### File Structure

```
src/
├── lib/
│   └── validations/
│       ├── auth.ts           # Login, register, password reset schemas
│       ├── user.ts           # Profile, pet, contact, property schemas
│       ├── incident.ts       # Incident report and resolution schemas
│       ├── filters.ts        # Search and filter schemas
│       └── index.ts          # Central export
├── app/
    └── components/
        ├── auth/
        │   └── LoginForm.tsx
        ├── forms/
        │   ├── ProfileEditForm.tsx
        │   ├── IncidentReportForm.tsx
        │   ├── UserSearchForm.tsx
        │   ├── IncidentSearchForm.tsx
        │   └── index.ts
        └── user/
            └── screens/
                ├── PetManagement.tsx (original)
                └── PetManagementEnhanced.tsx (with validation)
```

## Validation Schemas

### Authentication (`auth.ts`)

#### Login Schema
```typescript
const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(6),
  role: z.enum(["user", "contact", "responder", "admin"]),
  rememberMe: z.boolean().optional(),
});
```

#### Register Schema
```typescript
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+61\s?\d{3}\s?\d{3}\s?\d{3}$/),
  password: z.string().min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### User Data (`user.ts`)

#### Profile Schema
```typescript
const userProfileSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+61\s?\d{3}\s?\d{3}\s?\d{3}$/),
});
```

#### Pet Schema
```typescript
const petSchema = z.object({
  name: z.string().min(1).max(50),
  species: z.string().min(1),
  breed: z.string().min(1),
  age: z.coerce.number().min(0).max(50),
  sex: z.enum(["Male", "Female"]),
  weight: z.coerce.number().min(0.1).max(200),
  microchip: z.string().min(1),
  vetName: z.string().min(1),
  vetPhone: z.string().regex(/^\+61\s?\d{1}\s?\d{4}\s?\d{4}$/),
  conditions: z.string().optional(),
  medications: z.string().optional(),
  morningRoutine: z.string().min(1),
  eveningRoutine: z.string().min(1),
  preferences: z.string().min(10),
  guardianId: z.string().min(1),
  backupGuardianId: z.string().optional(),
});
```

#### Contact Schema
```typescript
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  relationship: z.string().min(1),
  phone: z.string().regex(/^\+61\s?\d{3}\s?\d{3}\s?\d{3}$/),
  email: z.string().email().optional().or(z.literal("")),
  roles: z.array(z.string()).min(1),
  instructions: z.string().optional(),
});
```

#### Property Schema
```typescript
const propertySchema = z.object({
  address: z.string().min(5),
  unit: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postcode: z.string().regex(/^\d{4}$/),
  propertyType: z.string().min(1),
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
```

### Incidents (`incident.ts`)

#### Incident Report Schema
```typescript
const incidentReportSchema = z.object({
  userId: z.string().min(1),
  priority: z.enum(["critical", "high", "medium", "low"]),
  services: z.array(z.string()).min(1),
  notes: z.string().min(10).max(1000),
  dispatchResponder: z.boolean().optional(),
  responderId: z.string().optional(),
});
```

#### Incident Resolution Schema
```typescript
const incidentResolutionSchema = z.object({
  resolution: z.enum(["resolved", "false-alarm"]),
  notes: z.string().min(10).max(1000),
  userContacted: z.boolean(),
  propertySecured: z.boolean(),
  petStatus: z.enum(["safe", "handed-to-guardian", "vet-required", "not-applicable"]).optional(),
  followUpRequired: z.boolean(),
});
```

### Search Filters (`filters.ts`)

#### User Search Schema
```typescript
const userSearchSchema = z.object({
  query: z.string().optional(),
  planTier: z.enum(["friend-alert", "attend-check", "pet-guardian", "full", "all"]).optional(),
  status: z.enum(["protected", "paused", "trip-mode", "all"]).optional(),
  sortBy: z.enum(["name", "joinedDate", "planTier", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
```

#### Incident Search Schema
```typescript
const incidentSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(["triggered", "dispatched", "en-route", "on-scene", "resolved", "false-alarm", "active", "all"]).optional(),
  priority: z.enum(["critical", "high", "medium", "low", "all"]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  responderId: z.string().optional(),
  sortBy: z.enum(["triggeredAt", "priority", "status", "userName"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
```

## Form Components

### 1. LoginForm

**Location:** `src/app/components/auth/LoginForm.tsx`

**Features:**
- Role-based login (user, contact, responder, admin)
- Email & password validation
- Remember me option
- Visual role selection with descriptions
- Demo mode info

**Usage:**
```typescript
import { LoginForm } from '@/app/components/auth/LoginForm';

function App() {
  return <LoginForm />;
}
```

### 2. ProfileEditForm

**Location:** `src/app/components/forms/ProfileEditForm.tsx`

**Features:**
- Edit name, email, phone
- Real-time validation
- Disabled save button when no changes
- Success/cancel callbacks

**Usage:**
```typescript
import { ProfileEditForm } from '@/app/components/forms';

function ProfilePage() {
  return (
    <ProfileEditForm
      onSuccess={() => console.log('Saved!')}
      onCancel={() => navigate(-1)}
    />
  );
}
```

### 3. PetManagementEnhanced

**Location:** `src/app/components/user/screens/PetManagementEnhanced.tsx`

**Features:**
- Full pet CRUD with validation
- Comprehensive form (13 fields)
- Guardian selection from contacts
- Medical info, routines, preferences
- Visual pet cards with all details

**Usage:**
```typescript
import { PetManagement } from '@/app/components/user/screens/PetManagementEnhanced';

// Replace existing PetManagement import
```

### 4. IncidentReportForm

**Location:** `src/app/components/forms/IncidentReportForm.tsx`

**Features:**
- Create new incidents
- Priority selection
- Service activation checkboxes
- Optional responder dispatch
- Critical action warning

**Usage:**
```typescript
import { IncidentReportForm } from '@/app/components/forms';

function AdminIncidents() {
  return (
    <IncidentReportForm
      userId="LW-US-8472"
      onSuccess={(incidentId) => navigate(`/incidents/${incidentId}`)}
      onCancel={() => setShowForm(false)}
    />
  );
}
```

### 5. UserSearchForm

**Location:** `src/app/components/forms/UserSearchForm.tsx`

**Features:**
- Quick search input
- Collapsible advanced filters
- Plan tier & status filters
- Sort options
- Reset functionality

**Usage:**
```typescript
import { UserSearchForm } from '@/app/components/forms';

function UsersPage() {
  const handleSearch = (filters: UserSearchFormData) => {
    // Apply filters to user list
  };

  return (
    <UserSearchForm
      onSearch={handleSearch}
      onReset={() => setUsers(allUsers)}
    />
  );
}
```

### 6. IncidentSearchForm

**Location:** `src/app/components/forms/IncidentSearchForm.tsx`

**Features:**
- Search by ID, user, address
- Status & priority quick filters
- Date range selection
- Responder filter
- Collapsible advanced options

**Usage:**
```typescript
import { IncidentSearchForm } from '@/app/components/forms';

function IncidentsPage() {
  return (
    <IncidentSearchForm
      onSearch={(filters) => filterIncidents(filters)}
      onReset={() => setIncidents(allIncidents)}
    />
  );
}
```

## Usage Patterns

### Basic Form Setup

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema, type MyFormData } from '@/lib/validations';

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      field1: '',
      field2: 0,
    },
  });

  const onSubmit = async (data: MyFormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('field1')} />
      {errors.field1 && <p>{errors.field1.message}</p>}
      
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

### With Select/Dropdown

```typescript
<select {...register('status')}>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</select>
```

### With Checkbox

```typescript
<input
  type="checkbox"
  {...register('agreeToTerms')}
/>
```

### With Custom Components

```typescript
import { Checkbox } from '@/app/components/ui/checkbox';

const selectedRoles = watch('roles');

<Checkbox
  checked={selectedRoles.includes('pet-guardian')}
  onCheckedChange={(checked) => {
    const current = selectedRoles || [];
    setValue('roles', checked
      ? [...current, 'pet-guardian']
      : current.filter(r => r !== 'pet-guardian')
    );
  }}
/>
```

### Watching Form Values

```typescript
const selectedRole = watch('role');

// Use in conditional rendering
{selectedRole === 'admin' && (
  <div>Admin-specific fields</div>
)}
```

### Resetting Form

```typescript
const { reset } = useForm();

// Reset to default values
reset();

// Reset with new values
reset({
  name: 'New Name',
  email: 'new@email.com',
});
```

### Dynamic Validation

```typescript
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});
```

## Validation Rules

### Australian Phone Numbers
```typescript
z.string().regex(/^\+61\s?\d{3}\s?\d{3}\s?\d{3}$/)
// Matches: +61 XXX XXX XXX or +61XXXXXXXXX
```

### Australian Postcodes
```typescript
z.string().regex(/^\d{4}$/)
// Matches: 4 digits exactly
```

### Email
```typescript
z.string().email()
// Built-in email validation
```

### Password Strength
```typescript
z.string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
```

### Number Ranges
```typescript
z.coerce.number()  // Convert string to number
  .min(0, "Must be positive")
  .max(100, "Must be less than 100")
```

### Optional Fields
```typescript
z.string().optional()  // Can be undefined
z.string().or(z.literal(""))  // Can be empty string
```

### Arrays
```typescript
z.array(z.string())
  .min(1, "Select at least one option")
  .max(5, "Maximum 5 selections")
```

## Error Handling

### Display Field Errors
```typescript
{errors.fieldName && (
  <p className="text-sm text-destructive">
    {errors.fieldName.message}
  </p>
)}
```

### Form-level Errors
```typescript
{errors.root && (
  <p className="text-sm text-destructive">
    {errors.root.message}
  </p>
)}
```

### Custom Error Messages
```typescript
try {
  await handleSubmit(onSubmit)();
} catch (error) {
  toast.error('Submission failed', {
    description: error.message,
  });
}
```

## Accessibility

All forms include:
- ✅ Proper label associations (`htmlFor` + `id`)
- ✅ Error messages announced to screen readers
- ✅ Required field indicators (*)
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ ARIA attributes on custom components

## Testing

### Unit Test Example
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditForm } from './ProfileEditForm';

test('validates required fields', async () => {
  render(<ProfileEditForm />);
  
  const submitButton = screen.getByRole('button', { name: /save/i });
  await userEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

## Migration Guide

### Convert Existing Forms

**Before (manual state):**
```typescript
const [name, setName] = useState('');
const [errors, setErrors] = useState({});

const handleSubmit = () => {
  if (!name) {
    setErrors({ name: 'Required' });
    return;
  }
  // Submit...
};
```

**After (react-hook-form + zod):**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});

const onSubmit = (data) => {
  // Data is already validated!
};
```

## Best Practices

1. **Always use schemas** - Define validation in one place
2. **Type-safe forms** - Use `z.infer<typeof schema>` for types
3. **Meaningful errors** - Write clear, helpful error messages
4. **Loading states** - Disable submit button while submitting
5. **Success feedback** - Show toast notifications
6. **Reset on success** - Clear form after successful submission
7. **Accessibility first** - Labels, ARIA, keyboard support
8. **Test validation** - Unit test all validation rules

## Resources

- **react-hook-form docs:** https://react-hook-form.com/
- **Zod docs:** https://zod.dev/
- **Validation schemas:** `src/lib/validations/`
- **Form components:** `src/app/components/forms/`
- **Examples:** See individual form components for patterns
