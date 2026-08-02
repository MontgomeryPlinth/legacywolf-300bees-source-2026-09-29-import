# Quick Start Guide - Mock Data Layer

## 🚀 Get Started in 3 Steps

### Step 1: Import the data utilities
```typescript
import { getCurrentUserData, getAllIncidents, getAllResponders } from '@/data';
```

### Step 2: Use in your components
```typescript
function MyComponent() {
  const { user, pets, people, property } = getCurrentUserData();
  const [incidents] = useState(getAllIncidents());
  const [responders] = useState(getAllResponders());
  
  return <div>Welcome {user?.name}!</div>;
}
```

### Step 3: That's it! 🎉
All data is typed, includes relationships, and dates are pre-converted to Date objects.

---

## 📦 What's Available

| Function | Returns | Description |
|----------|---------|-------------|
| `getCurrentUserData()` | `{ user, pets, people, property }` | Complete profile for LW-US-8472 |
| `getAllIncidents()` | `Incident[]` | All 5 incidents with timelines |
| `getActiveIncidents()` | `Incident[]` | Only non-resolved incidents |
| `getAllResponders()` | `Responder[]` | All 10 responders |
| `getAvailableResponders()` | `Responder[]` | Only available responders |
| `calculateDashboardStats()` | `DashboardStats` | Real-time calculated stats |

---

## 🎯 Common Use Cases

### Load User Profile
```typescript
const { user, pets, people } = getCurrentUserData();
```

### Filter Active Incidents
```typescript
const activeIncidents = getActiveIncidents();
// Returns only: triggered, dispatched, en-route, on-scene
```

### Get Available Responders for Dispatch
```typescript
const available = getAvailableResponders();
// Returns only responders with status: 'available'
```

### Show Dashboard Statistics
```typescript
const stats = calculateDashboardStats();
console.log(stats.activeIncidents); // 1
console.log(stats.availableResponders); // 5
```

---

## 📊 Mock Data Overview

- **5 Users** - Various plans (Full, Pet Guardian, Attend & Check, Friend Alert)
- **4 Pets** - Dogs and cats with medical info and routines
- **9 Contacts** - Guardians, estate recipients, nominated contacts
- **5 Properties** - Sydney locations with access codes
- **5 Incidents** - Active, resolved, false alarms with full timelines
- **10 Responders** - Mix of available, on-call, dispatched, off-duty
- **20 Activities** - Recent system events for admin feed

---

## 🔄 Real-World Scenarios Included

✅ **Active incident on-scene** - Emma Roberts, responder dispatched  
✅ **Medical emergency** - James Wilson, ambulance called  
✅ **False alarm** - Tom Harris, phone died at gym  
✅ **Multiple pets** - Alex Morgan has dog + cat  
✅ **Property access** - Keysafe codes, alarm systems  

---

## 📝 Integration with AppContext

Replace hardcoded data in `AppContext.tsx`:

```diff
- const initialIncidents: Incident[] = [...]; // Remove hardcoded array
+ import { getAllIncidents } from '@/data';
+ const initialIncidents = getAllIncidents();
```

---

## 🧪 For Testing

```typescript
import { mock } from '@/data';

test('shows user name', () => {
  const { user } = mock.getCurrentUserData();
  render(<Profile user={user} />);
  expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
});
```

---

## 🚦 Next Steps

1. ✅ **Use mock data** - Start building UI with realistic data
2. ⏭️ **Add API later** - See `MIGRATION_GUIDE.md` when ready
3. 🎨 **Customize fixtures** - Edit JSON files in `src/data/fixtures/`

---

## 📚 Full Documentation

- **Complete API**: `src/data/README.md`
- **API Migration**: `src/data/MIGRATION_GUIDE.md`
- **Code Examples**: `src/data/examples/`
- **Type Definitions**: `src/app/contexts/AppContext.tsx`

---

## ⚡ Pro Tips

💡 All dates are automatically converted from ISO strings to Date objects  
💡 Relationships are fully linked (e.g., pet.guardianId → contact.id)  
💡 Dashboard stats are calculated from actual data, not hardcoded  
💡 Functions match future API structure for easy migration  

**Ready to build!** 🚀
