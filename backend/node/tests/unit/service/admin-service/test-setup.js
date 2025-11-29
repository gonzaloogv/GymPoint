const { Op } = require('sequelize');

jest.mock('../../../../config/database', () => ({
  query: jest.fn(),
}));

jest.mock('../../../../models', () => ({
  Account: {
    count: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  UserProfile: {
    count: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
  },
  AdminProfile: {
    count: jest.fn(),
  },
  Role: jest.fn(),
  AccountRole: jest.fn(),
  TokenLedger: {
    findAndCountAll: jest.fn(),
  },
}));

jest.mock('../../../../websocket/events/event-emitter', () => ({
  appEvents: {
    emit: jest.fn(),
  },
  EVENTS: {
    USER_ACCOUNT_STATUS_UPDATED: 'user:account_status_updated',
  },
}));

jest.mock('../../../../models/RefreshToken', () => ({
  update: jest.fn(),
}));

const sequelize = require('../../../../config/database');
const {
  Account,
  UserProfile,
  AdminProfile,
  Role,
  TokenLedger,
} = require('../../../../models');
const RefreshToken = require('../../../../models/RefreshToken');
const { appEvents, EVENTS } = require('../../../../websocket/events/event-emitter');
const adminService = require('../../../../services/admin-service');

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

module.exports = {
  Op,
  sequelize,
  Account,
  UserProfile,
  AdminProfile,
  Role,
  TokenLedger,
  RefreshToken,
  appEvents,
  EVENTS,
  adminService,
};
