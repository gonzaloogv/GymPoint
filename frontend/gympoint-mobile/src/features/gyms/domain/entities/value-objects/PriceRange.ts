// src/features/gyms/domain/entities/value-objects/PriceRange.ts
export type PriceRange =
  | { kind: 'free' }
  | { kind: 'range'; min: number; max: number }
  | { kind: 'min'; min: number };
