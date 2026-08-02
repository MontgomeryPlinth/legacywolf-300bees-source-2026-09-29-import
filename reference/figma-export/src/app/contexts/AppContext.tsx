import { createContext, useContext, useState, ReactNode } from "react";

// Response Queue Types
export type QueueStepType =
  | "text-user"
  | "call-user"
  | "attend-address"
  | "text-contact"
  | "call-contact";

export interface ResponseQueueStep {
  id: string;
  type: QueueStepType;
  contactId?: string;
  authorityLevel?: "knock-only" | "enter";
}

export interface ResponseQueue {
  committed: ResponseQueueStep[];
  staged: ResponseQueueStep[];
  isDirty: boolean;
  substitutionNotice?: string | null;
}

// Authentication Types
export interface Session {
  isAuthenticated: boolean;
  currentRole: "user" | "contact" | "responder" | "admin" | null;
  userId: string | null;
  sessionId: string;
  expiresAt: Date;
}

// Incident Types
export interface Incident {
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
  timeline: {
    timestamp: Date;
    event: string;
    actor: string;
  }[];
}

// Responder Types
export interface Responder {
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

// Admin Dashboard Types
export interface DashboardStats {
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

export interface Activity {
  id: string;
  timestamp: Date;
  type: "user-joined" | "incident-triggered" | "incident-resolved" | "responder-dispatched" | "check-in-missed" | "plan-upgraded";
  description: string;
  userId?: string;
  incidentId?: string;
  responderId?: string;
}

export interface Medication {
  name: string;
  type: string;
  frequency: string;
  timeOfDay: string[];
  withMeals: string;
}

// User Types
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  sex: string;
  weight: number;
  microchip: string;
  photo?: string;
  vetName: string;
  vetPhone: string;
  conditions: string[];
  medications: Medication[];
  routine: {
    morning: string;
    evening: string;
  };
  preferences: string;
  guardianId?: string;
  backupGuardianId?: string;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  roles: string[];
  instructions?: string;
  status: "verified" | "pending" | "unreachable";
}

export interface PropertyAccess {
  address: string;
  unit?: string;
  city: string;
  state: string;
  postcode: string;
  propertyType: string;
  buildingAccess: {
    intercom?: string;
    concierge?: string;
    afterHoursCode?: string;
  };
  unitAccess: {
    keysafeLocation?: string;
    keysafeCode?: string;
    doorType?: string;
  };
  alarm: {
    system?: string;
    code?: string;
    panelLocation?: string;
  };
}

export interface UserPlan {
  tier: "friend-alert" | "attend-check" | "pet-guardian" | "full";
  activeServices: string[];
  status: "protected" | "paused" | "trip-mode";
  batteryRuleEnabled: boolean;
  lostPhoneMode: boolean;
}

export interface MotionTimer {
  intervalHours: number;
  nextCheckIn: Date;
  lastCheckIn: Date;
  status: "active" | "grace-window" | "triggered" | "paused-battery";
  pausedBy?: "user" | null;
  tripModeEndDate?: Date | null;
  sickModeEndDate?: Date | null;
  sickModeCheckInHours?: number;
  batteryBehaviour: "respond" | "suppress" | "alert-contact";
  batteryOfflineSince?: Date | null;
  deviceLastSeen?: Date | null;
  gracePeriodHours: number;
}

export interface UserTimerStatus {
  userId: string;
  userName: string;
  lastCheckIn: Date;
  nextCheckIn: Date;
  intervalHours: number;
  timerStatus: MotionTimer["status"];
  batteryOfflineSince?: Date | null;
  lostPhoneMode: boolean;
}

interface AppState {
  // Authentication & Session
  session: Session;

  // User data
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    joinedDate: string;
  };
  plan: UserPlan;
  motionTimer: MotionTimer;
  pets: Pet[];
  people: Person[];
  property: PropertyAccess;
  primaryContactId: string | null;

  // Incidents
  incidents: Incident[];
  activeIncidents: Incident[];

  // Responders
  responders: Responder[];
  availableResponders: Responder[];

  // Admin Dashboard
  dashboardStats: DashboardStats;
  recentActivity: Activity[];

