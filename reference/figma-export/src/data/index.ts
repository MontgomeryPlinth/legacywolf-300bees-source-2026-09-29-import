/**
 * Data Layer Index
 * Central export point for all mock data and data utilities
 */

export * from './mockDataLoader';

// Re-export fixtures for direct access if needed
export { default as usersFixture } from './fixtures/users.json';
export { default as petsFixture } from './fixtures/pets.json';
export { default as contactsFixture } from './fixtures/contacts.json';
export { default as propertiesFixture } from './fixtures/properties.json';
export { default as incidentsFixture } from './fixtures/incidents.json';
export { default as respondersFixture } from './fixtures/responders.json';
export { default as activitiesFixture } from './fixtures/activities.json';
