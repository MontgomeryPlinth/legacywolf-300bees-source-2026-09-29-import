/**
 * Mock Data Loader
 * Loads JSON fixtures and transforms them for use in the application
 */

import usersData from './fixtures/users.json';
import petsData from './fixtures/pets.json';
import contactsData from './fixtures/contacts.json';
import propertiesData from './fixtures/properties.json';
import incidentsData from './fixtures/incidents.json';
import respondersData from './fixtures/responders.json';
import activitiesData from './fixtures/activities.json';

import type { Pet, Person, PropertyAccess, Incident, Responder, Activity } from '../app/contexts/AppContext';

// Transform JSON dates to Date objects
export const transformDates = <T>(data: T): T => {
  return JSON.parse(
    JSON.stringify(data),
    (key, value) => {
      // Check if value looks like an ISO date string
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      return value;
    }
  );
};

// Get user by ID
export const getUserById = (userId: string) => {
  const user = usersData.find(u => u.id === userId);
  if (!user) return null;
  return transformDates(user);
};

// Get all users
export const getAllUsers = () => {
  return transformDates(usersData);
};

// Get pets for a specific user
export const getPetsByUserId = (userId: string): Pet[] => {
  const pets = petsData.filter(p => p.userId === userId);
  return transformDates(pets);
};

// Get all pets
export const getAllPets = (): Pet[] => {
  return transformDates(petsData);
};

// Get contacts for a specific user
export const getContactsByUserId = (userId: string): Person[] => {
  const contacts = contactsData.filter(c => c.userId === userId);
  return transformDates(contacts);
};

// Get all contacts
export const getAllContacts = (): Person[] => {
  return transformDates(contactsData);
};

// Get property for a specific user
export const getPropertyByUserId = (userId: string): PropertyAccess | null => {
  const property = propertiesData.find(p => p.userId === userId);
  if (!property) return null;
  return transformDates(property);
};

// Get all properties
export const getAllProperties = () => {
  return transformDates(propertiesData);
};

// Get all incidents
export const getAllIncidents = (): Incident[] => {
  return transformDates(incidentsData);
};

// Get incidents by status
export const getIncidentsByStatus = (status: Incident['status']): Incident[] => {
  const incidents = incidentsData.filter(i => i.status === status);
  return transformDates(incidents);
};

// Get active incidents (not resolved or false alarm)
export const getActiveIncidents = (): Incident[] => {
  const incidents = incidentsData.filter(
    i => i.status !== 'resolved' && i.status !== 'false-alarm'
  );
  return transformDates(incidents);
};

// Get incident by ID
export const getIncidentById = (incidentId: string): Incident | null => {
  const incident = incidentsData.find(i => i.id === incidentId);
  if (!incident) return null;
  return transformDates(incident);
};

// Get all responders
export const getAllResponders = (): Responder[] => {
  return transformDates(respondersData);
};

// Get responders by status
export const getRespondersByStatus = (status: Responder['status']): Responder[] => {
  const responders = respondersData.filter(r => r.status === status);
  return transformDates(responders);
};

// Get available responders
export const getAvailableResponders = (): Responder[] => {
  return getRespondersByStatus('available');
};

// Get responder by ID
export const getResponderById = (responderId: string): Responder | null => {
  const responder = respondersData.find(r => r.id === responderId);
  if (!responder) return null;
  return transformDates(responder);
};

// Get all activities
export const getAllActivities = (): Activity[] => {
  return transformDates(activitiesData);
};

// Get recent activities (last N)
export const getRecentActivities = (limit: number = 20): Activity[] => {
  const activities = transformDates(activitiesData);
  return activities.slice(0, limit);
};

// Get activities by type
export const getActivitiesByType = (type: Activity['type']): Activity[] => {
  const activities = activitiesData.filter(a => a.type === type);
  return transformDates(activities);
};

// Calculate dashboard statistics
export const calculateDashboardStats = () => {
  const allIncidents = transformDates(incidentsData);
  const allResponders = transformDates(respondersData);
  const today = new Date().toDateString();

  const resolvedToday = allIncidents.filter(i =>
    i.resolvedAt && new Date(i.resolvedAt).toDateString() === today
  ).length;

  const falseAlarmsToday = allIncidents.filter(i =>
    i.status === 'false-alarm' &&
    i.resolvedAt &&
    new Date(i.resolvedAt).toDateString() === today
  ).length;

  return {
    totalUsers: usersData.length,
    activeProtected: usersData.filter(u => u.plan.status === 'protected').length,
    pausedAccounts: usersData.filter(u => u.plan.status === 'paused').length,
    tripMode: usersData.filter(u => u.plan.status === 'trip-mode').length,
    totalResponders: allResponders.length,
    availableResponders: allResponders.filter(r => r.status === 'available').length,
    onCallResponders: allResponders.filter(r => r.status === 'on-call').length,
    dispatchedResponders: allResponders.filter(r => r.status === 'dispatched').length,
    activeIncidents: allIncidents.filter(i => i.status !== 'resolved' && i.status !== 'false-alarm').length,
    resolvedToday,
    averageResponseTime: '8.2 min', // Could be calculated from incident data
    falseAlarms: falseAlarmsToday
  };
};

// Export default data set for current user (LW-US-8472)
export const getCurrentUserData = () => {
  const userId = 'LW-US-8472';
  const user = getUserById(userId);
  const pets = getPetsByUserId(userId);
  const people = getContactsByUserId(userId);
  const property = getPropertyByUserId(userId);

  return {
    user,
    pets,
    people,
    property
  };
};

// Export all data for admin view
export const getAllData = () => {
  return {
    users: getAllUsers(),
    pets: getAllPets(),
    contacts: getAllContacts(),
    properties: getAllProperties(),
    incidents: getAllIncidents(),
    responders: getAllResponders(),
    activities: getAllActivities(),
    dashboardStats: calculateDashboardStats()
  };
};