  // Authentication Actions
  login: (role: Session["currentRole"], userId: string) => void;
  logout: () => void;

  // User Actions
  checkIn: () => void;
  pauseMonitoring: () => void;
  resumeMonitoring: () => void;
  setTripMode: (endDate: Date) => void;
  setSickMode: (endDate: Date, checkInHours: number) => void;
  updatePlan: (tier: UserPlan["tier"]) => void;
  updateActiveServices: (services: string[]) => void;
  addPet: (pet: Omit<Pet, "id">) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  addPerson: (person: Omit<Person, "id">) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  setPrimaryContact: (personId: string | null) => void;
  updateProperty: (property: Partial<PropertyAccess>) => void;
  updateUser: (user: Partial<AppState["user"]>) => void;
  triggerEmergency: () => void;
  updateTimerInterval: (hours: number) => void;
  updateBatteryBehaviour: (behaviour: MotionTimer["batteryBehaviour"]) => void;
  reportBatteryOffline: () => void;
  reportBatteryReconnected: () => void;
  reportLostPhone: () => void;
  reEnableBatteryRule: () => void;
  updateGracePeriod: (hours: number) => void;

  // Response Queue
  responseQueue: ResponseQueue;
  reorderQueueSteps: (steps: ResponseQueueStep[]) => void;
  addQueueStep: (step: Omit<ResponseQueueStep, "id">) => void;
  removeQueueStep: (id: string) => void;
  updateQueueStep: (id: string, updates: Partial<ResponseQueueStep>) => void;
  saveQueue: () => void;
  discardQueue: () => void;
  dismissSubstitutionNotice: () => void;

  // Responder helpers
  userTimerStatuses: UserTimerStatus[];

  // Incident Actions
  createIncident: (userId: string) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  resolveIncident: (id: string, resolution: "resolved" | "false-alarm") => void;
  dispatchResponder: (incidentId: string, responderId: string) => void;

  // Responder Actions
  updateResponderStatus: (id: string, status: Responder["status"]) => void;
  updateResponderLocation: (id: string, location: Responder["location"]) => void;
  clockIn: (responderId: string) => void;
  clockOut: (responderId: string) => void;

  // Admin Actions
  refreshDashboard: () => void;
  addActivity: (activity: Omit<Activity, "id">) => void;
}

// Stable singleton — survives Vite HMR module identity resets in sandboxed iframes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _g = globalThis as any;
const AppContext: ReturnType<typeof createContext<AppState | undefined>> =
  _g.__LW_APP_CONTEXT ?? (_g.__LW_APP_CONTEXT = createContext<AppState | undefined>(undefined));

// Mock initial data
const initialSession: Session = {
  isAuthenticated: false, // Start as unauthenticated
  currentRole: null,
  userId: null,
  sessionId: "",
  expiresAt: new Date()
};

const initialUser = {
  id: "LW-US-8472",
  name: "Alex Morgan",
  email: "alex.morgan@email.com",
  phone: "+61 412 345 678",
  joinedDate: "Nov 2025"
};

const initialPlan: UserPlan = {
  tier: "full",
  activeServices: ["attend-check", "pet-guardian", "reputation-guard", "friend-alert", "battery-rule"],
  status: "protected",
  batteryRuleEnabled: true,
  lostPhoneMode: false,
};

const initialMotionTimer: MotionTimer = {
  intervalHours: 16,
  nextCheckIn: new Date(Date.now() + 15.5 * 60 * 60 * 1000),
  lastCheckIn: new Date(Date.now() - 30 * 60 * 1000),
  status: "active",
  batteryBehaviour: "suppress",
  batteryOfflineSince: null,
  deviceLastSeen: new Date(),
  gracePeriodHours: 4,
};

