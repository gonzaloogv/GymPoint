/**
 * Gyms Feature - Public API
 * Clean Architecture (3 layers)
 * 
 * Only exports presentation layer (UI, hooks, utils, types)
 * Domain and Data layers are internal implementation details
 */

export * from './presentation';
export * from './domain/constants/filters';
export * from './domain/constants/map';
