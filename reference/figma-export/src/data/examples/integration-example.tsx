/**
 * Example: How to integrate mock data with AppContext
 *
 * This file demonstrates how to use the mock data loader
 * to initialize the AppContext with fixture data.
 */

import { useState, createContext, useContext, ReactNode } from 'react';
import {
  getCurrentUserData,
  getAllIncidents,
  getAllResponders,
  getAllActivities,
  calculateDashboardStats
} from '../mockDataLoader';

// Example 1: Initialize AppContext with mock data
export function ExampleAppProvider({ children }: { children: ReactNode }) {
  // Load initial data from fixtures
  const currentUserData = getCurrentUserData();

  const [user, setUser] = useState(currentUserData.user);
  const [pets, setPets] = useState(currentUserData.pets);
  const [people, setPeople] = useState(currentUserData.people);
  const [property, setProperty] = useState(currentUserData.property);

  const [incidents, setIncidents] = useState(getAllIncidents());
  const [responders, setResponders] = useState(getAllResponders());
  const [activities, setActivities] = useState(getAllActivities());
  const [dashboardStats, setDashboardStats] = useState(calculateDashboardStats());

  // ... rest of provider implementation

  return null; // Implementation here
}

// Example 2: Component using mock data directly
export function ExampleIncidentsList() {
  const [incidents] = useState(getAllIncidents());

  return (
    <div>
      <h2>All Incidents</h2>
      {incidents.map(incident => (
        <div key={incident.id}>
          <h3>{incident.id}</h3>
          <p>User: {incident.userName}</p>
          <p>Status: {incident.status}</p>
          <p>Priority: {incident.priority}</p>
          <p>Triggered: {incident.triggeredAt.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// Example 3: Admin Dashboard with real-time stats
export function ExampleAdminDashboard() {
  const [stats] = useState(calculateDashboardStats());

  return (
    <div>
      <h2>Dashboard Statistics</h2>
      <div>Total Users: {stats.totalUsers}</div>
      <div>Active Protected: {stats.activeProtected}</div>
      <div>Active Incidents: {stats.activeIncidents}</div>
      <div>Available Responders: {stats.availableResponders}</div>
      <div>Resolved Today: {stats.resolvedToday}</div>
      <div>False Alarms: {stats.falseAlarms}</div>
    </div>
  );
}

// Example 4: Responder Map with location data
export function ExampleResponderMap() {
  const [responders] = useState(getAllResponders());
  const availableResponders = responders.filter(r => r.status === 'available');

  return (
    <div>
      <h2>Available Responders</h2>
      {availableResponders.map(responder => (
        <div key={responder.id}>
          <h3>{responder.name}</h3>
          <p>Location: {responder.location.address}</p>
          <p>Rating: {responder.rating} ⭐</p>
          <p>Certifications: {responder.certifications.join(', ')}</p>
          <p>Last Active: {responder.lastActive.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// Example 5: User Profile with pets and contacts
export function ExampleUserProfile() {
  const { user, pets, people, property } = getCurrentUserData();

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>Email: {user?.email}</p>
      <p>Phone: {user?.phone}</p>

      <h3>Pets ({pets.length})</h3>
      {pets.map(pet => (
        <div key={pet.id}>
          <p>{pet.name} - {pet.species}</p>
        </div>
      ))}

      <h3>Contacts ({people.length})</h3>
      {people.map(person => (
        <div key={person.id}>
          <p>{person.name} - {person.relationship}</p>
          <p>Roles: {person.roles.join(', ')}</p>
        </div>
      ))}

      <h3>Property</h3>
      <p>{property?.address}</p>
      <p>{property?.city}, {property?.state} {property?.postcode}</p>
    </div>
  );
}