const initialPets: Pet[] = [
  {
    id: "1",
    name: "Daisy",
    species: "Dog",
    breed: "Golden Retriever",
    age: 6,
    sex: "Female",
    weight: 28,
    microchip: "985112******234",
    vetName: "North Sydney Veterinary Hospital",
    vetPhone: "+61 2 9955 3486",
    conditions: ["Hip dysplasia"],
    medications: [{ name: "Carprofen", type: "Anti-inflammatory (50mg)", frequency: "daily", timeOfDay: ["18:00"], withMeals: "with-dinner" }],
    routine: {
      morning: "7:00 AM - Breakfast (1.5 cups dry food) + 30min walk in park",
      evening: "6:00 PM - Dinner (1.5 cups + medication) + 20min walk"
    },
    preferences: "Daisy responds to 'good girl' and her favorite toy is the blue rope. She's anxious around loud noises — speak calmly and move slowly. Sleeps on her bed in living room, left corner.",
    guardianId: "1",
    backupGuardianId: "2"
  }
];

const initialPeople: Person[] = [
  {
    id: "1",
    name: "Sarah Chen",
    relationship: "Friend",
    phone: "+61 412 345 678",
    email: "sarah.chen@email.com",
    roles: ["Nominated Contact", "Pet Guardian"],
    instructions: "Sarah, you're my closest friend and you know Daisy well. If something happens to me, please make sure she's calm and gets to your place safely.",
    status: "verified"
  },
  {
    id: "2",
    name: "Marcus Wong",
    relationship: "Neighbor",
    phone: "+61 423 456 789",
    email: "marcus.w@email.com",
    roles: ["Backup Pet Guardian"],
    status: "verified"
  },
  {
    id: "3",
    name: "Emma Sullivan",
    relationship: "Sister",
    phone: "+61 434 567 890",
    email: "emma.sullivan@email.com",
    roles: ["Estate Recipient"],
    status: "pending"
  }
];

const initialProperty: PropertyAccess = {
  address: "42 Melbourne Street",
  unit: "Apartment 7B",
  city: "North Sydney",
  state: "NSW",
  postcode: "2060",
  propertyType: "Apartment Building",
  buildingAccess: {
    intercom: "Press 7B, speak to concierge",
    concierge: "24/7 available",
    afterHoursCode: "#2840*"
  },
  unitAccess: {
    keysafeLocation: "Inside fire hose cabinet, Level 7",
    keysafeCode: "5729",
    doorType: "Push to open, auto-lock"
  },
  alarm: {
    system: "ADT SafeWatch",
    code: "2847#",
    panelLocation: "Inside entrance, left wall"
  }
};

const initialIncidents: Incident[] = [
  {
    id: "INC-2026-001",
    userId: "LW-US-2234",
    userName: "Emma Roberts",
    userAddress: "78 Harris Street, Pyrmont NSW 2009",
    status: "on-scene",
    priority: "high",
    triggeredAt: new Date(Date.now() - 45 * 60 * 1000),
    dispatchedAt: new Date(Date.now() - 38 * 60 * 1000),
    responderId: "RESP-045",
    responderName: "James Mitchell",
    services: ["attend-check", "pet-guardian"],
    notes: "User has not responded to check-in. Pet (cat) present.",
    timeline: [
      {
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        event: "Motion timer expired - no check-in received",
        actor: "System"
      },
      {
        timestamp: new Date(Date.now() - 38 * 60 * 1000),
        event: "Responder James Mitchell dispatched",
        actor: "Admin"
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        event: "Responder arrived on scene",
        actor: "James Mitchell"
      }
    ]
  },
  {
    id: "INC-2026-002",
    userId: "LW-US-5893",
    userName: "Tom Harris",
    userAddress: "12 Elizabeth Bay Road, Elizabeth Bay NSW 2011",
    status: "resolved",
    priority: "medium",
    triggeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    dispatchedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    responderId: "RESP-023",
    responderName: "Sarah Chen",
    services: ["attend-check"],
    notes: "False alarm - user was at gym and phone died",
    timeline: [
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        event: "Motion timer expired",
        actor: "System"
      },
      {
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        event: "Responder dispatched",
        actor: "Admin"
      },
      {
        timestamp: new Date(Date.now() - 2.2 * 60 * 60 * 1000),
        event: "User contacted and confirmed safe",
        actor: "Sarah Chen"
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        event: "Incident resolved as false alarm",
        actor: "Sarah Chen"
      }
    ]
  }
];

