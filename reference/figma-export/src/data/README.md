# Mock Data Layer

This directory contains all mock data fixtures and utilities for the Legacy Wolf application.

## Structure

```
src/data/
├── fixtures/           # JSON fixture files
│   ├── users.json
│   ├── pets.json
│   ├── contacts.json
│   ├── properties.json
│   ├── incidents.json
│   ├── responders.json
│   └── activities.json
├── mockDataLoader.ts   # Data loading utilities
├── index.ts           # Central export
└── README.md          # This file
```

## Fixtures Overview

### users.json (5 users)
Complete user profiles with plan details and motion timers.
- **LW-US-8472** - Alex Morgan (Full Protection, active)
- **LW-US-2234** - Emma Roberts (Pet Guardian, triggered)
- **LW-US-5893** - Tom Harris (Attend & Check, active)
- **LW-US-3456** - Sophie Martinez (Full Protection, paused)
- **LW-US-7821** - James Wilson (Friend Alert, active)

### pets.json (4 pets)
Pet profiles with medical info, routines, and guardian assignments.
- **PET-001** - Daisy (Golden Retriever, Alex's dog)
- **PET-002** - Whiskers (British Shorthair, Emma's cat)
- **PET-003** - Luna (French Bulldog, Sophie's dog)
- **PET-004** - Milo (Domestic Shorthair, Alex's cat)

### contacts.json (9 contacts)
Nominated contacts with roles and verification status.
- Roles: Nominated Contact, Pet Guardian, Backup Pet Guardian, Estate Recipient
- Statuses: verified, pending

### properties.json (5 properties)
Property access details including building access, unit access, and alarm systems.
- Mix of apartments and houses
- Includes keysafe codes, intercom instructions, alarm details

### incidents.json (5 incidents)
Historical and active incidents with full timelines.
- **INC-2026-001** - Emma Roberts (on-scene, active)
- **INC-2026-002** - Tom Harris (resolved, false alarm)
- **INC-2026-003** - Sophie Martinez (resolved, Trip Mode issue)
- **INC-2026-004** - Alex Morgan (false alarm, fell asleep)
- **INC-2026-005** - James Wilson (resolved, medical emergency)

### responders.json (10 responders)
Security Accredited Agents with certifications and availability.
- Statuses: available (5), dispatched (1), on-call (2), off-duty (2)
- Zones: Sydney CBD, Sydney Inner West
- Certifications: First Aid, CPR, Security License, Pet First Aid, etc.

### activities.json (20 activities)
System activity log for admin dashboard.
- Types: incident-triggered, responder-dispatched, incident-resolved, user-joined, plan-upgraded, check-in-missed
- Last 24 hours of activity

## Usage

### Basic Import
```typescript
import {
  getCurrentUserData,
  getAllIncidents,
  getAvailableResponders,
  calculateDashboardStats
} from '@/data';
```

### Get Current User Data
```typescript
const { user, pets, people, property } = getCurrentUserData();
```

### Get Specific Data
```typescript
// Get user by ID
const user = getUserById('LW-US-8472');

// Get pets for a user
const pets = getPetsByUserId('LW-US-8472');

// Get contacts for a user
const contacts = getContactsByUserId('LW-US-8472');

// Get property for a user
const property = getPropertyByUserId('LW-US-8472');
```

### Get Incidents
```typescript
// All incidents
const allIncidents = getAllIncidents();

// Active incidents only
const activeIncidents = getActiveIncidents();

// By status
const dispatchedIncidents = getIncidentsByStatus('dispatched');

// By ID
const incident = getIncidentById('INC-2026-001');
```

### Get Responders
```typescript
// All responders
const allResponders = getAllResponders();

// Available only
const available = getAvailableResponders();

// By status
const dispatched = getRespondersByStatus('dispatched');

// By ID
const responder = getResponderById('RESP-045');
```

### Get Activities
```typescript
// All activities
const allActivities = getAllActivities();

// Recent (last N)
const recentActivities = getRecentActivities(10);

// By type
const incidentActivities = getActivitiesByType('incident-triggered');
```

### Calculate Dashboard Stats
```typescript
const stats = calculateDashboardStats();
// Returns: {
//   totalUsers, activeProtected, pausedAccounts, tripMode,
//   totalResponders, availableResponders, onCallResponders, dispatchedResponders,
//   activeIncidents, resolvedToday, averageResponseTime, falseAlarms
// }
```

### Get Everything (Admin View)
```typescript
const {
  users,
  pets,
  contacts,
  properties,
  incidents,
  responders,
  activities,
  dashboardStats
} = getAllData();
```

## Date Handling

All date strings in JSON fixtures are automatically transformed to JavaScript `Date` objects by the `transformDates` utility function. This happens transparently when using any of the loader functions.

**JSON Format:**
```json
"triggeredAt": "2026-05-23T14:30:00.000Z"
```

**Loaded Format:**
```typescript
triggeredAt: Date // JavaScript Date object
```

## Extending Mock Data

### Adding New Users
1. Add user entry to `fixtures/users.json`
2. Add corresponding pets to `fixtures/pets.json` (optional)
3. Add contacts to `fixtures/contacts.json` (optional)
4. Add property to `fixtures/properties.json`

### Adding New Incidents
1. Add incident to `fixtures/incidents.json`
2. Add corresponding activities to `fixtures/activities.json`
3. Ensure responder exists in `fixtures/responders.json`

### Adding New Responders
1. Add responder to `fixtures/responders.json`
2. Include all required fields: certifications, location, zone, etc.

## Migration to Real API

When ready to connect to a real backend:

1. Create API service layer in `src/services/api/`
2. Replace loader functions with API calls
3. Keep same function signatures for minimal code changes
4. Use fixtures for development/testing via environment flag

Example:
```typescript
// mockDataLoader.ts (development)
export const getAllIncidents = () => transformDates(incidentsData);

// apiClient.ts (production)
export const getAllIncidents = async () => {
  const response = await fetch('/api/incidents');
  return response.json();
};
```

## Data Relationships

```
User (LW-US-XXXX)
├── Has Many → Pets (PET-XXX)
│   └── Has → Guardian (CONT-XXX)
│   └── Has → Backup Guardian (CONT-XXX)
├── Has Many → Contacts (CONT-XXX)
├── Has One → Property
└── Triggers → Incidents (INC-XXXX-XXX)
    └── Assigned To → Responder (RESP-XXX)
        └── Generates → Activities (ACT-XXX)
```

## Testing Data Scenarios

The mock data includes various scenarios for testing:
- ✅ Active incidents (on-scene)
- ✅ Resolved incidents (successful and false alarms)
- ✅ Medical emergency (critical priority)
- ✅ Multiple pets per user
- ✅ Verified and pending contacts
- ✅ Different property types (apartments, houses)
- ✅ Responders with different statuses
- ✅ Various certification levels
- ✅ Complete incident timelines
- ✅ Recent system activities

## Statistics

- **Total Users:** 5
- **Total Pets:** 4 (3 dogs, 2 cats)
- **Total Contacts:** 9
- **Total Properties:** 5
- **Total Incidents:** 5 (1 active, 3 resolved, 1 false alarm)
- **Total Responders:** 10 (5 available, 2 on-call, 1 dispatched, 2 off-duty)
- **Total Activities:** 20 (last 24 hours)
