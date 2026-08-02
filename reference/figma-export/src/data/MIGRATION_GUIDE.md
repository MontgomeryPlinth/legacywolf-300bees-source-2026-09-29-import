# Migration Guide: Mock Data → Real API

This guide explains how to migrate from mock JSON fixtures to a real backend API.

## Overview

The mock data layer is designed to be easily replaceable. All data access goes through functions in `mockDataLoader.ts`, which can be swapped with API calls without changing component code.

## Step 1: Create API Service Layer

Create a new directory for API services:

```
src/services/
└── api/
    ├── client.ts          # Base API client with auth headers
    ├── users.ts           # User API endpoints
    ├── incidents.ts       # Incident API endpoints
    ├── responders.ts      # Responder API endpoints
    └── index.ts           # Central export
```

### Example: Base API Client

```typescript
// src/services/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

### Example: Users API Service

```typescript
// src/services/api/users.ts
import { apiClient } from './client';
import type { User, Pet, Person, PropertyAccess } from '@/app/contexts/AppContext';

export const usersApi = {
  getUserById: (userId: string) => 
    apiClient<User>(`/users/${userId}`),
  
  getPetsByUserId: (userId: string) => 
    apiClient<Pet[]>(`/users/${userId}/pets`),
  
  getContactsByUserId: (userId: string) => 
    apiClient<Person[]>(`/users/${userId}/contacts`),
  
  getPropertyByUserId: (userId: string) => 
    apiClient<PropertyAccess>(`/users/${userId}/property`),
  
  updateUser: (userId: string, data: Partial<User>) => 
    apiClient<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
```

### Example: Incidents API Service

```typescript
// src/services/api/incidents.ts
import { apiClient } from './client';
import type { Incident } from '@/app/contexts/AppContext';

export const incidentsApi = {
  getAllIncidents: () => 
    apiClient<Incident[]>('/incidents'),
  
  getActiveIncidents: () => 
    apiClient<Incident[]>('/incidents?status=active'),
  
  getIncidentById: (incidentId: string) => 
    apiClient<Incident>(`/incidents/${incidentId}`),
  
  createIncident: (userId: string) => 
    apiClient<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  
  updateIncident: (incidentId: string, data: Partial<Incident>) => 
    apiClient<Incident>(`/incidents/${incidentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  resolveIncident: (incidentId: string, resolution: 'resolved' | 'false-alarm') => 
    apiClient<Incident>(`/incidents/${incidentId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    }),
};
```

## Step 2: Create Data Adapter

Create an adapter that switches between mock and API based on environment:

```typescript
// src/data/dataAdapter.ts
import * as mockData from './mockDataLoader';
import * as apiData from '../services/api';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const dataAdapter = {
  // Users
  getUserById: USE_MOCK_DATA 
    ? mockData.getUserById 
    : apiData.usersApi.getUserById,
  
  getPetsByUserId: USE_MOCK_DATA 
    ? mockData.getPetsByUserId 
    : apiData.usersApi.getPetsByUserId,
  
  // Incidents
  getAllIncidents: USE_MOCK_DATA 
    ? mockData.getAllIncidents 
    : apiData.incidentsApi.getAllIncidents,
  
  getActiveIncidents: USE_MOCK_DATA 
    ? mockData.getActiveIncidents 
    : apiData.incidentsApi.getActiveIncidents,
  
  // Responders
  getAllResponders: USE_MOCK_DATA 
    ? mockData.getAllResponders 
    : apiData.respondersApi.getAllResponders,
  
  getAvailableResponders: USE_MOCK_DATA 
    ? mockData.getAvailableResponders 
    : apiData.respondersApi.getAvailableResponders,
  
  // Dashboard
  calculateDashboardStats: USE_MOCK_DATA 
    ? mockData.calculateDashboardStats 
    : apiData.dashboardApi.getStats,
};
```

## Step 3: Update Environment Variables

```env
# .env.development
VITE_USE_MOCK_DATA=true
VITE_API_URL=http://localhost:3000/api

# .env.production
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api.legacywolf.com.au
```

## Step 4: Update AppContext to Use Adapter

```typescript
// src/app/contexts/AppContext.tsx
import { dataAdapter } from '../../data/dataAdapter';

export function AppProvider({ children }: { children: ReactNode }) {
  // Load initial data through adapter
  const [user, setUser] = useState(() => dataAdapter.getUserById('LW-US-8472'));
  const [pets, setPets] = useState(() => dataAdapter.getPetsByUserId('LW-US-8472'));
  const [incidents, setIncidents] = useState(() => dataAdapter.getAllIncidents());
  
  // If using API, make async
  useEffect(() => {
    if (!USE_MOCK_DATA) {
      dataAdapter.getAllIncidents().then(setIncidents);
    }
  }, []);
  
  // Rest of implementation...
}
```

## Step 5: Handle Async Data Loading

Since API calls are async, update to use loading states:

```typescript
export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await dataAdapter.getAllIncidents();
        setIncidents(data);
      } catch (error) {
        console.error('Failed to load incidents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <AppContext.Provider value={{ incidents, ... }}>
      {children}
    </AppContext.Provider>
  );
}
```

## Step 6: Add Error Handling

```typescript
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await dataAdapter.getAllIncidents();
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };
  
  loadData();
}, []);