const initialResponders: Responder[] = [
  {
    id: "RESP-045",
    name: "James Mitchell",
    status: "dispatched",
    location: {
      lat: -33.8688,
      lng: 151.2093,
      address: "Pyrmont NSW"
    },
    certifications: ["First Aid", "CPR", "Security License - 1A"],
    rating: 4.9,
    totalIncidents: 127,
    currentIncidentId: "INC-2026-001",
    phone: "+61 412 789 456",
    lastActive: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: "RESP-023",
    name: "Sarah Chen",
    status: "available",
    location: {
      lat: -33.8650,
      lng: 151.2094,
      address: "Sydney CBD"
    },
    certifications: ["First Aid", "CPR", "Security License - 1A", "Pet First Aid"],
    rating: 4.8,
    totalIncidents: 98,
    phone: "+61 423 567 890",
    lastActive: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    id: "RESP-067",
    name: "Marcus Wong",
    status: "available",
    location: {
      lat: -33.8700,
      lng: 151.2000,
      address: "Ultimo NSW"
    },
    certifications: ["First Aid", "Security License - 1A"],
    rating: 4.7,
    totalIncidents: 84,
    phone: "+61 434 678 901",
    lastActive: new Date(Date.now() - 8 * 60 * 1000)
  },
  {
    id: "RESP-012",
    name: "Lisa Anderson",
    status: "off-duty",
    location: {
      lat: -33.8900,
      lng: 151.1900,
      address: "Newtown NSW"
    },
    certifications: ["First Aid", "CPR", "Security License - 1A", "Pet First Aid"],
    rating: 4.9,
    totalIncidents: 156,
    phone: "+61 445 789 012",
    lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000)
  }
];

const initialDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeProtected: 1138,
  pausedAccounts: 87,
  tripMode: 22,
  totalResponders: 24,
  availableResponders: 12,
  onCallResponders: 10,
  dispatchedResponders: 2,
  activeIncidents: 1,
  resolvedToday: 8,
  averageResponseTime: "8.2 min",
  falseAlarms: 3
};

const initialActivity: Activity[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: "responder-dispatched",
    description: "James Mitchell dispatched to incident INC-2026-001",
    incidentId: "INC-2026-001",
    responderId: "RESP-045"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    type: "incident-triggered",
    description: "Motion timer expired for Emma Roberts",
    userId: "LW-US-2234",
    incidentId: "INC-2026-001"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "incident-resolved",
    description: "Incident INC-2026-002 resolved as false alarm",
    incidentId: "INC-2026-002"
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: "user-joined",
    description: "New user Peter Thompson joined with Full Protection plan",
    userId: "LW-US-9876"
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: "plan-upgraded",
    description: "User Alice Walker upgraded to Pet Guardian tier",
    userId: "LW-US-4523"
  }
];

function buildDefaultQueue(
  tier: UserPlan["tier"],
  contactId: string | null
): ResponseQueueStep[] {
  const base: ResponseQueueStep[] = [
    { id: "dq-1", type: "text-user" },
    { id: "dq-2", type: "call-user" },
  ];
  if (tier === "full" || tier === "attend-check" || tier === "pet-guardian") {
    base.push({ id: "dq-3", type: "attend-address", authorityLevel: "knock-only" });
    if (contactId) base.push({ id: "dq-4", type: "text-contact", contactId });
  } else {
    if (contactId) {
      base.push({ id: "dq-3", type: "text-contact", contactId });
      base.push({ id: "dq-4", type: "call-contact", contactId });
    }
  }
  return base;
}

export function validateQueue(steps: ResponseQueueStep[]): string | null {
  if (!steps.some(s => s.type === "text-user" || s.type === "call-user"))
    return "Your queue must start with a text or call to you.";
  const firstNonUser = steps.findIndex(s => s.type !== "text-user" && s.type !== "call-user");
  const firstAttend = steps.findIndex(s => s.type === "attend-address");
  if (firstAttend !== -1 && firstNonUser !== -1 && firstAttend < firstNonUser)
    return "The responder step can't run before we've tried to reach you.";
  if (steps.filter(s => s.type !== "text-user" && s.type !== "call-user").length === 0)
    return "Your queue needs at least one step that reaches someone else.";
  return null;
}

