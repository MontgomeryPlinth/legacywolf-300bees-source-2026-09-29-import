# Forms Quick Reference

## 🚀 Import & Use

```typescript
// Import validation schema
import { petSchema, type PetFormData } from '@/lib/validations';

// Import form components
import { 
  LoginForm, 
  ProfileEditForm,
  IncidentReportForm,
  UserSearchForm,
  IncidentSearchForm
} from '@/app/components/forms';
```

## 📝 Create a Validated Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm<PetFormData>({
  resolver: zodResolver(petSchema),
  defaultValues: {
    name: "",
    age: 0,
  },
});

const onSubmit = (data: PetFormData) => {
  // Data is validated!
  console.log(data);
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register("name")} />
    {errors.name && <p>{errors.name.message}</p>}
    
    <button type="submit">Submit</button>
  </form>
);
```

## 📋 Available Validation Schemas

| Schema | Import | Fields |
|--------|--------|--------|
| Login | `loginSchema` | email, password, role |
| Register | `registerSchema` | name, email, phone, password |
| Profile | `userProfileSchema` | name, email, phone |
| Pet | `petSchema` | name, species, breed, age, etc (17 fields) |
| Contact | `contactSchema` | name, relationship, phone, email, roles |
| Property | `propertySchema` | address, city, postcode, access codes |
| Incident Report | `incidentReportSchema` | userId, priority, services, notes |
| User Search | `userSearchSchema` | query, planTier, status, sortBy |
| Incident Search | `incidentSearchSchema` | query, status, priority, dateRange |

## 🎯 Common Patterns

### Text Input
```typescript
<Input {...register("fieldName")} />
{errors.fieldName && <p>{errors.fieldName.message}</p>}
```

### Select/Dropdown
```typescript
<select {...register("status")}>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</select>
```

### Checkbox (Single)
```typescript
<input type="checkbox" {...register("rememberMe")} />
```

### Checkbox (Multiple - Array)
```typescript
const selectedRoles = watch("roles");

<Checkbox
  checked={selectedRoles?.includes("pet-guardian")}
  onCheckedChange={(checked) => {
    setValue("roles", checked 
      ? [...selectedRoles, "pet-guardian"]
      : selectedRoles.filter(r => r !== "pet-guardian")
    );
  }}
/>
```

### Number Input
```typescript
<Input
  type="number"
  {...register("age", { valueAsNumber: true })}
/>
```

### Date Input
```typescript
<Input
  type="date"
  {...register("dateFrom", {
    setValueAs: (v) => v ? new Date(v) : undefined
  })}
/>
```

### Watch Field Values
```typescript
const role = watch("role");  // Get current value
const allValues = watch();   // Get all values
```

### Set Field Value
```typescript
const { setValue } = useForm();

setValue("fieldName", "new value");
```

### Reset Form
```typescript
const { reset } = useForm();

reset();  // Reset to defaults
reset({ name: "New Name" });  // Reset with new values
```

## ✅ Validation Rules

### Australian Phone
```typescript
z.string().regex(/^\+61\s?\d{3}\s?\d{3}\s?\d{3}$/)
// Matches: +61 XXX XXX XXX or +61XXXXXXXXX
```

### Australian Postcode
```typescript
z.string().regex(/^\d{4}$/)
// Matches: 4 digits
```

### Email
```typescript
z.string().email()
```

### Password Strength
```typescript
z.string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
```

### Number Range
```typescript
z.coerce.number()
  .min(0, "Must be positive")
  .max(100, "Max 100")
```

### Optional Field
```typescript
z.string().optional()
z.string().or(z.literal(""))  // Allow empty string
```

### Array (Min/Max)
```typescript
z.array(z.string())
  .min(1, "Select at least one")
  .max(5, "Max 5 selections")
```

### Custom Validation
```typescript
z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});
```

## 🎨 Form States

### Loading State
```typescript
const { formState: { isSubmitting } } = useForm();

<Button disabled={isSubmitting}>
  {isSubmitting ? "Loading..." : "Submit"}
</Button>
```

### Dirty State (Has Changes)
```typescript
const { formState: { isDirty } } = useForm();

<Button disabled={!isDirty}>
  Save Changes
</Button>
```

### Valid State
```typescript
const { formState: { isValid } } = useForm();

<Button disabled={!isValid}>Submit</Button>
```

## 🔧 Form Components

### LoginForm
```typescript
<LoginForm />
// Auto-handles: role selection, validation, authentication
```

### ProfileEditForm
```typescript
<ProfileEditForm
  onSuccess={() => navigate('/profile')}
  onCancel={() => setEditing(false)}
/>
```

### IncidentReportForm
```typescript
<IncidentReportForm
  userId="LW-US-8472"
  onSuccess={(incidentId) => navigate(`/incidents/${incidentId}`)}
  onCancel={() => setShowForm(false)}
/>
```

### UserSearchForm
```typescript
<UserSearchForm
  onSearch={(filters) => applyFilters(filters)}
  onReset={() => clearFilters()}
/>
```

### IncidentSearchForm
```typescript
<IncidentSearchForm
  onSearch={(filters) => filterIncidents(filters)}
  onReset={() => setIncidents(allIncidents)}
/>
```

## 🚨 Error Display

### Field Error
```typescript
{errors.name && (
  <p className="text-sm text-destructive">
    {errors.name.message}
  </p>
)}
```

### With Toast
```typescript
try {
  await handleSubmit(onSubmit)();
  toast.success("Success!");
} catch (error) {
  toast.error("Error", {
    description: error.message
  });
}
```

## 📦 File Locations

```
src/
├── lib/validations/           # Validation schemas
│   ├── auth.ts
│   ├── user.ts
│   ├── incident.ts
│   └── filters.ts
├── app/components/
    ├── auth/
    │   └── LoginForm.tsx
    ├── forms/
    │   ├── ProfileEditForm.tsx
    │   ├── IncidentReportForm.tsx
    │   ├── UserSearchForm.tsx
    │   ├── IncidentSearchForm.tsx
    │   └── index.ts
    └── user/screens/
        ├── PetManagementEnhanced.tsx
        └── PeopleManagementEnhanced.tsx
```

## 🎯 Migration Path

### Replace Old Components
```diff
# PetManagement
- import { PetManagement } from './screens/PetManagement';
+ import { PetManagement } from './screens/PetManagementEnhanced';

# PeopleManagement
- import { PeopleManagement } from './screens/PeopleManagement';
+ import { PeopleManagement } from './screens/PeopleManagementEnhanced';
```

### Add Authentication
```typescript
import { LoginForm } from '@/app/components/auth/LoginForm';

function App() {
  const { session } = useApp();
  
  if (!session.isAuthenticated) {
    return <LoginForm />;
  }
  
  return <MainApp />;
}
```

## 📚 Full Documentation

See `FORMS_VALIDATION.md` for:
- Complete schema reference
- Advanced patterns
- Testing examples
- Accessibility guidelines
- Error handling strategies