if (error) {
  return <ErrorBoundary error={error} />;
}
```

## Step 7: Implement Real-time Updates

For real-time data (WebSocket/SSE):

```typescript
// src/services/realtime/incidentStream.ts
export function useIncidentStream() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket('wss://api.legacywolf.com.au/incidents/stream');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'incident:created') {
        setIncidents(prev => [update.incident, ...prev]);
      } else if (update.type === 'incident:updated') {
        setIncidents(prev => 
          prev.map(i => i.id === update.incident.id ? update.incident : i)
        );
      }
    };
    
    return () => ws.close();
  }, []);
  
  return incidents;
}
```

## Step 8: Testing Both Modes

Create a toggle in development to switch between mock and API:

```typescript
// src/components/dev/DataModeToggle.tsx
export function DataModeToggle() {
  const [useMock, setUseMock] = useState(
    localStorage.getItem('useMockData') === 'true'
  );
  
  const toggle = () => {
    const newValue = !useMock;
    localStorage.setItem('useMockData', String(newValue));
    setUseMock(newValue);
    window.location.reload(); // Reload to apply
  };
  
  if (import.meta.env.PROD) return null;
  
  return (
    <button onClick={toggle}>
      {useMock ? '📦 Mock Data' : '🌐 API Data'}
    </button>
  );
}
```

## Migration Checklist

- [ ] Create API service layer (`src/services/api/`)
- [ ] Implement base API client with auth
- [ ] Create endpoint-specific services (users, incidents, responders)
- [ ] Create data adapter with environment toggle
- [ ] Update AppContext to use adapter
- [ ] Add loading states for async data
- [ ] Implement error handling
- [ ] Add retry logic for failed requests
- [ ] Implement real-time updates (WebSocket/SSE)
- [ ] Test with both mock and API data
- [ ] Update environment variables
- [ ] Deploy with feature flag
- [ ] Monitor API performance
- [ ] Remove mock data imports (optional)

## Phased Rollout Strategy

### Phase 1: Parallel Mode (Week 1-2)
- Keep mock data as fallback
- Load from API but use mock on error
- Test with small user group

### Phase 2: API Primary (Week 3-4)
- API is primary data source
- Mock data only in development
- Full user rollout

### Phase 3: Cleanup (Week 5+)
- Remove mock data from production build
- Keep fixtures for testing
- Document API endpoints

## Backward Compatibility

Keep mock data working even after API integration:

```typescript
// Continue to export mock functions
export const mock = {
  getCurrentUserData,
  getAllIncidents,
  getAllResponders,
  // ... all mock functions
};

// Use in tests
import { mock } from '@/data';

test('incident list renders', () => {
  const incidents = mock.getAllIncidents();
  render(<IncidentList incidents={incidents} />);
  // assertions...
});
```

## Benefits of This Approach

✅ **Gradual migration** - No big-bang rewrite  
✅ **Fallback option** - Can revert to mock data if API fails  
✅ **Testing friendly** - Mock data always available for tests  
✅ **Development speed** - Work without backend dependency  
✅ **Feature flags** - Easy to toggle per environment  
✅ **Zero component changes** - Components don't know data source  

## Example: Complete Migration Diff

```diff
// Before (Mock Only)
- import { getAllIncidents } from '@/data/mockDataLoader';
- const [incidents] = useState(getAllIncidents());

// After (API with Mock Fallback)
+ import { dataAdapter } from '@/data/dataAdapter';
+ const [incidents, setIncidents] = useState<Incident[]>([]);
+ const [isLoading, setIsLoading] = useState(true);
+ 
+ useEffect(() => {
+   dataAdapter.getAllIncidents()
+     .then(setIncidents)
+     .finally(() => setIsLoading(false));
+ }, []);
```
