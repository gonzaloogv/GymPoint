const paymentService = require('../services/payment-service');
const { ValidationError } = require('../utils/errors');

describe('payment-service helper utilities', () => {
  const {
    normalizeSubscriptionType,
    mapPlanFromSubscription,
    calculateEndDate
  } = paymentService.__private;

  it('normalizes subscription types from spanish values', () => {
    expect(normalizeSubscriptionType('mensual')).toBe('MONTHLY');
    expect(normalizeSubscriptionType('SEMANAL')).toBe('WEEKLY');
    expect(normalizeSubscriptionType('Anual')).toBe('ANNUAL');
  });

  it('throws validation error for unsupported subscription type', () => {
    expect(() => normalizeSubscriptionType('invalid')).toThrow(ValidationError);
  });

  it('maps subscription type to legacy plan', () => {
    expect(mapPlanFromSubscription('MONTHLY')).toBe('MENSUAL');
    expect(mapPlanFromSubscription('WEEKLY')).toBe('SEMANAL');
    expect(mapPlanFromSubscription('ANNUAL')).toBe('ANUAL');
  });

  it('calculates finish date based on subscription type', () => {
    const baseDate = new Date('2025-01-01T00:00:00Z');

    const monthly = calculateEndDate('MONTHLY', baseDate);
    expect(monthly.getUTCMonth()).toBe(1);

    const weekly = calculateEndDate('WEEKLY', baseDate);
    expect(weekly.getUTCDate()).toBe(8);

    const annual = calculateEndDate('ANNUAL', baseDate);
    expect(annual.getUTCFullYear()).toBe(2026);
  });
});

