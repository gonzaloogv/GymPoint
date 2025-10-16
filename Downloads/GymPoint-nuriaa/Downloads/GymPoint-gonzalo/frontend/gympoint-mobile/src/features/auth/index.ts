/**
 * Auth Feature - Public API
 * Clean Architecture (3 layers)
 *
 * Only exports presentation layer (UI components, hooks, stores)
 * Domain and Data layers are internal implementation details
 */

export { useAuthStore, LoginScreen, RegisterScreen } from './presentation';
