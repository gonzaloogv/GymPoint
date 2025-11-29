/**
 * Test Setup para gym-request-service
 * Centraliza mocks de dependencias
 */

// Mock de GymRequest model
const mockGymRequest = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

// Mock de Amenity model
const mockAmenity = {
  findAll: jest.fn(),
};

// Mock de gymService
const mockGymService = {
  createGym: jest.fn(),
};

// Mock de gymScheduleRepository
const mockGymScheduleRepository = {
  createSchedule: jest.fn(),
};

// Mock de appEvents
const mockAppEvents = {
  emit: jest.fn(),
};

const mockEVENTS = {
  GYM_REQUEST_CREATED: 'GYM_REQUEST_CREATED',
  GYM_REQUEST_APPROVED: 'GYM_REQUEST_APPROVED',
  GYM_REQUEST_REJECTED: 'GYM_REQUEST_REJECTED',
};

// Mock de errors
const mockErrors = {
  NotFoundError: class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundError';
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
    }
  },
};

// Setup de mocks
jest.mock('../../../../models/GymRequest', () => mockGymRequest);
jest.mock('../../../../models', () => ({
  Amenity: mockAmenity,
}));
jest.mock('../../../../services/gym-service', () => mockGymService);
jest.mock('../../../../infra/db/repositories', () => ({
  gymScheduleRepository: mockGymScheduleRepository,
}));
jest.mock('../../../../utils/errors', () => mockErrors);
jest.mock('../../../../websocket/events/event-emitter', () => ({
  appEvents: mockAppEvents,
  EVENTS: mockEVENTS,
}));

// Importar servicio después de los mocks
const gymRequestService = require('../../../../services/gym-request-service');

module.exports = {
  mockGymRequest,
  mockAmenity,
  mockGymService,
  mockGymScheduleRepository,
  mockAppEvents,
  mockEVENTS,
  mockErrors,
  gymRequestService,
};