const initialSteps = buildDefaultQueue("full", "1");
const initialResponseQueue: ResponseQueue = {
  committed: initialSteps,
  staged: initialSteps,
  isDirty: false,
  substitutionNotice: null,
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Authentication & Session
  const [session, setSession] = useState(initialSession);

  // User data
  const [user, setUser] = useState(initialUser);
  const [plan, setPlan] = useState(initialPlan);
  const [motionTimer, setMotionTimer] = useState(initialMotionTimer);
  const [pets, setPets] = useState(initialPets);
  const [people, setPeople] = useState(initialPeople);
  const [property, setProperty] = useState(initialProperty);
  const [primaryContactId, setPrimaryContactId] = useState<string | null>("1"); // Sarah Chen as default primary

  // Response Queue
  const [responseQueue, setResponseQueue] = useState(initialResponseQueue);

  // Incidents
  const [incidents, setIncidents] = useState(initialIncidents);
  const activeIncidents = incidents.filter(inc =>
    inc.status !== "resolved" && inc.status !== "false-alarm"
  );

  // Responders
  const [responders, setResponders] = useState(initialResponders);
  const availableResponders = responders.filter(r => r.status === "available");

  // Admin Dashboard
  const [dashboardStats, setDashboardStats] = useState(initialDashboardStats);
  const [recentActivity, setRecentActivity] = useState(initialActivity);

  // Authentication Actions
  const login = (role: Session["currentRole"], userId: string) => {
    setSession({
      isAuthenticated: true,
      currentRole: role,
      userId,
      sessionId: "sess_" + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  };

  const logout = () => {
    setSession({
      isAuthenticated: false,
      currentRole: null,
      userId: null,
      sessionId: "",
      expiresAt: new Date()
    });
  };

  // Incident Actions
  const createIncident = (userId: string) => {
    const newIncident: Incident = {
      id: "INC-2026-" + String(incidents.length + 1).padStart(3, "0"),
      userId,
      userName: user.name,
      userAddress: `${property.address}, ${property.city}`,
      status: "triggered",
      priority: "high",
      triggeredAt: new Date(),
      services: plan.activeServices,
      timeline: [
        {
          timestamp: new Date(),
          event: "Motion timer expired - no check-in received",
          actor: "System"
        }
      ]
    };

    setIncidents([newIncident, ...incidents]);
    addActivity({
      timestamp: new Date(),
      type: "incident-triggered",
      description: `Motion timer expired for ${user.name}`,
      userId,
      incidentId: newIncident.id
    });
  };

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents(incidents.map(inc => inc.id === id ? { ...inc, ...updates } : inc));
  };

  const resolveIncident = (id: string, resolution: "resolved" | "false-alarm") => {
    const incident = incidents.find(inc => inc.id === id);
    if (!incident) return;

    const updatedIncident = {
      ...incident,
      status: resolution,
      resolvedAt: new Date(),
      timeline: [
        ...incident.timeline,
        {
          timestamp: new Date(),
          event: `Incident resolved as ${resolution === "false-alarm" ? "false alarm" : "resolved"}`,
          actor: incident.responderName || "System"
        }
      ]
    };

    setIncidents(incidents.map(inc => inc.id === id ? updatedIncident : inc));

    // Free up responder if assigned
    if (incident.responderId) {
      updateResponderStatus(incident.responderId, "available");
    }

    addActivity({
      timestamp: new Date(),
      type: "incident-resolved",
      description: `Incident ${id} resolved as ${resolution === "false-alarm" ? "false alarm" : "resolved"}`,
      incidentId: id
    });
  };

  const dispatchResponder = (incidentId: string, responderId: string) => {
    const incident = incidents.find(inc => inc.id === incidentId);
    const responder = responders.find(r => r.id === responderId);
    if (!incident || !responder) return;

    const now = new Date();
    const updatedIncident = {
      ...incident,
      status: "dispatched" as const,
      dispatchedAt: now,
      responderId,
      responderName: responder.name,
      timeline: [
        ...incident.timeline,
        {
          timestamp: now,
          event: `Responder ${responder.name} dispatched`,
          actor: "Admin"
        }
      ]
    };

    setIncidents(incidents.map(inc => inc.id === incidentId ? updatedIncident : inc));
    setResponders(responders.map(r =>
      r.id === responderId
        ? { ...r, status: "dispatched", currentIncidentId: incidentId }
        : r
    ));

    addActivity({
      timestamp: now,
      type: "responder-dispatched",
      description: `${responder.name} dispatched to incident ${incidentId}`,
      incidentId,
      responderId
    });
  };

  // Responder Actions
  const updateResponderStatus = (id: string, status: Responder["status"]) => {
    setResponders(responders.map(r =>
      r.id === id
        ? { ...r, status, currentIncidentId: status === "available" ? undefined : r.currentIncidentId }
        : r
    ));
  };

  const updateResponderLocation = (id: string, location: Responder["location"]) => {
    setResponders(responders.map(r => r.id === id ? { ...r, location } : r));
  };

  const clockIn = (responderId: string) => {
    setResponders(responders.map(r =>
      r.id === responderId
        ? { ...r, status: "available", lastActive: new Date() }
        : r
    ));
  };

  const clockOut = (responderId: string) => {
    setResponders(responders.map(r =>
      r.id === responderId
        ? { ...r, status: "off-duty", lastActive: new Date() }
        : r
    ));
  };

  // Admin Actions
  const refreshDashboard = () => {
    const stats: DashboardStats = {
      totalUsers: dashboardStats.totalUsers,
      activeProtected: incidents.filter(i => i.status === "resolved").length,
      pausedAccounts: dashboardStats.pausedAccounts,
      tripMode: dashboardStats.tripMode,
      totalResponders: responders.length,
      availableResponders: responders.filter(r => r.status === "available").length,
      onCallResponders: responders.filter(r => r.status === "on-call").length,
      dispatchedResponders: responders.filter(r => r.status === "dispatched").length,
      activeIncidents: activeIncidents.length,
      resolvedToday: incidents.filter(i =>
        i.resolvedAt && i.resolvedAt.toDateString() === new Date().toDateString()
      ).length,
      averageResponseTime: dashboardStats.averageResponseTime,
      falseAlarms: incidents.filter(i =>
        i.status === "false-alarm" &&
        i.resolvedAt &&
        i.resolvedAt.toDateString() === new Date().toDateString()
      ).length
    };
    setDashboardStats(stats);
  };

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity = {
      ...activity,
      id: Date.now().toString()
    };
    setRecentActivity([newActivity, ...recentActivity].slice(0, 50)); // Keep last 50 activities
  };

  // User Actions
  const checkIn = () => {
    const now = new Date();
    const nextCheckIn = new Date(now.getTime() + motionTimer.intervalHours * 60 * 60 * 1000);

    setMotionTimer({
      ...motionTimer,
      lastCheckIn: now,
      nextCheckIn,
      status: "active"
    });
  };

  const pauseMonitoring = () => {
    setMotionTimer({
      ...motionTimer,
      status: "active",
      pausedBy: "user"
    });
    setPlan({
      ...plan,
      status: "paused"
    });
  };

  const resumeMonitoring = () => {
    // Reset timer when resuming
    const nextCheckIn = new Date();
    nextCheckIn.setHours(nextCheckIn.getHours() + motionTimer.intervalHours);

    setMotionTimer({
      ...motionTimer,
      status: "active",
      pausedBy: null,
      tripModeEndDate: null,
      sickModeEndDate: null,
      sickModeCheckInHours: undefined,
      nextCheckIn,
      lastCheckIn: new Date()
    });
    setPlan({
      ...plan,
      status: "protected"
    });
  };

  const setTripMode = (endDate: Date) => {
    setMotionTimer({
      ...motionTimer,
      status: "active",
      tripModeEndDate: endDate,
      pausedBy: null
    });
    setPlan({
      ...plan,
      status: "trip-mode"
    });
  };

  const setSickMode = (endDate: Date, checkInHours: number) => {
    setMotionTimer({
      ...motionTimer,
      status: "active",
      sickModeEndDate: endDate,
      sickModeCheckInHours: checkInHours,
      pausedBy: null
    });
    setPlan({
      ...plan,
      status: "protected"
    });
  };

  const updatePlan = (tier: UserPlan["tier"]) => {
    const serviceMap = {
      "friend-alert": ["friend-alert"],
      "attend-check": ["attend-check"],
      "pet-guardian": ["attend-check", "pet-guardian"],
      "full": ["attend-check", "pet-guardian", "reputation-guard", "friend-alert"]
    };

    setPlan({
      ...plan,
      tier,
      activeServices: serviceMap[tier]
    });
  };

  const updateActiveServices = (services: string[]) => {
    setPlan({
      ...plan,
      activeServices: services
    });
  };

  const addPet = (pet: Omit<Pet, "id">) => {
    const newPet = {
      ...pet,
      id: Date.now().toString()
    };
    setPets([...pets, newPet]);
  };

  const updatePet = (id: string, updates: Partial<Pet>) => {
    setPets(pets.map(pet => pet.id === id ? { ...pet, ...updates } : pet));
  };

  const deletePet = (id: string) => {
    setPets(pets.filter(pet => pet.id !== id));
  };

  const addPerson = (person: Omit<Person, "id">) => {
    const newPerson = {
      ...person,
      id: Date.now().toString()
    };
    setPeople([...people, newPerson]);
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(people.map(person => person.id === id ? { ...person, ...updates } : person));
  };

  const deletePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));
  };

  const setPrimaryContact = (personId: string | null) => {
    setPrimaryContactId(personId);
  };

  const updateProperty = (updates: Partial<PropertyAccess>) => {
    setProperty({ ...property, ...updates });
  };

  const updateUser = (updates: Partial<AppState["user"]>) => {
    setUser({ ...user, ...updates });
  };

  const triggerEmergency = () => {
    createIncident(user.id);
  };

  const updateTimerInterval = (hours: number) => {
    const nextCheckIn = new Date(Date.now() + hours * 60 * 60 * 1000);
    setMotionTimer({ ...motionTimer, intervalHours: hours, nextCheckIn });
  };

  const updateBatteryBehaviour = (behaviour: MotionTimer["batteryBehaviour"]) => {
    setMotionTimer({ ...motionTimer, batteryBehaviour: behaviour });
  };

  const updateGracePeriod = (hours: number) => {
    setMotionTimer({ ...motionTimer, gracePeriodHours: hours });
  };

  // Called when device signals it's about to go offline (low battery / power off)
  const reportBatteryOffline = () => {
    const now = new Date();
    const newStatus = motionTimer.batteryBehaviour === "respond"
      ? motionTimer.status  // keep existing status — timer continues
      : "paused-battery" as const;
    setMotionTimer({
      ...motionTimer,
      status: newStatus,
      batteryOfflineSince: now,
      deviceLastSeen: now,
    });
    // Email notification trigger is logged here; real send wired when mail provider connected
    console.info("[LegacyWolf] Battery offline event fired — email notification triggered for", user.email);
  };

  // Called when device comes back online
  const reportBatteryReconnected = () => {
    setMotionTimer({
      ...motionTimer,
      status: "active",
      batteryOfflineSince: null,
      deviceLastSeen: new Date(),
      nextCheckIn: new Date(Date.now() + motionTimer.intervalHours * 60 * 60 * 1000),
    });
  };

  // "Lost My Phone" CTA — disables battery rule until re-enabled
  const reportLostPhone = () => {
    setMotionTimer({ ...motionTimer, status: "paused-battery", batteryOfflineSince: motionTimer.batteryOfflineSince ?? new Date() });
    setPlan({ ...plan, lostPhoneMode: true, batteryRuleEnabled: false });
  };

  // Response Queue Actions
  const reorderQueueSteps = (steps: ResponseQueueStep[]) => {
    setResponseQueue(q => ({ ...q, staged: steps, isDirty: true }));
  };

  const addQueueStep = (step: Omit<ResponseQueueStep, "id">) => {
    const newStep: ResponseQueueStep = { ...step, id: "rq-" + Date.now() };
    setResponseQueue(q => ({ ...q, staged: [...q.staged, newStep], isDirty: true }));
  };

  const removeQueueStep = (id: string) => {
    setResponseQueue(q => ({ ...q, staged: q.staged.filter(s => s.id !== id), isDirty: true }));
  };

  const updateQueueStep = (id: string, updates: Partial<ResponseQueueStep>) => {
    setResponseQueue(q => ({
      ...q,
      staged: q.staged.map(s => s.id === id ? { ...s, ...updates } : s),
      isDirty: true,
    }));
  };

  const saveQueue = () => {
    setResponseQueue(q => ({ ...q, committed: q.staged, isDirty: false }));
    // TODO: POST /api/queue/save — body: { steps: responseQueue.staged }
    console.info("[LegacyWolf] Queue saved stub →", responseQueue.staged);
  };

  const discardQueue = () => {
    setResponseQueue(q => ({ ...q, staged: q.committed, isDirty: false }));
  };

  const dismissSubstitutionNotice = () => {
    setResponseQueue(q => ({ ...q, substitutionNotice: null }));
  };

  // Re-enable after lost phone
  const reEnableBatteryRule = () => {
    setPlan({ ...plan, lostPhoneMode: false, batteryRuleEnabled: true });
    setMotionTimer({
      ...motionTimer,
      status: "active",
      batteryOfflineSince: null,
      deviceLastSeen: new Date(),
      nextCheckIn: new Date(Date.now() + motionTimer.intervalHours * 60 * 60 * 1000),
    });
  };

  // Derived: per-user timer statuses for responder view (in production this comes from the API)
  const userTimerStatuses: UserTimerStatus[] = [
    {
      userId: user.id,
      userName: user.name,
      lastCheckIn: motionTimer.lastCheckIn,
      nextCheckIn: motionTimer.nextCheckIn,
      intervalHours: motionTimer.intervalHours,
      timerStatus: motionTimer.status,
      batteryOfflineSince: motionTimer.batteryOfflineSince,
      lostPhoneMode: plan.lostPhoneMode,
    },
    // Additional mock users so the responder view has meaningful data
    {
      userId: "LW-US-2234",
      userName: "Emma Roberts",
      lastCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextCheckIn: new Date(Date.now() + 6 * 60 * 60 * 1000),
      intervalHours: 8,
      timerStatus: "active",
      batteryOfflineSince: null,
      lostPhoneMode: false,
    },
    {
      userId: "LW-US-5893",
      userName: "Tom Harris",
      lastCheckIn: new Date(Date.now() - 5 * 60 * 60 * 1000),
      nextCheckIn: new Date(Date.now() + 3 * 60 * 60 * 1000),
      intervalHours: 8,
      timerStatus: "paused-battery",
      batteryOfflineSince: new Date(Date.now() - 3 * 60 * 60 * 1000),
      lostPhoneMode: false,
    },
  ];

  return (
    <AppContext.Provider
      value={{
        // Authentication & Session
        session,
        login,
        logout,

        // User data
        user,
        plan,
        motionTimer,
        pets,
        people,
        property,
        primaryContactId,

        // Incidents
        incidents,
        activeIncidents,
        createIncident,
        updateIncident,
        resolveIncident,
        dispatchResponder,

        // Responders
        responders,
        availableResponders,
        updateResponderStatus,
        updateResponderLocation,
        clockIn,
        clockOut,

        // Admin Dashboard
        dashboardStats,
        recentActivity,
        refreshDashboard,
        addActivity,

        // User Actions
        checkIn,
        pauseMonitoring,
        resumeMonitoring,
        setTripMode,
        setSickMode,
        updatePlan,
        updateActiveServices,
        addPet,
        updatePet,
        deletePet,
        addPerson,
        updatePerson,
        deletePerson,
        setPrimaryContact,
        updateProperty,
        updateUser,
        triggerEmergency,
        updateTimerInterval,
        updateBatteryBehaviour,
        reportBatteryOffline,
        reportBatteryReconnected,
        reportLostPhone,
        reEnableBatteryRule,
        updateGracePeriod,
        userTimerStatuses,

        // Response Queue
        responseQueue,
        reorderQueueSteps,
        addQueueStep,
        removeQueueStep,
        updateQueueStep,
        saveQueue,
        discardQueue,
        dismissSubstitutionNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}