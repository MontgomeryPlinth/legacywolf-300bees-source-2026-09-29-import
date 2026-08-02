# State Management Documentation

## Overview
The Legacy Wolf app uses **React Context** for centralized state management. All application state is managed through `AppContext.tsx` located in `src/app/contexts/`.

## Architecture

### Context Provider
- **Location**: `src/app/contexts/AppContext.tsx`
- **Hook**: `useApp()` - Access state and actions from any component
- **Provider**: `<AppProvider>` - Wraps the entire application in `App.tsx`

## State Structure

### 1. Authentication & Session
```typescript
session: {
  isAuthenticated: boolean;
  currentRole: "user" | "contact" | "responder" | "admin" | null;
  userId: string | null;
  sessionId: string;
  expiresAt: Date;
}
```

**Actions:**
- `login(role, userId)` - Authenticate user and set role
- `logout()` - Clear session and log out

### 2. User Data
```typescript
user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
}
plan: UserPlan;
motionTimer: MotionTimer;
pets: Pet[];
people: Person[];
property: PropertyAccess;
```

**Actions:**
- `checkIn()` - Reset motion timer
- `updatePlan(tier)` - Change service tier
- `addPet()`, `updatePet()`, `deletePet()` - Pet management
- `addPerson()`, `updatePerson()`, `deletePerson()` - Contact management
- `updateProperty()` - Update property access details
- `updateUser()` - Update user profile

### 3. Incidents
```typescript
incidents: Incident[];
activeIncidents: Incident[]; // Computed - filters non-resolved incidents
```

**Incident Interface:**
```typescript
{
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  status: "triggered" | "dispatched" | "en-route" | "on-scene" | "resolved" | "false-alarm";
  priority: "critical" | "high" | "medium" | "low";
  triggeredAt: Date;
  dispatchedAt?: Date;
  resolvedAt?: Date;
  responderId?: string;
  responderName?: string;
  services: string[];
  notes?: string;
  timeline: Array<{
    timestamp: Date;
    event: string;
    actor: string;
  }>;
}
```

**Actions:**
- `createIncident(userId)` - Trigger new incident
- `updateIncident(id, updates)` - Update incident details
- `resolveIncident(id, resolution)` - Mark incident as resolved or false alarm
- `dispatchResponder(incidentId, responderId)` - Assign responder to incident

### 4. Responders
```typescript
responders: Responder[];
availableResponders: Responder[]; // Computed - filters available responders
```

**Responder Interface:**
```typescript
{
  id: string;
  name: string;
  status: "available" | "on-call" | "dispatched" | "off-duty";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  certifications: string[];
  rating: number;
  totalIncidents: number;
  currentIncidentId?: string;
  phone: string;
  lastActive: Date;
}
```

**Actions:**
- `updateResponderStatus(id, status)` - Change responder availability
- `updateResponderLocation(id, location)` - Update GPS location
- `clockIn(responderId)` - Mark responder as available
- `clockOut(responderId)` - Mark responder as off-duty

### 5. Admin Dashboard
```typescript
dashboardStats: DashboardStats;
recentActivity: Activity[];
```

**DashboardStats Interface:**
```typescript
{
  totalUsers: number;
  activeProtected: number;
  pausedAccounts: number;
  tripMode: number;
  totalResponders: number;
  availableResponders: number;
  onCallResponders: number;
  dispatchedResponders: number;
  activeIncidents: number;
  resolvedToday: number;
  averageResponseTime: string;
  falseAlarms: number;
}
```

**Activity Interface:**
```typescript
{
  id: string;
  timestamp: Date;
  type: "user-joined" | "incident-triggered" | "incident-resolved" | 
        "responder-dispatched" | "check-in-missed" | "plan-upgraded";
  description: string;
  userId?: string;
  incidentId?: string;
  responderId?: string;
}
```

**Actions:**
- `refreshDashboard()` - Recalculate all dashboard statistics
- `addActivity(activity)` - Log new system activity

## Usage Examples

### Accessing State
```typescript
import { useApp } from "../contexts/AppContext";

function MyComponent() {
  const { session, user, incidents, responders } = useApp();
  
  return (
    <div>
      <p>Logged in as: {session.currentRole}</p>
      <p>Active incidents: {incidents.length}</p>
    </div>
  );
}
```

### Calling Actions
```typescript
function IncidentControls() {
  const { createIncident, dispatchResponder, availableResponders } = useApp();
  
  const handleTriggerIncident = () => {
    createIncident("LW-US-8472");
  };
  
  const handleDispatch = (incidentId: string) => {
    const responder = availableResponders[0];
    if (responder) {
      dispatchResponder(incidentId, responder.id);
    }
  };
  
  return (
    <div>
      <button onClick={handleTriggerIncident}>Trigger Test Incident</button>
    </div>
  );
}
```

### Authentication Flow
```typescript
function LoginScreen() {
  const { login } = useApp();
  
  const handleLogin = (role: "user" | "responder" | "admin") => {
    login(role, "user-id-123");
  };
  
  return (
    <button onClick={() => handleLogin("user")}>Login as User</button>
  );
}
```

## Mock Data

All state includes comprehensive mock data for development and testing:

- **2 sample incidents** (1 active, 1 resolved)
- **4 sample responders** (2 available, 1 dispatched, 1 off-duty)
- **Dashboard statistics** with realistic numbers
- **5 recent activities** showing system events
- **User profile** with full plan, pets, contacts, and property data

## Real-time Updates

The context automatically computes derived state:
- `activeIncidents` - filters incidents by status
- `availableResponders` - filters responders by availability
- Activity logging happens automatically on key actions
- Dashboard stats can be refreshed on-demand

## Integration Points

All four app views can access this shared state:
- **User App** - Access personal data, check-in, manage plan
- **Nominated Contact App** - View incidents, accept roles
- **Responder App** - View assigned incidents, update status
- **Admin App** - Monitor all users, incidents, responders

## Next Steps

To use this state management in your views:
1. Import `useApp()` hook
2. Destructure needed state and actions
3. Call actions on user interactions
4. State updates automatically trigger re-renders
